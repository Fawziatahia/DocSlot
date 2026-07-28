<?php

namespace App\Features\Auth\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class LoginUserAction
{
    /**
     * Authenticate a user and return a Sanctum token.
     *
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     */
    public function execute(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        if (! $user->is_active) {
            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated.'],
            ]);
        }

        $user->update([
            'last_login_at' => now(),
            'last_login_ip' => request()->ip(),
        ]);

        $abilities = $user->tyroRoleSlugs();

        $token = $user->createToken('auth-token', $abilities)->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }
}
