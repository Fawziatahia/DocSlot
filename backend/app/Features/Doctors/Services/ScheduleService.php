<?php

namespace App\Features\Doctors\Services;

use App\Features\Doctors\Repositories\DoctorScheduleRepository;
use Illuminate\Database\Eloquent\Collection;

class ScheduleService
{
    public function __construct(
        private readonly DoctorScheduleRepository $scheduleRepository,
    ) {}

    /**
     * Get the schedule for a doctor.
     *
     * @return Collection<int, \App\Models\DoctorSchedule>
     */
    public function getDoctorSchedule(int $doctorId): Collection
    {
        return $this->scheduleRepository->getByDoctorId($doctorId);
    }
}
