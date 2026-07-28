<?php

namespace App\Features\Patients\DTOs;

readonly class PatientData
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $phone,
        public ?string $dateOfBirth,
        public ?string $gender,
        public ?string $address,
        public ?string $bloodGroup,
        public ?string $emergencyContact,
        public ?string $emergencyContactName,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            phone: $data['phone'] ?? null,
            dateOfBirth: $data['date_of_birth'] ?? null,
            gender: $data['gender'] ?? null,
            address: $data['address'] ?? null,
            bloodGroup: $data['blood_group'] ?? null,
            emergencyContact: $data['emergency_contact'] ?? null,
            emergencyContactName: $data['emergency_contact_name'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'date_of_birth' => $this->dateOfBirth,
            'gender' => $this->gender,
            'address' => $this->address,
            'blood_group' => $this->bloodGroup,
            'emergency_contact' => $this->emergencyContact,
            'emergency_contact_name' => $this->emergencyContactName,
        ];
    }
}
