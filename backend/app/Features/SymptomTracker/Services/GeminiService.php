<?php

namespace App\Features\SymptomTracker\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Thin client for Google's Gemini Interactions API (generativelanguage.googleapis.com/v1beta/interactions).
 * This is a very recently GA'd API surface, so the SSE event shape here (`step.delta` events
 * carrying `delta.type === 'text'`) is based on Google's current docs, not a stable SDK — if
 * Google adjusts the event shape, only extractTextDelta() below should need updating.
 */
class GeminiService
{
    private const ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/interactions';

    private const API_REVISION = '2026-05-20';

    private string $apiKey;

    private string $model;

    public function __construct()
    {
        $this->apiKey = (string) config('services.gemini.key');
        $this->model = (string) config('services.gemini.model', 'gemini-3.6-flash');
    }

    /**
     * Streams the model's answer to $prompt, invoking $onChunk with each text
     * delta as it arrives. Returns the full accumulated answer once done.
     */
    public function streamText(string $prompt, callable $onChunk): string
    {
        if ($this->apiKey === '') {
            throw new RuntimeException('Gemini API key is not configured.');
        }

        $response = Http::withHeaders([
            'x-goog-api-key' => $this->apiKey,
            'Content-Type' => 'application/json',
            'Api-Revision' => self::API_REVISION,
        ])
            ->withOptions(['stream' => true])
            ->timeout(60)
            ->post(self::ENDPOINT.'?alt=sse', [
                'model' => $this->model,
                'input' => $prompt,
                'stream' => true,
            ]);

        if ($response->failed()) {
            throw new RuntimeException("Gemini request failed with status {$response->status()}: {$response->body()}");
        }

        $body = $response->toPsrResponse()->getBody();
        $buffer = '';
        $full = '';

        while (! $body->eof()) {
            $buffer .= $body->read(1024);

            while (($eventEnd = strpos($buffer, "\n\n")) !== false) {
                $event = substr($buffer, 0, $eventEnd);
                $buffer = substr($buffer, $eventEnd + 2);

                foreach (explode("\n", $event) as $line) {
                    if (! str_starts_with($line, 'data:')) {
                        continue;
                    }

                    $json = trim(substr($line, 5));

                    if ($json === '' || $json === '[DONE]') {
                        continue;
                    }

                    $delta = $this->extractTextDelta(json_decode($json, true));

                    if ($delta !== '') {
                        $full .= $delta;
                        $onChunk($delta);
                    }
                }
            }
        }

        return $full;
    }

    private function extractTextDelta(mixed $payload): string
    {
        if (! is_array($payload)) {
            return '';
        }

        if (($payload['event_type'] ?? null) === 'step.delta' && ($payload['delta']['type'] ?? null) === 'text') {
            return (string) ($payload['delta']['text'] ?? '');
        }

        // Defensive fallback for other possible response shapes.
        return (string) ($payload['output_text_delta'] ?? '');
    }
}
