<?php

namespace App\Features\Appointments\Services;

use App\Features\Appointments\Repositories\AppointmentRepository;
use App\Features\Shared\Helpers\SlotHelper;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Carbon\Carbon;

class SlotGenerationService
{
    public function __construct(
        private readonly AppointmentRepository $appointmentRepository,
    ) {}

    /**
     * Get available slots for a doctor on a given date.
     *
     * @return array<int, array{start: string, end: string}>
     */
    public function getAvailableSlots(int $doctorId, string $date): array
    {
        $doctor = Doctor::findOrFail($doctorId);
        $dayOfWeek = (int) Carbon::parse($date)->format('w');

        $schedule = DoctorSchedule::where('doctor_id', $doctorId)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->first();

        if (!$schedule) {
            return [];
        }

        $slots = SlotHelper::generateSlots(
            $schedule->start_time,
            $schedule->end_time,
            $schedule->slot_duration
        );

        // Remove booked slots
        $booked = $this->appointmentRepository->getDoctorBookings($doctorId, $date);

        $available = array_filter($slots, function ($slot) use ($booked) {
            foreach ($booked as $apt) {
                $s = Carbon::parse($slot['start']);
                $e = Carbon::parse($slot['end']);
                $as = Carbon::parse($apt->start_time);
                $ae = Carbon::parse($apt->end_time);
                if ($s < $ae && $e > $as) {
                    return false;
                }
            }
            return true;
        });

        // Enforce daily cap
        if ($schedule->max_daily_appointments) {
            $confirmedCount = $this->appointmentRepository->countDoctorBookings($doctorId, $date);
            $remaining = max(0, $schedule->max_daily_appointments - $confirmedCount);
            $available = array_slice(array_values($available), 0, $remaining);
        }

        return array_values($available);
    }
}
