<?php

namespace App\Features\Patients\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DoctorSearchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'q' => ['nullable', 'string', 'max:255'],
            'specialization_id' => ['nullable', 'integer', 'exists:specializations,id'],
            'department_id' => ['nullable', 'integer', 'exists:departments,id'],
            'min_fee' => ['nullable', 'numeric', 'min:0'],
            'max_fee' => ['nullable', 'numeric', 'min:0', 'gte:min_fee'],
            'min_rating' => ['nullable', 'numeric', 'min:0', 'max:5'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ];
    }
}
