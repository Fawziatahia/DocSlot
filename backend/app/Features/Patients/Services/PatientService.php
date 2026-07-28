<?php

namespace App\Features\Patients\Services;

use App\Features\Doctors\Repositories\DoctorRepository;
use App\Models\Patient;
use App\Models\User;
use HasinHayder\Tyro\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PatientService
{
    public function __construct(
        private readonly DoctorRepository $doctorRepository,
    ) {}

    /**
     * Create a patient account (admin-created).
     */
    public function createPatient(array $data): Patient
    {
        return DB::transaction(function () use ($data) {
            $tempPassword = \Illuminate\Support\Str::random(16);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($tempPassword),
                'phone' => $data['phone'] ?? null,
            ]);

            $user->assignRole(Role::findRole('patient'));

            return Patient::create([
                'user_id' => $user->id,
                'date_of_birth' => $data['date_of_birth'] ?? null,
                'gender' => $data['gender'] ?? null,
                'address' => $data['address'] ?? null,
                'blood_group' => $data['blood_group'] ?? null,
                'emergency_contact' => $data['emergency_contact'] ?? null,
                'emergency_contact_name' => $data['emergency_contact_name'] ?? null,
                'status' => 'active',
            ]);
        });
    }

    /**
     * Search doctors — delegates to DoctorRepository.
     */
    public function searchDoctors(array $filters, int $perPage = 15)
    {
        return $this->doctorRepository->search($filters, $perPage);
    }
}
