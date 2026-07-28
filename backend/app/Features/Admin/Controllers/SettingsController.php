<?php

namespace App\Features\Admin\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SettingsController
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        // TODO: Implement persistent settings (store in DB or config)
        return $this->success([
            'app_name' => config('app.name'),
            'appointment_cutoff_minutes' => 120,
            'max_reschedule_count' => 2,
            'reminder_hours_before' => 24,
            'default_slot_duration' => 30,
            'default_max_daily_appointments' => 10,
        ]);
    }

    public function update(Request $request): JsonResponse
    {
        // TODO: Implement persistent settings storage
        $validated = $request->validate([
            'appointment_cutoff_minutes' => ['nullable', 'integer', 'min:15', 'max:1440'],
            'max_reschedule_count' => ['nullable', 'integer', 'min:0', 'max:10'],
            'reminder_hours_before' => ['nullable', 'integer', 'min:1', 'max:168'],
            'default_slot_duration' => ['nullable', 'integer', 'min:15', 'max:120'],
            'default_max_daily_appointments' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        return $this->success($validated, 'Settings updated successfully.');
    }
}
