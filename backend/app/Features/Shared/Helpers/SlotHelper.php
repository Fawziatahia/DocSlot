<?php

namespace App\Features\Shared\Helpers;

class SlotHelper
{
    /**
     * Generate time slots for a given time range and duration.
     *
     * @param  string  $startTime  e.g. "09:00"
     * @param  string  $endTime    e.g. "17:00"
     * @param  int     $duration   in minutes
     * @return array<int, array{start: string, end: string}>
     */
    public static function generateSlots(string $startTime, string $endTime, int $duration = 30): array
    {
        $slots = [];
        $start = strtotime($startTime);
        $end = strtotime($endTime);

        while ($start + ($duration * 60) <= $end) {
            $slotEnd = $start + ($duration * 60);
            $slots[] = [
                'start' => date('H:i:s', $start),
                'end' => date('H:i:s', $slotEnd),
            ];
            $start = $slotEnd;
        }

        return $slots;
    }
}
