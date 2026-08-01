<?php

namespace App\Features\Appointments\Listeners;

use App\Features\Appointments\Enums\AppointmentStatusEnum;
use App\Features\Appointments\Events\AppointmentStatusChanged;
use App\Features\Appointments\Listeners\Concerns\FormatsAppointmentWindow;
use App\Features\Notifications\Enums\NotificationTypeEnum;
use App\Features\Notifications\Services\NotificationService;

class SendAppointmentStatusChangedNotifications
{
    use FormatsAppointmentWindow;

    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function handle(AppointmentStatusChanged $event): void
    {
        $appointment = $event->appointment->loadMissing(['patient.user', 'doctor.user']);
        $when = $this->appointmentWindow($appointment);
        $doctorName = $appointment->doctor->user->name;
        $patientName = $appointment->patient->user->name;

        [$type, $title, $patientMessage, $doctorMessage] = match ($appointment->status) {
            AppointmentStatusEnum::Confirmed => [
                NotificationTypeEnum::AppointmentConfirmed,
                'Appointment Confirmed',
                "Your appointment with Dr. {$doctorName} on {$when} has been confirmed.",
                "The appointment with {$patientName} on {$when} has been confirmed.",
            ],
            AppointmentStatusEnum::Completed => [
                NotificationTypeEnum::AppointmentCompleted,
                'Appointment Completed',
                "Your appointment with Dr. {$doctorName} on {$when} is now marked as completed.",
                "The appointment with {$patientName} on {$when} is now marked as completed.",
            ],
            default => [null, null, null, null],
        };

        if (! $type) {
            return;
        }

        $this->notificationService->createNotification(
            $appointment->patient->user_id,
            $type->value,
            $title,
            $patientMessage,
            ['appointment_id' => $appointment->id],
        );

        $this->notificationService->createNotification(
            $appointment->doctor->user_id,
            $type->value,
            $title,
            $doctorMessage,
            ['appointment_id' => $appointment->id],
        );
    }
}
