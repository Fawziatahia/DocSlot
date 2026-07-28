<?php

namespace App\Features\Auth\Actions;

use App\Models\User;
use Illuminate\Auth\Passwords\PasswordBroker;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;

class ForgotPasswordAction
{
    /**
     * Send a password reset link to the given email.
     *
     * Always returns a generic 200 response regardless of whether the
     * email exists, to prevent user enumeration.
     */
    public function execute(string $email): void
    {
        $status = Password::sendResetLink(['email' => $email]);

        if ($status === Password::RESET_LINK_SENT) {
            Log::info('Password reset link sent', ['email' => $email]);
        }

        // Do nothing if the email doesn't exist — generic response handled by controller.
    }
}
