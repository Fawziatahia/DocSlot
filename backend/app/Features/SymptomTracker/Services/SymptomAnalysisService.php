<?php

namespace App\Features\SymptomTracker\Services;

use App\Features\SymptomTracker\Resources\SymptomCheckResource;
use App\Models\Specialization;
use App\Models\SymptomCheck;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Throwable;

class SymptomAnalysisService
{
    private const URGENCY_LEVELS = ['emergency', 'high', 'medium', 'low'];

    public function __construct(
        private readonly GeminiService $geminiService,
    ) {}

    /**
     * Streams AI-generated triage guidance for $symptoms directly to the open
     * SSE response (`data: {"delta": "..."}` chunks), then, once the answer is
     * complete, persists it and emits a final `event: done` message carrying
     * the saved SymptomCheckResource.
     */
    public function analyzeAndStream(int $patientId, string $symptoms): void
    {
        $specializations = Specialization::where('is_active', true)->get(['id', 'name']);

        try {
            $fullText = $this->geminiService->streamText(
                $this->buildPrompt($symptoms, $specializations),
                fn (string $delta) => $this->emit(['delta' => $delta]),
            );
        } catch (Throwable $e) {
            Log::error('Gemini symptom check failed.', ['error' => $e->getMessage()]);
            $this->emit(['message' => "Sorry, we couldn't analyze your symptoms right now. Please try again shortly."], 'error');

            return;
        }

        $specialization = $this->matchSpecialization($fullText, $specializations);

        $check = SymptomCheck::create([
            'patient_id' => $patientId,
            'symptoms' => $symptoms,
            'ai_response' => $fullText,
            'specialization_id' => $specialization?->id,
            'urgency' => $this->matchUrgency($fullText),
        ]);

        $this->emit((new SymptomCheckResource($check->load('specialization')))->resolve(), 'done');
    }

    private function buildPrompt(string $symptoms, Collection $specializations): string
    {
        $list = $specializations->pluck('name')->implode(', ');
        $safeSymptoms = str_replace('"', "'", $symptoms);

        return <<<PROMPT
            You are a triage assistant for DocSlot, a doctor-appointment booking platform. Never provide a definitive diagnosis. Be brief - the app shows matching doctors right below your answer, so skip self-care tips and lengthy explanations.

            A patient describes these symptoms: "{$safeSymptoms}"

            Respond in under 40 words total, plain language, with exactly:
            1. One short, empathetic sentence about what these symptoms could relate to.
            2. A line formatted exactly as "Recommended specialist: <name>", choosing the single best match ONLY from this list: {$list}.
            3. A line formatted exactly as "Urgency: <level>", where <level> is one of: low, medium, high, emergency. Use "emergency" only when the symptoms could need immediate ER care, and tell the patient to seek emergency care right away in that case.
            PROMPT;
    }

    private function matchSpecialization(string $text, Collection $specializations): ?Specialization
    {
        return $specializations->first(fn (Specialization $s) => stripos($text, $s->name) !== false);
    }

    private function matchUrgency(string $text): ?string
    {
        foreach (self::URGENCY_LEVELS as $level) {
            if (preg_match('/urgency:\s*'.$level.'/i', $text)) {
                return $level;
            }
        }

        return null;
    }

    private function emit(array $payload, string $event = 'message'): void
    {
        if ($event !== 'message') {
            echo "event: {$event}\n";
        }

        echo 'data: '.json_encode($payload)."\n\n";

        if (ob_get_level() > 0) {
            @ob_flush();
        }

        flush();
    }
}
