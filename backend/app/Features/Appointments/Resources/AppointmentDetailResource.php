<?php

namespace App\Features\Appointments\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppointmentDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'patient' => $this->whenLoaded('patient', fn () => [
                'id' => $this->patient->id,
                'name' => $this->patient->user->name,
                'email' => $this->patient->user->email,
                'phone' => $this->patient->user->phone,
            ]),
            'doctor' => $this->whenLoaded('doctor', fn () => [
                'id' => $this->doctor->id,
                'name' => $this->doctor->user->name,
                'specialization' => $this->doctor->specialization?->name,
                'reviews_enabled' => $this->doctor->reviews_enabled,
            ]),
            'appointment_date' => $this->appointment_date?->format('Y-m-d'),
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'reason' => $this->reason,
            'status' => $this->status,
            'cancellation_reason' => $this->cancellation_reason,
            'reschedule_count' => $this->reschedule_count,
            'rated' => (bool) $this->rating,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
