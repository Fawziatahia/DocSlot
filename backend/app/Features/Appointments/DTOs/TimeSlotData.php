<?php

namespace App\Features\Appointments\DTOs;

readonly class TimeSlotData
{
    public function __construct(
        public string $start,
        public string $end,
        public bool $available,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            start: $data['start'],
            end: $data['end'],
            available: $data['available'] ?? true,
        );
    }
}
