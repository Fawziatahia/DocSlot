<?php

namespace App\Features\Ratings\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RatingResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => $this->whenLoaded('patient', fn () => [
                'id' => $this->patient->id,
                'name' => $this->patient->user->name,
            ]),
            'appointment_id' => $this->appointment_id,
            'score' => $this->score,
            'comment' => $this->comment,
            'created_at' => $this->created_at,
        ];
    }
}
