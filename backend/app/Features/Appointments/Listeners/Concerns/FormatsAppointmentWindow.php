<?php

namespace App\Features\Appointments\Listeners\Concerns;

use App\Models\Appointment;
use Carbon\Carbon;

trait FormatsAppointmentWindow
{
    protected function appointmentWindow(Appointment $appointment): string
    {
        return $appointment->appointment_date->format('M j, Y').' at '.Carbon::parse($appointment->start_time)->format('g:i A');
    }
}
