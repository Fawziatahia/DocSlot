<?php

namespace App\Features\Auth\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'avatar' => $this->avatar,
            'role' => $this->tyroRoleSlugs()[0] ?? null,
            'is_active' => $this->is_active,
            'must_change_password' => $this->must_change_password,
            'doctor' => $this->doctor ? [
                'id' => $this->doctor->id,
                'public_id' => $this->doctor->public_id,
            ] : null,
            'patient' => $this->patient ? [
                'id' => $this->patient->id,
                'public_id' => $this->patient->public_id,
            ] : null,
            'created_at' => $this->created_at,
        ];
    }
}
