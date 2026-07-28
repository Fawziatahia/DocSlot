<?php

namespace App\Features\Doctors\Actions;

use App\Features\Appointments\Services\AppointmentService;
use App\Models\Appointment;

class AcceptAppointmentAction
{
    public function __construct(
        private readonly AppointmentService $appointmentService,
    ) {}

    public function execute(Appointment $appointment): Appointment
    {
        return $this->appointmentService->confirmAppointment($appointment);
    }
}
