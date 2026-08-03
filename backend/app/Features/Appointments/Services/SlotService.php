<?php

namespace App\Features\Appointments\Services;

use App\Features\Appointments\Repositories\AppointmentRepository;
use App\Features\Shared\Helpers\SlotHelper;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Carbon\Carbon;
use Illuminate\Support\Collection;

/**
 * Single source of truth for "what slots can a doctor be booked into on a
 * given date" — used by both the public slots-listing endpoint and the
 * booking validation in AppointmentService, so the two can never drift.
 */
class SlotService
{
    public function __construct(
        private readonly AppointmentRepository $appointmentRepository,
    ) {}

    public function scheduleFor(Doctor $doctor, string $date): ?DoctorSchedule
    {
        $dayOfWeek = (int) Carbon::parse($date)->format('w');

        return DoctorSchedule::where('doctor_id', $doctor->id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->first();
    }

    /**
     * @param  DoctorSchedule|null  $schedule     Pre-fetched schedule for the date, if the caller already has it.
     * @param  int|null             $bookedCount  Pre-computed active booking count for the date, if already known.
     * @return array<int, array{start: string, end: string}>
     */
    public function availableSlots(Doctor $doctor, string $date, ?DoctorSchedule $schedule = null, ?int $bookedCount = null): array
    {
        $schedule ??= $this->scheduleFor($doctor, $date);

        if (! $schedule) {
            return [];
        }

        // The daily cap blocks all further booking for the day once reached —
        // it isn't "the first N slots", so this is an all-or-nothing gate.
        if ($schedule->max_daily_appointments) {
            $bookedCount ??= $this->appointmentRepository->countDoctorBookings($doctor->id, $date);
            if ($bookedCount >= $schedule->max_daily_appointments) {
                return [];
            }
        }

        $slots = SlotHelper::generateSlots(
            $schedule->start_time,
            $schedule->end_time,
            $schedule->slot_duration
        );

        $booked = $this->appointmentRepository->getDoctorBookings($doctor->id, $date);

        return array_values(array_filter(
            $slots,
            fn (array $slot) => ! $this->overlapsBooking($slot, $booked)
        ));
    }

    private function overlapsBooking(array $slot, Collection $booked): bool
    {
        $start = Carbon::parse($slot['start']);
        $end = Carbon::parse($slot['end']);

        foreach ($booked as $appointment) {
            if ($start < Carbon::parse($appointment->end_time) && $end > Carbon::parse($appointment->start_time)) {
                return true;
            }
        }

        return false;
    }
}
