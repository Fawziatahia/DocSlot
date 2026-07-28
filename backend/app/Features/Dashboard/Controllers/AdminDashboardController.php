<?php

namespace App\Features\Dashboard\Controllers;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController
{
    use ApiResponseTrait;

    public function __invoke(Request $request): JsonResponse
    {
        // TODO: Replace with real models once migrations exist
        $totalDoctors = Doctor::count();
        $totalPatients = Patient::count();

        return $this->success([
            'total_doctors' => $totalDoctors,
            'active_doctors' => Doctor::where('status', 'active')->count(),
            'total_patients' => $totalPatients,
            'message' => 'Admin dashboard — to be fully implemented with Appointments feature.',
        ]);
    }
}
