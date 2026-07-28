<?php

namespace App\Features\Auth\DTOs;

readonly class AuthData
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public ?string $phone = null,
        public ?string $dateOfBirth = null,
        public ?string $gender = null,
        public ?string $address = null,
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            name: $data['name'],
            email: $data['email'],
            password: $data['password'],
            phone: $data['phone'] ?? null,
            dateOfBirth: $data['date_of_birth'] ?? null,
            gender: $data['gender'] ?? null,
            address: $data['address'] ?? null,
        );
    }
}
