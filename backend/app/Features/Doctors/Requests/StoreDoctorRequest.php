<?php

namespace App\Features\Doctors\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreDoctorRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['nullable', 'string', 'max:20'],
            'specialization_id' => ['required', 'integer', 'exists:specializations,id'],
            'department_id' => ['required', 'integer', 'exists:departments,id'],
            'license_number' => ['required', 'string', 'max:50', 'unique:doctors,license_number'],
            'qualifications' => ['nullable', 'string', 'max:1000'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
        ];
    }
}
