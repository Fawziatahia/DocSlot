<?php

namespace App\Features\Appointments\Listeners;

use App\Features\Appointments\Events\AppointmentBooked;
use App\Features\Appointments\Listeners\Concerns\FormatsAppointmentWindow;
use App\Features\Notifications\Enums\NotificationTypeEnum;
use App\Features\Notifications\Services\NotificationService;

class SendAppointmentBookedNotifications
{
    use FormatsAppointmentWindow;

    public function __construct(
        private readonly NotificationService $notificationService,
    ) {}

    public function handle(AppointmentBooked $event): void
    {
        $appointment = $event->appointment->loadMissing(['patient.user', 'doctor.user']);
        $when = $this->appointmentWindow($appointment);

        $this->notificationService->createNotification(
            $appointment->patient->user_id,
            NotificationTypeEnum::AppointmentBooked->value,
            'Appointment Booked',
            "Your appointment with Dr. {$appointment->doctor->user->name} on {$when} has been booked.",
            ['appointment_id' => $appointment->id],
        );

        $this->notificationService->createNotification(
            $appointment->doctor->user_id,
            NotificationTypeEnum::AppointmentBooked->value,
            'New Appointment',
            "{$appointment->patient->user->name} booked an appointment with you on {$when}.",
            ['appointment_id' => $appointment->id],
        );
    }
}
