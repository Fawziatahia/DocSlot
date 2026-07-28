<?php

namespace App\Features\Patients\Requests;

use App\Models\Doctor;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();

        // Admin can update any patient
        if ($user->hasRole('admin')) {
            return true;
        }

        // Doctor can update patients (their medical info)
        if ($user->hasRole('doctor')) {
            return true;
        }

        // Patient can only update their own record
        if ($user->hasRole('patient')) {
            $patient = $user->patient;
            return $patient && (int) $this->route('id') === $patient->id;
        }

        return false;
    }

    public function rules(): array
    {
        return [
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'address' => ['nullable', 'string', 'max:500'],
            'blood_group' => ['nullable', 'string', 'max:5'],
            'emergency_contact' => ['nullable', 'string', 'max:20'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
