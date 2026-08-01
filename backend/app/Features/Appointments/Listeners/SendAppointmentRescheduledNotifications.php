<?php

namespace App\Features\Appointments\Listeners;

use App\Features\Appointments\Events\AppointmentRescheduled;
use App\Features\Appointments\Listeners\Concerns\FormatsAppointmentWindow;
use App\Features\Notifications\Enums\NotificationTypeEnum;
use App\Features\Notifications\Services\NotificationService;

class SendAppointmentRescheduledNotifications
{
    use FormatsAppointmentWindow;

    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function handle(AppointmentRescheduled $event): void
    {
        $appointment = $event->appointment->loadMissing(['patient.user', 'doctor.user']);
        $when = $this->appointmentWindow($appointment);

        $this->notificationService->createNotification(
            $appointment->patient->user_id,
            NotificationTypeEnum::AppointmentRescheduled->value,
            'Appointment Rescheduled',
            "Your appointment with Dr. {$appointment->doctor->user->name} has been rescheduled to {$when}.",
            ['appointment_id' => $appointment->id],
        );

        $this->notificationService->createNotification(
            $appointment->doctor->user_id,
            NotificationTypeEnum::AppointmentRescheduled->value,
            'Appointment Rescheduled',
            "{$appointment->patient->user->name} rescheduled their appointment to {$when}.",
            ['appointment_id' => $appointment->id],
        );
    }
}
