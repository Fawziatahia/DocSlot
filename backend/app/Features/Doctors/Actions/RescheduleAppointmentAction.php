<?php

namespace App\Features\Doctors\Actions;

use App\Features\Appointments\DTOs\RescheduleData;
use App\Features\Appointments\Services\AppointmentService;
use App\Models\Appointment;

class RescheduleAppointmentAction
{
    public function __construct(
        private readonly AppointmentService $appointmentService,
    ) {}

    public function execute(Appointment $appointment, RescheduleData $data): Appointment
    {
        return $this->appointmentService->rescheduleAppointment(
            $appointment,
            $data->appointmentDate,
            $data->startTime,
            $data->endTime,
        );
    }
}
