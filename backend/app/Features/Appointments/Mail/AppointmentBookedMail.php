<?php

namespace App\Features\Appointments\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentBookedMail extends Mailable
{
    use Queueable, SerializesModels;

    /**
     * @param  'patient'|'doctor'  $audience  which side of the booking is reading
     */
    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $when,
        public readonly string $audience,
    ) {}

    public function build(): self
    {
        $subject = $this->audience === 'doctor'
            ? "New appointment: {$this->appointment->patient->user->name} on {$this->when}"
            : "Your DocSlot appointment on {$this->when}";

        return $this->subject($subject)->view('emails.appointment-booked');
    }
}
