<?php

namespace App\Features\Prescriptions\DTOs;

readonly class MedicationData
{
    public function __construct(
        public string $medicationName,
        public string $dosage,
        public string $frequency,
        public ?string $duration,
        public ?string $instructions,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            medicationName: $data['medication_name'],
            dosage: $data['dosage'],
            frequency: $data['frequency'],
            duration: $data['duration'] ?? null,
            instructions: $data['instructions'] ?? null,
        );
    }
}
