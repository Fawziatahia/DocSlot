<?php

namespace App\Features\Auth\Actions;

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class ResetPasswordAction
{
    public const STATUS_SUCCESS = 'success';

    public const STATUS_INVALID = 'invalid';

    public const STATUS_EXPIRED = 'expired';

    /**
     * Reset the user's password using a valid OTP.
     */
    public function execute(string $email, string $otp, string $password): string
    {
        $record = DB::table('password_reset_tokens')->where('email', $email)->first();

        if (! $record || ! Hash::check($otp, $record->token)) {
            return self::STATUS_INVALID;
        }

        if (Carbon::parse($record->created_at)->addMinutes(ForgotPasswordAction::OTP_TTL_MINUTES)->isPast()) {
            DB::table('password_reset_tokens')->where('email', $email)->delete();

            return self::STATUS_EXPIRED;
        }

        $user = User::where('email', $email)->first();

        if (! $user) {
            return self::STATUS_INVALID;
        }

        $user->forceFill([
            'password' => Hash::make($password),
        ])->save();

        DB::table('password_reset_tokens')->where('email', $email)->delete();

        event(new PasswordReset($user));

        return self::STATUS_SUCCESS;
    }
}
