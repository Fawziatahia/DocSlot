<?php

namespace App\Features\Auth\Actions;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class ChangePasswordAction
{
    /**
     * @throws ValidationException
     */
    public function execute(User $user, string $currentPassword, string $newPassword): User
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The current password is incorrect.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'must_change_password' => false,
        ])->save();

        return $user;
    }
}
