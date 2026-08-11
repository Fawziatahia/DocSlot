<?php

namespace App\Features\Appointments\Listeners;

use App\Features\Appointments\Enums\AppointmentStatusEnum;
use App\Features\Appointments\Events\AppointmentStatusChanged;
use App\Features\Appointments\Listeners\Concerns\FormatsAppointmentWindow;
use App\Features\Appointments\Mail\AppointmentConfirmedMail;
use App\Features\Notifications\Enums\NotificationTypeEnum;
use App\Features\Notifications\Services\NotificationService;
use App\Models\Appointment;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

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
        $doctorName = $appointment->doctor->displayName();
        $patientName = $appointment->patient->user->name;

        [$type, $title, $patientMessage, $doctorMessage] = match ($appointment->status) {
            AppointmentStatusEnum::Confirmed => [
                NotificationTypeEnum::AppointmentConfirmed,
                'Appointment Confirmed',
                "Your appointment with {$doctorName} on {$when} has been confirmed.",
                "The appointment with {$patientName} on {$when} has been confirmed.",
            ],
            AppointmentStatusEnum::Completed => [
                NotificationTypeEnum::AppointmentCompleted,
                'Appointment Completed',
                "Your appointment with {$doctorName} on {$when} is now marked as completed.",
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

        // Email the patient a confirmation when the doctor confirms the booking.
        if ($appointment->status === AppointmentStatusEnum::Confirmed) {
            $this->emailPatientConfirmation($appointment, $when);
        }
    }

    /**
     * Queued (not sent inline) so the confirm/complete request doesn't block
     * on SMTP. A failed dispatch must never undo an already-confirmed
     * appointment, so errors are logged rather than thrown.
     */
    private function emailPatientConfirmation(Appointment $appointment, string $when): void
    {
        $address = $appointment->patient->user->email;

        if (! $address) {
            return;
        }

        try {
            Mail::to($address)->queue(new AppointmentConfirmedMail($appointment, $when));
        } catch (\Throwable $e) {
            Log::error("Failed to email the patient about confirmed appointment {$appointment->id}: {$e->getMessage()}");
        }
    }
}
