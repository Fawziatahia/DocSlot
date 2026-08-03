<?php

namespace App\Features\Appointments\Mail;

use App\Models\Appointment;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class AppointmentConfirmedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Appointment $appointment,
        public readonly string $when,
    ) {}

    public function build(): self
    {
        return $this->subject("Your DocSlot appointment on {$this->when} is confirmed")
            ->view('emails.appointment-confirmed');
    }
}
