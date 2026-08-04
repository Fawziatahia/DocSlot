<?php

namespace App\Features\Appointments\Listeners;

use App\Features\Appointments\Events\AppointmentBooked;
use App\Features\Appointments\Listeners\Concerns\FormatsAppointmentWindow;
use App\Features\Appointments\Mail\AppointmentBookedMail;
use App\Features\Notifications\Enums\NotificationTypeEnum;
use App\Features\Notifications\Services\NotificationService;
use App\Models\Appointment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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

        $this->email($appointment, $when, 'patient', $appointment->patient->user->email);
        $this->email($appointment, $when, 'doctor', $appointment->doctor->user->email);
    }

    /**
     * Queued (not sent inline) so the booking request doesn't block on SMTP;
     * ShouldQueueAfterCommit on the mailable defers it until this transaction
     * commits. A failed dispatch must not roll back a booking that already
     * succeeded, so errors are logged rather than thrown.
     */
    private function email(Appointment $appointment, string $when, string $audience, ?string $address): void
    {
        if (! $address) {
            return;
        }

        try {
            Mail::to($address)->queue(new AppointmentBookedMail($appointment, $when, $audience));
        } catch (\Throwable $e) {
            Log::error("Failed to email the {$audience} about appointment {$appointment->id}: {$e->getMessage()}");
        }
    }
}
