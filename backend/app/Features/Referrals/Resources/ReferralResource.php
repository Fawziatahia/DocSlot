<?php

namespace App\Features\Referrals\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReferralResource extends JsonResource
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
            'referring_doctor' => $this->whenLoaded('referringDoctor', fn () => [
                'id' => $this->referringDoctor->id,
                'name' => $this->referringDoctor->user->name,
            ]),
            'receiving_doctor' => $this->whenLoaded('receivingDoctor', fn () => [
                'id' => $this->receivingDoctor->id,
                'name' => $this->receivingDoctor->user->name,
            ]),
            'note' => $this->note,
            'created_at' => $this->created_at,
        ];
    }
}
