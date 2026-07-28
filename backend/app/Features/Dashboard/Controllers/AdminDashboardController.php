<?php

namespace App\Features\Dashboard\Controllers;

use App\Features\Dashboard\Services\DashboardService;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminDashboardController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly DashboardService $dashboardService,
    ) {}

    public function __invoke(Request $request): JsonResponse
    {
        return $this->success($this->dashboardService->adminStats());
    }
}
