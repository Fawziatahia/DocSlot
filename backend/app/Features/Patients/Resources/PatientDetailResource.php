<?php

namespace App\Features\Patients\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PatientDetailResource extends JsonResource
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
        return [
            'id' => $this->id,
            'public_id' => $this->public_id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
                'phone' => $this->user->phone,
                'avatar' => $this->user->avatarUrl(),
            ],
            'date_of_birth' => $this->date_of_birth?->format('Y-m-d'),
            'gender' => $this->gender,
            'address' => $this->when($this->detailed, $this->address),
            'blood_group' => $this->blood_group,
            'emergency_contact' => $this->when($this->detailed, $this->emergency_contact),
            'emergency_contact_name' => $this->when($this->detailed, $this->emergency_contact_name),
            'status' => $this->status,
            'created_at' => $this->created_at,
            'updated_at' => $this->when($this->detailed, $this->updated_at),
        ];
    }
}
