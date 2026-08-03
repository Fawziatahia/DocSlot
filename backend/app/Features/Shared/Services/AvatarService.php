<?php

namespace App\Features\Shared\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

/**
 * Stores user avatars on the public disk so they can be shown directly via an
 * <img> tag. Unlike medical records (private health data), an avatar is meant
 * to be publicly visible, so it does not go through an authenticated download.
 */
class AvatarService
{
    private const DISK = 'public';

    private const DIRECTORY = 'avatars';

    public function update(User $user, UploadedFile $file): void
    {
        $this->deleteExisting($user);

        $user->update([
            'avatar' => $file->store(self::DIRECTORY, self::DISK),
        ]);
    }

    public function remove(User $user): void
    {
        $this->deleteExisting($user);

        $user->update(['avatar' => null]);
    }

    /**
     * Remove the file backing the current avatar, but never touch an externally
     * hosted URL (some avatars may point off-site).
     */
    private function deleteExisting(User $user): void
    {
        if ($user->avatar && ! str_starts_with($user->avatar, 'http')) {
            Storage::disk(self::DISK)->delete($user->avatar);
        }
    }
}
