<?php

namespace App\Features\Appointments\DTOs;

readonly class RescheduleData
{
    public function __construct(
        public string $appointmentDate,
        public string $startTime,
        public string $endTime,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            appointmentDate: $data['appointment_date'],
            startTime: $data['start_time'],
            endTime: $data['end_time'],
        );
    }
}
