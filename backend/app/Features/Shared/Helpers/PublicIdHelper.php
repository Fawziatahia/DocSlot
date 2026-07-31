<?php

namespace App\Features\Shared\Helpers;

class PublicIdHelper
{
    /**
     * Generate a random, unique, human-shareable public ID (e.g. "d7802721", "p7894622").
     *
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    public static function generate(string $modelClass, string $prefix): string
    {
        do {
            $candidate = $prefix . random_int(1000000, 9999999);
        } while ($modelClass::where('public_id', $candidate)->exists());

        return $candidate;
    }
}
