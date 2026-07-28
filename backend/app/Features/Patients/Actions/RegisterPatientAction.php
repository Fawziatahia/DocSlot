<?php

namespace App\Features\Patients\Actions;

use App\Features\Patients\DTOs\PatientData;
use App\Features\Patients\Services\PatientService;
use App\Models\Patient;

class RegisterPatientAction
{
    public function __construct(
        private readonly PatientService $patientService,
    ) {}

    public function execute(PatientData $data): Patient
    {
        return $this->patientService->createPatient($data->toArray());
    }
}
