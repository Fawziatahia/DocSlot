<?php

namespace App\Features\Appointments\Listeners;

use App\Features\Appointments\Events\AppointmentCancelled;
use App\Features\Appointments\Listeners\Concerns\FormatsAppointmentWindow;
use App\Features\Notifications\Enums\NotificationTypeEnum;
use App\Features\Notifications\Services\NotificationService;

class SendAppointmentCancelledNotifications
{
    use FormatsAppointmentWindow;

    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function handle(AppointmentCancelled $event): void
    {
        $appointment = $event->appointment->loadMissing(['patient.user', 'doctor.user']);
        $when = $this->appointmentWindow($appointment);

        $this->notificationService->createNotification(
            $appointment->patient->user_id,
            NotificationTypeEnum::AppointmentCancelled->value,
            'Appointment Cancelled',
            "Your appointment with {$appointment->doctor->displayName()} on {$when} has been cancelled.",
            ['appointment_id' => $appointment->id],
        );

        $this->notificationService->createNotification(
            $appointment->doctor->user_id,
            NotificationTypeEnum::AppointmentCancelled->value,
            'Appointment Cancelled',
            "{$appointment->patient->user->name} cancelled their appointment on {$when}.",
            ['appointment_id' => $appointment->id],
        );
    }
}
