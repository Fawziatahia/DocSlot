<?php

namespace App\Features\Doctors\Services;

use App\Features\Doctors\DTOs\ScheduleData;
use App\Features\Doctors\Repositories\DoctorRepository;
use App\Features\Doctors\Repositories\DoctorScheduleRepository;
use App\Models\Doctor;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DoctorService
{
    public function __construct(
        private readonly DoctorRepository $doctorRepository,
        private readonly DoctorScheduleRepository $scheduleRepository,
    ) {}

    /**
     * Create a doctor user + profile in one transaction.
     *
     * The doctor receives a random temporary password and the "doctor" role.
     * They must use the forgot-password flow to set their own password.
     */
    public function createDoctor(array $data): Doctor
    {
        return DB::transaction(function () use ($data) {
            $tempPassword = \Illuminate\Support\Str::random(16);

            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($tempPassword),
                'phone' => $data['phone'] ?? null,
            ]);

            $user->assignRole('doctor');

            return $this->doctorRepository->create([
                'user_id' => $user->id,
                'specialization_id' => $data['specialization_id'],
                'department_id' => $data['department_id'],
                'license_number' => $data['license_number'],
                'qualifications' => $data['qualifications'] ?? null,
                'bio' => $data['bio'] ?? null,
                'consultation_fee' => $data['consultation_fee'] ?? 0,
                'status' => 'active',
            ]);
        });
    }

    public function updateDoctor(int $id, array $data): Doctor
    {
        $doctor = $this->doctorRepository->findOrFail($id);

        return $this->doctorRepository->update($doctor, $data);
    }

    public function manageSchedule(ScheduleData $data): Collection
    {
        return $this->scheduleRepository->replaceWeekSchedule($data->doctorId, $data->days);
    }

    /**
     * @param  array<string, mixed>  $filters
     * @return \Illuminate\Pagination\LengthAwarePaginator
     */
    public function searchDoctors(array $filters)
    {
        return $this->doctorRepository->search($filters);
    }
}
