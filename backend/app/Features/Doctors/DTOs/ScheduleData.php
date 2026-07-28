<?php

namespace App\Features\Doctors\DTOs;

readonly class ScheduleData
{
    /**
     * @param  array<int, array{day_of_week: int, start_time: string, end_time: string, slot_duration?: int, max_daily_appointments?: int, is_available?: bool}>  $days
     */
    public function __construct(
        public int $doctorId,
        public array $days,
    ) {}

    public static function fromArray(array $data, int $doctorId): self
    {
        return new self(
            doctorId: $doctorId,
            days: $data['days'] ?? [],
        );
    }
}
