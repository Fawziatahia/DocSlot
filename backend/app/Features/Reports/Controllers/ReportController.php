<?php

namespace App\Features\Reports\Controllers;

use App\Features\Reports\Services\ReportService;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReportController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ReportService $reportService,
    ) {}

    public function appointments(Request $request): JsonResponse
    {
        $data = $this->reportService->appointmentReport(
            $request->input('from'),
            $request->input('to'),
        );

        return $this->success($data);
    }

    public function revenue(Request $request): JsonResponse
    {
        $data = $this->reportService->revenueReport(
            $request->input('from'),
            $request->input('to'),
        );

        return $this->success($data);
    }

    public function doctors(Request $request): JsonResponse
    {
        $data = $this->reportService->doctorReport(
            $request->input('from'),
            $request->input('to'),
        );

        return $this->success($data);
    }

    public function patients(Request $request): JsonResponse
    {
        $data = $this->reportService->patientReport(
            $request->input('from'),
            $request->input('to'),
        );

        return $this->success($data);
    }

    public function prescriptions(Request $request): JsonResponse
    {
        $data = $this->reportService->prescriptionReport(
            $request->input('from'),
            $request->input('to'),
        );

        return $this->success($data);
    }
}
