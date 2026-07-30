<?php

namespace App\Features\Referrals\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReferPatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'doctor_id' => ['required', 'integer', 'exists:doctors,id'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
