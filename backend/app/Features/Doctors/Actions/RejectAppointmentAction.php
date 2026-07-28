<?php

namespace App\Features\Doctors\Actions;

use App\Features\Appointments\Services\AppointmentService;
use App\Models\Appointment;

class RejectAppointmentAction
{
    public function __construct(
        private readonly AppointmentService $appointmentService,
    ) {}

    public function execute(Appointment $appointment, ?string $reason = null): Appointment
    {
        return $this->appointmentService->cancelAppointment($appointment, $reason);
    }
}
