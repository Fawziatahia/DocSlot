<?php

namespace App\Features\SymptomTracker\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SymptomCheckResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'symptoms' => $this->symptoms,
            'ai_response' => $this->ai_response,
            'urgency' => $this->urgency,
            'specialization' => $this->whenLoaded('specialization', fn () => [
                'id' => $this->specialization->id,
                'name' => $this->specialization->name,
            ]),
            'created_at' => $this->created_at,
        ];
    }
}
