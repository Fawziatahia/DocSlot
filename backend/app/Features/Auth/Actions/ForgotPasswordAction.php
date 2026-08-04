<?php

namespace App\Features\Auth\Actions;

use App\Features\Auth\Mail\PasswordResetOtpMail;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class ForgotPasswordAction
{
    public const OTP_TTL_MINUTES = 10;

    /**
     * Generate and email a one-time password reset code for the given email.
     *
     * Always returns silently regardless of whether the email exists, to
     * prevent user enumeration — the controller sends a generic response.
     */
    public function execute(string $email): void
    {
        $user = User::where('email', $email)->first();

        if (! $user) {
            return;
        }

        $otp = (string) random_int(100000, 999999);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $email],
            ['token' => Hash::make($otp), 'created_at' => now()],
        );

        // Queued so the response doesn't block on SMTP; user enumeration is
        // still prevented since this returns silently either way.
        Mail::to($email)->queue(new PasswordResetOtpMail($otp, self::OTP_TTL_MINUTES));

        Log::info('Password reset OTP sent', ['email' => $email]);
    }
}
