<?php

namespace App\Features\Doctors\Services;

use App\Features\Doctors\DTOs\ScheduleData;
use App\Features\Doctors\Repositories\DoctorRepository;
use App\Features\Doctors\Repositories\DoctorScheduleRepository;
use App\Models\Doctor;
use App\Models\User;
use HasinHayder\Tyro\Models\Role;
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
     * The admin sets the doctor's initial password; the doctor is required
     * to change it the first time they log in.
     */
    public function createDoctor(array $data): Doctor
    {
        return DB::transaction(function () use ($data) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'phone' => $data['phone'] ?? null,
                'must_change_password' => true,
            ]);

            $user->assignRole(Role::findRole('doctor'));

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
    public function searchDoctors(array $filters, int $perPage = 15)
    {
        return $this->doctorRepository->search($filters, $perPage);
    }
}
