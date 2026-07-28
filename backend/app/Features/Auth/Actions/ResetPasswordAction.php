<?php

namespace App\Features\Auth\Actions;

use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class ResetPasswordAction
{
    /**
     * Reset the user's password using a valid reset token.
     *
     * @return string  Status constant from Password broker
     */
    public function execute(string $email, string $token, string $password): string
    {
        return Password::reset(
            [
                'email' => $email,
                'token' => $token,
                'password' => $password,
                'password_confirmation' => $password,
            ],
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                ])->setRememberToken(Str::random(60));

                $user->save();

                event(new PasswordReset($user));
            }
        );
    }
}
