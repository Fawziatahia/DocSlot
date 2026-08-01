<?php

namespace App\Features\Doctors\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorDetailResource extends JsonResource
{
    protected bool $detailed = false;

    public function detailed(bool $detailed = true): static
    {
        $this->detailed = $detailed;

        return $this;
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $viewer = $request->user('sanctum');
        $canViewSensitive = $viewer && ($viewer->isAdmin() || ($viewer->isDoctor() && $viewer->doctor?->id === $this->id));

        return [
            'public_id' => $this->public_id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->when($canViewSensitive, $this->user->email),
                'phone' => $this->when($canViewSensitive, $this->user->phone),
                'avatar' => $this->user->avatar,
            ],
            'specialization' => $this->whenLoaded('specialization', fn () => [
                'id' => $this->specialization->id,
                'name' => $this->specialization->name,
            ]),
            'department' => $this->whenLoaded('department', fn () => [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ]),
            'license_number' => $this->when($canViewSensitive, $this->license_number),
            'qualifications' => $this->qualifications,
            'bio' => $this->bio,
            'consultation_fee' => (float) $this->consultation_fee,
            'avg_rating' => (float) $this->avg_rating,
            'total_reviews' => $this->total_reviews,
            'reviews_enabled' => $this->reviews_enabled,
            'status' => $this->status,
            'schedules' => $this->when($this->detailed, fn () => DoctorScheduleResource::collection($this->whenLoaded('schedules'))),
            'created_at' => $this->when($this->detailed, $this->created_at),
        ];
    }
}
