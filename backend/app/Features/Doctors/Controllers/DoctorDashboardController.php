<?php

namespace App\Features\Doctors\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorDashboardController
{
    use ApiResponseTrait;

    /**
     * GET /api/dashboard/doctor
     */
    public function __invoke(Request $request): JsonResponse
    {
        // TODO: Implement when Dashboard feature is built
        return $this->success([
            'message' => 'Doctor dashboard — to be implemented.',
        ]);
    }
}
