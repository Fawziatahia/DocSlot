<?php

namespace App\Features\MedicalRecords\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateMedicalRecordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'record_type' => ['nullable', 'string', 'in:lab_result,imaging,note,report,other'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'file_path' => ['nullable', 'string', 'max:500'],
            'file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png,webp', 'max:10240'],
            'remove_file' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'Attach a PDF or an image (JPG, PNG or WEBP).',
            'file.max' => 'The attachment must be 10 MB or smaller.',
        ];
    }
}
