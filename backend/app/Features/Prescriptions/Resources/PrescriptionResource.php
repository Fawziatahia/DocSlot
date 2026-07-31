<?php

namespace App\Features\Prescriptions\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PrescriptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => $this->whenLoaded('patient', fn () => [
                'id' => $this->patient->id,
                'public_id' => $this->patient->public_id,
                'name' => $this->patient->user->name,
            ]),
            'doctor' => $this->whenLoaded('doctor', fn () => [
                'id' => $this->doctor->id,
                'public_id' => $this->doctor->public_id,
                'name' => $this->doctor->user->name,
            ]),
            'appointment_id' => $this->appointment_id,
            'diagnosis' => $this->diagnosis,
            'notes' => $this->notes,
            'status' => $this->status,
            'medications' => $this->whenLoaded('medications', fn () =>
                $this->medications->map(fn ($m) => [
                    'id' => $m->id,
                    'medication_name' => $m->medication_name,
                    'dosage' => $m->dosage,
                    'frequency' => $m->frequency,
                    'duration' => $m->duration,
                    'instructions' => $m->instructions,
                ])
            ),
            'created_at' => $this->created_at,
        ];
    }
}
