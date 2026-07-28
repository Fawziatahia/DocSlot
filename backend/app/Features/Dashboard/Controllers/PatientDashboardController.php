<?php

namespace App\Features\Dashboard\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientDashboardController
{
    use ApiResponseTrait;

    public function __invoke(Request $request): JsonResponse
    {
        $patient = $request->user()->patient;

        if (!$patient) {
            return $this->error('Patient profile not found.', 404);
        }

        // TODO: Add appointment counts when Appointments feature is built
        return $this->success([
            'patient_id' => $patient->id,
            'upcoming_appointments' => 0,
            'total_appointments' => 0,
            'message' => 'Patient dashboard — to be fully implemented.',
        ]);
    }
}
