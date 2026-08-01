<?php

namespace App\Features\Auth\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class PasswordResetOtpMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $otp,
        public readonly int $expiresInMinutes,
    ) {}

    public function build(): self
    {
        return $this->subject('Your DocSlot password reset code')
            ->view('emails.password-reset-otp');
    }
}
