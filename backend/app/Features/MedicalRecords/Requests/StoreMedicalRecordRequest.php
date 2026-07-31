<?php

namespace App\Features\MedicalRecords\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreMedicalRecordRequest extends FormRequest
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
            'record_type' => ['required', 'string', 'in:lab_result,imaging,note,report,other'],
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'file_path' => ['nullable', 'string', 'max:500'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
