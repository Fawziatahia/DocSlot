<?php

namespace App\Features\Doctors\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorDetailResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
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
            'license_number' => $this->license_number,
            'qualifications' => $this->qualifications,
            'bio' => $this->bio,
            'consultation_fee' => (float) $this->consultation_fee,
            'avg_rating' => (float) $this->avg_rating,
            'total_reviews' => $this->total_reviews,
            'reviews_enabled' => $this->reviews_enabled,
            'status' => $this->status,
            'schedules' => DoctorScheduleResource::collection($this->whenLoaded('schedules')),
            'created_at' => $this->created_at,
        ];
    }
}
