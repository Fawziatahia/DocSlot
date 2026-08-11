<?php

namespace App\Features\SymptomTracker\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use App\Features\SymptomTracker\Requests\StoreSymptomCheckRequest;
use App\Features\SymptomTracker\Resources\SymptomCheckResource;
use App\Features\SymptomTracker\Services\SymptomAnalysisService;
use App\Models\SymptomCheck;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SymptomTrackerController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly SymptomAnalysisService $symptomAnalysisService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);

        $checks = SymptomCheck::with('specialization')
            ->where('patient_id', $request->user()->patient->id)
            ->latest()
            ->paginate($perPage);

        return $this->paginated($checks, SymptomCheckResource::class);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $check = SymptomCheck::with('specialization')->findOrFail($id);

        if ($check->patient_id !== $request->user()->patient->id) {
            return $this->error('Forbidden.', 403);
        }

        return $this->success(new SymptomCheckResource($check));
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $check = SymptomCheck::findOrFail($id);

        if ($check->patient_id !== $request->user()->patient->id) {
            return $this->error('Forbidden.', 403);
        }

        $check->delete();

        return $this->noContent();
    }

    public function store(StoreSymptomCheckRequest $request): StreamedResponse
    {
        $patientId = $request->user()->patient->id;
        $symptoms = $request->validated('symptoms');

        return response()->stream(function () use ($patientId, $symptoms) {
            $this->symptomAnalysisService->analyzeAndStream($patientId, $symptoms);
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'Connection' => 'keep-alive',
            'X-Accel-Buffering' => 'no',
        ]);
    }
}
