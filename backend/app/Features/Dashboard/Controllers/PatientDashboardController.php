<?php

namespace App\Features\Dashboard\Controllers;

use App\Features\Dashboard\Services\DashboardService;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientDashboardController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        $patient = $request->user()->patient;

        if (!$patient) {
            return $this->error('Patient profile not found.', 404);
        }

        return $this->success($this->dashboardService->patientStats($patient->id));
    }
}
