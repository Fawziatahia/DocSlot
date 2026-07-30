<?php

namespace App\Features\Doctors\Repositories;

use App\Models\DoctorSchedule;
use Illuminate\Database\Eloquent\Collection;

class DoctorScheduleRepository
{
    /**
     * Get all schedules for a doctor.
     *
     * @return Collection<int, DoctorSchedule>
     */
    public function getByDoctorId(int $doctorId): Collection
    {
        return DoctorSchedule::where('doctor_id', $doctorId)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->get();
    }

    /**
     * Replace a doctor's full-week schedule.
     *
     * Deletes all existing entries and inserts the new ones in one transaction.
     *
     * @param  array<int, array<string, mixed>>  $days
     * @return Collection<int, DoctorSchedule>
     */
    public function replaceWeekSchedule(int $doctorId, array $days): Collection
    {
        DoctorSchedule::where('doctor_id', $doctorId)->delete();

        $schedules = [];
        foreach ($days as $day) {
            $schedules[] = DoctorSchedule::create([
                'doctor_id' => $doctorId,
                'day_of_week' => $day['day_of_week'],
                'start_time' => $day['start_time'],
                'end_time' => $day['end_time'],
                'slot_duration' => $day['slot_duration'] ?? 30,
                'max_daily_appointments' => $day['max_daily_appointments'] ?? 10,
                'is_available' => $day['is_available'] ?? true,
            ]);
        }

        return new Collection($schedules);
    }

    /**
     * Get the schedule for a specific doctor and day.
     */
    public function getByDoctorAndDay(int $doctorId, int $dayOfWeek): ?DoctorSchedule
    {
        return DoctorSchedule::where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->first();
    }
}
