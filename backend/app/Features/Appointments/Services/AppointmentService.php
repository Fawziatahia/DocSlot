<?php

namespace App\Features\Appointments\Services;

use App\Features\Appointments\DTOs\AppointmentData;
use App\Features\Appointments\Enums\AppointmentStatusEnum;
use App\Features\Appointments\Events\AppointmentBooked;
use App\Features\Appointments\Events\AppointmentCancelled;
use App\Features\Appointments\Events\AppointmentRescheduled;
use App\Features\Appointments\Events\AppointmentStatusChanged;
use App\Features\Appointments\Repositories\AppointmentRepository;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\DoctorSchedule;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class AppointmentService
{
    public function __construct(
        private readonly AppointmentRepository $appointmentRepository,
    ) {}

    /**
     * Book an appointment with slot availability + daily cap checks.
     */
    public function bookAppointment(AppointmentData $data, int $patientId): Appointment
    {
        return DB::transaction(function () use ($data, $patientId) {
            $doctor = Doctor::with('user')->findOrFail($data->doctorId);

            if (! $doctor->isPubliclyVisible()) {
                throw new \App\Features\Shared\Exceptions\ApiException('This doctor is not currently accepting appointments.', 422);
            }

            $dayOfWeek = (int) Carbon::parse($data->appointmentDate)->format('w');

            // Verify schedule exists for this day
            $schedule = DoctorSchedule::where('doctor_id', $data->doctorId)
                ->where('day_of_week', $dayOfWeek)
                ->where('is_available', true)
                ->first();

            if (!$schedule) {
                throw new \App\Features\Shared\Exceptions\ApiException('Doctor is not available on this date.', 422);
            }

            // Check double-booking
            $existing = $this->appointmentRepository->getDoctorBookings(
                $data->doctorId, $data->appointmentDate
            );

            foreach ($existing as $apt) {
                $existingStart = Carbon::parse($apt->start_time);
                $existingEnd = Carbon::parse($apt->end_time);
                $newStart = Carbon::parse($data->startTime);
                $newEnd = Carbon::parse($data->endTime);

                if ($newStart < $existingEnd && $newEnd > $existingStart) {
                    throw new \App\Features\Shared\Exceptions\ApiException('This time slot is already booked.', 409);
                }
            }

            // Check daily cap
            if ($schedule->max_daily_appointments) {
                $todayCount = $this->appointmentRepository->countDoctorBookings(
                    $data->doctorId, $data->appointmentDate
                );
                if ($todayCount >= $schedule->max_daily_appointments) {
                    throw new \App\Features\Shared\Exceptions\ApiException(
                        'Doctor has reached the maximum number of appointments for this day.', 409
                    );
                }
            }

            $appointment = $this->appointmentRepository->create([
                'patient_id' => $patientId,
                'doctor_id' => $data->doctorId,
                'appointment_date' => $data->appointmentDate,
                'start_time' => $data->startTime,
                'end_time' => $data->endTime,
                'reason' => $data->reason,
                'status' => AppointmentStatusEnum::Pending->value,
            ]);

            event(new AppointmentBooked($appointment));

            return $appointment;
        });
    }

    public function cancelAppointment(Appointment $appointment, ?string $reason = null): Appointment
    {
        if (!in_array($appointment->status, ['pending', 'confirmed'])) {
            throw new \App\Features\Shared\Exceptions\ApiException('This appointment cannot be cancelled.', 409);
        }

        $appointment = $this->appointmentRepository->update($appointment, [
            'status' => AppointmentStatusEnum::Cancelled->value,
            'cancellation_reason' => $reason,
        ]);

        event(new AppointmentCancelled($appointment));

        return $appointment;
    }

    public function confirmAppointment(Appointment $appointment): Appointment
    {
        if ($appointment->status !== AppointmentStatusEnum::Pending->value) {
            throw new \App\Features\Shared\Exceptions\ApiException('Only pending appointments can be confirmed.', 409);
        }

        $appointment = $this->appointmentRepository->update($appointment, [
            'status' => AppointmentStatusEnum::Confirmed->value,
        ]);

        event(new AppointmentStatusChanged($appointment));

        return $appointment;
    }

    public function completeAppointment(Appointment $appointment): Appointment
    {
        if ($appointment->status !== AppointmentStatusEnum::Confirmed->value) {
            throw new \App\Features\Shared\Exceptions\ApiException('Only confirmed appointments can be completed.', 409);
        }

        $appointment = $this->appointmentRepository->update($appointment, [
            'status' => AppointmentStatusEnum::Completed->value,
        ]);

        event(new AppointmentStatusChanged($appointment));

        return $appointment;
    }

    public function rescheduleAppointment(Appointment $appointment, string $newDate, string $newStart, string $newEnd): Appointment
    {
        // Check reschedule count cap
        $maxReschedule = (int) config('app.max_reschedule_count', 2);
        if ($appointment->reschedule_count >= $maxReschedule) {
            throw new \App\Features\Shared\Exceptions\ApiException('Maximum reschedule limit reached.', 409);
        }

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
}
