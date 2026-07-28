<?php

namespace App\Features\Prescriptions\DTOs;

readonly class PrescriptionData
{
    public function __construct(
        public int $patientId,
        public ?int $appointmentId,
        public string $diagnosis,
        public ?string $notes,
        public array $medications,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            patientId: (int) $data['patient_id'],
            appointmentId: isset($data['appointment_id']) ? (int) $data['appointment_id'] : null,
            diagnosis: $data['diagnosis'],
            notes: $data['notes'] ?? null,
            medications: $data['medications'] ?? [],
        );
    }
}
