<?php

namespace App\Features\Appointments\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentResource extends JsonResource
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
            'appointment_date' => $this->appointment_date?->format('Y-m-d'),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'reason' => $this->reason,
            'status' => $this->status,
            'cancellation_reason' => $this->cancellation_reason,
            'reschedule_count' => $this->reschedule_count,
            'created_at' => $this->created_at,
        ];
    }
}
