<?php

namespace App\Features\Doctors\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        // Admin can update any doctor; a doctor can update only their own profile
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('doctor')) {
            $doctor = \App\Models\Doctor::where('user_id', $user->id)->firstOrFail();

            return $this->route('id') === $doctor->public_id;
        }

        return false;
    }

    public function rules(): array
    {
        return [
            'specialization_id' => ['sometimes', 'integer', 'exists:specializations,id'],
            'department_id' => ['sometimes', 'integer', 'exists:departments,id'],
            'qualifications' => ['nullable', 'string', 'max:1000'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'reviews_enabled' => ['sometimes', 'boolean'],
        ];
    }
}
