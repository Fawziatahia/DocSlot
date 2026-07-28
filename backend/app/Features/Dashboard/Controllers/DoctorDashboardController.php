<?php

namespace App\Features\Dashboard\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorDashboardController
{
    use ApiResponseTrait;

    public function __invoke(Request $request): JsonResponse
    {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return $this->error('Doctor profile not found.', 404);
        }

        // TODO: Add appointment counts when Appointments feature is built
        return $this->success([
            'doctor_id' => $doctor->id,
            'today_appointments' => 0,
            'total_appointments' => 0,
            'pending_approvals' => 0,
            'message' => 'Doctor dashboard — to be fully implemented.',
        ]);
    }
}
