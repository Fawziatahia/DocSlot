<?php

namespace App\Features\Doctors\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateDoctorRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'specialization_id' => ['sometimes', 'integer', 'exists:specializations,id'],
            'department_id' => ['sometimes', 'integer', 'exists:departments,id'],
            'qualifications' => ['nullable', 'string', 'max:1000'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'consultation_fee' => ['nullable', 'numeric', 'min:0'],
            'reviews_enabled' => ['sometimes', 'boolean'],
            'avatar' => ['nullable', 'file', 'mimes:jpeg,jpg,png,webp', 'max:2048'],
            'remove_avatar' => ['sometimes', 'boolean'],
        ];
    }
}
