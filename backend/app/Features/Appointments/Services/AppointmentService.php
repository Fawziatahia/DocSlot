<?php

namespace App\Features\Appointments\Services;

use App\Features\Appointments\DTOs\AppointmentData;
use App\Features\Appointments\Enums\AppointmentStatusEnum;
use App\Features\Appointments\Events\AppointmentBooked;
use App\Features\Appointments\Events\AppointmentCancelled;
use App\Features\Appointments\Events\AppointmentRescheduled;
use App\Features\Appointments\Events\AppointmentStatusChanged;
use App\Features\Appointments\Repositories\AppointmentRepository;
use App\Features\Shared\Exceptions\ApiException;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Setting;
use Carbon\Carbon;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    public function __construct(
        private readonly AppointmentRepository $appointmentRepository,
        private readonly SlotService $slotService,
    ) {}

    /**
     * Book an appointment with slot availability + daily cap checks.
     */
    public function bookAppointment(AppointmentData $data, int $patientId): Appointment
    {
        return DB::transaction(function () use ($data, $patientId) {
            $doctor = Doctor::with('user')->findOrFail($data->doctorId);

            if (! $doctor->isPubliclyVisible()) {
                throw new ApiException('This doctor is not currently accepting appointments.', 422);
            }

            $schedule = $this->slotService->scheduleFor($doctor, $data->appointmentDate);

            if (! $schedule) {
                throw new ApiException('Doctor is not available on this date.', 422);
            }

            // Lock the doctor's active bookings for this date first, so a
            // concurrent booking attempt for the same/overlapping slot blocks
            // on this lock instead of racing past the checks below with us.
            $this->appointmentRepository->lockDoctorBookings($data->doctorId, $data->appointmentDate);

            $todayCount = null;
            if ($schedule->max_daily_appointments) {
                $todayCount = $this->appointmentRepository->countDoctorBookings(
                    $data->doctorId, $data->appointmentDate
                );
                if ($todayCount >= $schedule->max_daily_appointments) {
                    throw new ApiException(
                        'Doctor has reached the maximum number of appointments for this day.', 409
                    );
                }
            }

            // Reuse the schedule + booking count already fetched above so
            // availableSlots() doesn't re-run the same two queries.
            $available = $this->slotService->availableSlots($doctor, $data->appointmentDate, $schedule, $todayCount);
            $slotIsFree = collect($available)->contains(
                fn (array $slot) => $slot['start'] === $data->startTime && $slot['end'] === $data->endTime
            );

            if (! $slotIsFree) {
                throw new ApiException('This time slot is already booked.', 409);
            }

            try {
                $appointment = $this->appointmentRepository->create([
                    'patient_id' => $patientId,
                    'doctor_id' => $data->doctorId,
                    'appointment_date' => $data->appointmentDate,
                    'start_time' => $data->startTime,
                    'end_time' => $data->endTime,
                    'reason' => $data->reason,
                    'status' => AppointmentStatusEnum::Pending->value,
                ]);
            } catch (QueryException $e) {
                if ($e->getCode() === '23000') {
                    throw new ApiException('This time slot is already booked.', 409);
                }
                throw $e;
            }

            event(new AppointmentBooked($appointment));

            return $appointment;
        });
    }

    public function cancelAppointment(Appointment $appointment, ?string $reason = null): Appointment
    {
        if (!in_array($appointment->status, [AppointmentStatusEnum::Pending, AppointmentStatusEnum::Confirmed], true)) {
            throw new ApiException('This appointment cannot be cancelled.', 409);
        }

        $this->assertPastCutoffAllows($appointment, 'cancelled');

        $appointment = $this->appointmentRepository->update($appointment, [
            'status' => AppointmentStatusEnum::Cancelled->value,
            'cancellation_reason' => $reason,
        ]);

        event(new AppointmentCancelled($appointment));

        return $appointment;
    }

    public function confirmAppointment(Appointment $appointment): Appointment
    {
        if ($appointment->status !== AppointmentStatusEnum::Pending) {
            throw new ApiException('Only pending appointments can be confirmed.', 409);
        }

        $appointment = $this->appointmentRepository->update($appointment, [
            'status' => AppointmentStatusEnum::Confirmed->value,
        ]);

        event(new AppointmentStatusChanged($appointment));

        return $appointment;
    }

    public function completeAppointment(Appointment $appointment): Appointment
    {
        if ($appointment->status !== AppointmentStatusEnum::Confirmed) {
            throw new ApiException('Only confirmed appointments can be completed.', 409);
        }

        $appointment = $this->appointmentRepository->update($appointment, [
            'status' => AppointmentStatusEnum::Completed->value,
        ]);

        event(new AppointmentStatusChanged($appointment));

        return $appointment;
    }

    public function rescheduleAppointment(Appointment $appointment, string $newDate, string $newStart, string $newEnd): Appointment
    {
        $setting = Setting::current();
        if ($appointment->reschedule_count >= $setting->max_reschedule_count) {
            throw new ApiException('Maximum reschedule limit reached.', 409);
        }

        $this->assertPastCutoffAllows($appointment, 'rescheduled', $setting);

        $appointment = $this->appointmentRepository->update($appointment, [
            'appointment_date' => $newDate,
            'start_time' => $newStart,
            'end_time' => $newEnd,
            'status' => AppointmentStatusEnum::Pending->value,
            'reschedule_count' => $appointment->reschedule_count + 1,
        ]);

        event(new AppointmentRescheduled($appointment));

        return $appointment;
    }

    /**
     * Enforce Setting::appointment_cutoff_minutes: cancel/reschedule is only
     * allowed until that many minutes before the appointment's start time.
     */
    private function assertPastCutoffAllows(Appointment $appointment, string $action, ?Setting $setting = null): void
    {
        $cutoffMinutes = ($setting ?? Setting::current())->appointment_cutoff_minutes;
        $startsAt = Carbon::parse($appointment->appointment_date->format('Y-m-d').' '.$appointment->start_time);

        if (now()->addMinutes($cutoffMinutes)->greaterThan($startsAt)) {
            throw new ApiException(
                "This appointment can no longer be {$action} — changes must be made at least {$cutoffMinutes} minutes before the start time.",
                422
            );
        }
    }
}
