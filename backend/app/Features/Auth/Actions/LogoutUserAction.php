<?php

namespace App\Features\Auth\Actions;

use App\Models\User;

class LogoutUserAction
{
    /**
     * Revoke the current access token.
     */
    public function execute(User $user): void
    {
        $user->currentAccessToken()->delete();
    }
}
