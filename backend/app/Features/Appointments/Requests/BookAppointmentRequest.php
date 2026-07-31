<?php

namespace App\Features\Appointments\Requests;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;

class BookAppointmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $setting = Setting::current();
        $minDate = now()->addDays($setting->min_booking_lead_days)->format('Y-m-d');

        $appointmentDateRules = ['required', 'date_format:Y-m-d', "after_or_equal:{$minDate}"];
        if ($effectiveMax = $setting->effectiveMaxBookingDate()) {
            $appointmentDateRules[] = "before_or_equal:{$effectiveMax}";
        }

        return [
            'doctor_id' => ['required', 'string', 'exists:doctors,public_id'],
            'appointment_date' => $appointmentDateRules,
            'start_time' => ['required', 'date_format:H:i:s'],
            'end_time' => ['required', 'date_format:H:i:s', 'after:start_time'],
            'reason' => ['nullable', 'string', 'max:500'],
        ];
    }
}
