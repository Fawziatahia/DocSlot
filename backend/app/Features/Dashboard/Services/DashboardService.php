<?php

namespace App\Features\Dashboard\Services;

use App\Models\Doctor;
use App\Models\Patient;

class DashboardService
{
    /**
     * Get admin dashboard stats.
     *
     * @return array<string, mixed>
     */
    public function adminStats(): array
    {
        return [
            'total_doctors' => Doctor::count(),
            'active_doctors' => Doctor::where('status', 'active')->count(),
            'total_patients' => Patient::count(),
            // TODO: Add appointment stats when Appointments feature is built
        ];
    }
}
