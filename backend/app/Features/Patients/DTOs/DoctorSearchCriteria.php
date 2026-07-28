<?php

namespace App\Features\Patients\DTOs;

readonly class DoctorSearchCriteria
{
    public function __construct(
        public ?string $q,
        public ?int $specializationId,
        public ?int $departmentId,
        public ?float $minFee,
        public ?float $maxFee,
        public ?float $minRating,
        public int $perPage,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            q: $data['q'] ?? null,
            specializationId: isset($data['specialization_id']) ? (int) $data['specialization_id'] : null,
            departmentId: isset($data['department_id']) ? (int) $data['department_id'] : null,
            minFee: isset($data['min_fee']) ? (float) $data['min_fee'] : null,
            maxFee: isset($data['max_fee']) ? (float) $data['max_fee'] : null,
            minRating: isset($data['min_rating']) ? (float) $data['min_rating'] : null,
            perPage: (int) ($data['per_page'] ?? 15),
        );
    }
}
