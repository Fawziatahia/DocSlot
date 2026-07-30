<?php

namespace App\Features\Doctors\DTOs;

readonly class DoctorData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $phone,
        public int $specializationId,
        public int $departmentId,
        public string $licenseNumber,
        public ?string $qualifications,
        public ?string $bio,
        public float $consultationFee,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
            phone: $data['phone'] ?? null,
            specializationId: (int) $data['specialization_id'],
            departmentId: (int) $data['department_id'],
            licenseNumber: $data['license_number'],
            qualifications: $data['qualifications'] ?? null,
            bio: $data['bio'] ?? null,
            consultationFee: (float) ($data['consultation_fee'] ?? 0),
        );
    }
}
