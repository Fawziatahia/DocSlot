<?php

namespace App\Features\Prescriptions\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePrescriptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'patient_id' => ['required', 'string', 'exists:patients,public_id'],
            'appointment_id' => ['nullable', 'integer', 'exists:appointments,id'],
            'diagnosis' => ['required', 'string', 'max:2000'],
            'notes' => ['nullable', 'string', 'max:5000'],
            'medications' => ['required', 'array', 'min:1'],
            'medications.*.medication_name' => ['required', 'string', 'max:255'],
            'medications.*.dosage' => ['required', 'string', 'max:100'],
            'medications.*.frequency' => ['required', 'string', 'max:100'],
            'medications.*.duration' => ['nullable', 'string', 'max:100'],
            'medications.*.instructions' => ['nullable', 'string', 'max:500'],
        ];
    }
}
