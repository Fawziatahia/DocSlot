<?php

namespace App\Features\Appointments\DTOs;

readonly class AppointmentData
{
    public function __construct(
        public int $doctorId,
        public string $appointmentDate,
        public string $startTime,
        public string $endTime,
        public ?string $reason,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            doctorId: (int) $data['doctor_id'],
            appointmentDate: $data['appointment_date'],
            startTime: $data['start_time'],
            endTime: $data['end_time'],
            reason: $data['reason'] ?? null,
        );
    }
}
