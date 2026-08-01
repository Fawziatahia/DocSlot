<?php

namespace App\Features\Admin\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->hasRole('admin') ?? false;
    }

    public function rules(): array
    {
        return [
            'appointment_cutoff_minutes' => ['sometimes', 'integer', 'min:15', 'max:1440'],
            'max_reschedule_count' => ['sometimes', 'integer', 'min:0', 'max:10'],
            'default_slot_duration' => ['sometimes', 'integer', 'min:15', 'max:120'],
            'default_max_daily_appointments' => ['sometimes', 'integer', 'min:1', 'max:100'],
            'min_booking_lead_days' => ['sometimes', 'integer', 'min:0', 'max:30'],
            'max_booking_date' => ['sometimes', 'nullable', 'date_format:Y-m-d', 'after_or_equal:today'],
            'booking_cutoff_mode' => ['sometimes', 'in:fixed,auto'],
            'auto_booking_advance_days' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:365'],
        ];
    }
}
