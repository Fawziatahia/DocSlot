<?php

namespace App\Features\Shared\Helpers;

use Carbon\Carbon;

class DateHelper
{
    public static function now(): Carbon
    {
        return now();
    }

    public static function today(): Carbon
    {
        return today();
    }

    public static function formatDateTime(?Carbon $date, string $format = 'Y-m-d H:i:s'): ?string
    {
        return $date?->format($format);
    }

    public static function isOverlapping(Carbon $startA, Carbon $endA, Carbon $startB, Carbon $endB): bool
    {
        return $startA < $endB && $endA > $startB;
    }
}
