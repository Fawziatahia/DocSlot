<?php

namespace App\Features\Admin\Controllers;

use App\Features\Admin\Requests\UpdateSettingsRequest;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;

class SettingsController
{
    use ApiResponseTrait;

    public function index(): JsonResponse
    {
        $setting = Setting::current();

        return $this->success([
            ...$setting->toArray(),
            'effective_max_booking_date' => $setting->effectiveMaxBookingDate(),
        ]);
    }

    public function update(UpdateSettingsRequest $request): JsonResponse
    {
        $setting = Setting::current();
        $setting->update($request->validated());
        $setting = $setting->fresh();

        return $this->success([
            ...$setting->toArray(),
            'effective_max_booking_date' => $setting->effectiveMaxBookingDate(),
        ], 'Settings updated successfully.');
    }

    /**
     * Public read-only booking rules the frontend needs before auth
     * (e.g. the earliest/latest date a patient may book).
     * GET /api/booking-settings
     */
    public function publicBookingSettings(): JsonResponse
    {
        $setting = Setting::current();

        return $this->success([
            'min_booking_lead_days' => $setting->min_booking_lead_days,
            'max_booking_date' => $setting->effectiveMaxBookingDate(),
            'appointment_cutoff_minutes' => $setting->appointment_cutoff_minutes,
        ]);
    }
}
