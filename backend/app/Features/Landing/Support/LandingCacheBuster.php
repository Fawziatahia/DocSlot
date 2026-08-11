<?php

namespace App\Features\Landing\Support;

use Illuminate\Support\Facades\Cache;

/**
 * The landing page's rating-derived caches (stats, featured/top-rated
 * doctors, testimonials) are keyed by their own query params (limit, lead
 * days), so there's no single fixed key to forget when a rating is submitted
 * or a doctor's review visibility changes. Salting every one of those keys
 * with this version number invalidates all of them at once on write, without
 * needing a tagging-capable cache store (the app's file/database drivers
 * don't support tags).
 */
class LandingCacheBuster
{
    private const VERSION_KEY = 'landing.ratings_version';

    public static function version(): int
    {
        // 0 (not 1) so the very first real bust — which also lands on 1,
        // since increment() starts from a missing key at 0 — is distinguishable
        // from "never busted".
        return (int) Cache::get(self::VERSION_KEY, 0);
    }

    public static function bust(): void
    {
        Cache::increment(self::VERSION_KEY);
    }
}
