<?php

namespace App\Features\Appointments\Repositories;

use App\Models\Appointment;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class AppointmentRepository
{
    /**
     * Statuses that occupy a slot / count against the daily cap.
     */
    private const ACTIVE_STATUSES = ['pending', 'confirmed', 'in_progress'];

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Appointment::with(['patient.user', 'doctor.user'])->latest()->paginate($perPage);
    }

    public function findOrFail(int $id): Appointment
    {
        return Appointment::with(['patient.user', 'doctor.user'])->findOrFail($id);
    }

    public function create(array $data): Appointment
    {
        return Appointment::create($data);
    }

    public function update(Appointment $appointment, array $data): Appointment
    {
        $appointment->update($data);
        return $appointment;
    }

    /**
     * Get appointments for a doctor on a given date with active statuses.
     */
    public function getDoctorBookings(int $doctorId, string $date): Collection
    {
        return Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->get();
    }

    /**
     * Lock the doctor's active bookings for a date for the duration of the
     * current transaction, so concurrent booking attempts for the same date
     * serialize instead of racing past the overlap/cap checks together.
     *
     * Must be called inside a DB::transaction().
     */
    public function lockDoctorBookings(int $doctorId, string $date): Collection
    {
        return Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->lockForUpdate()
            ->get();
    }

    /**
     * Count doctor's active bookings for a given date (for max_daily_appointments cap).
     */
    public function countDoctorBookings(int $doctorId, string $date): int
    {
        return Appointment::where('doctor_id', $doctorId)
            ->where('appointment_date', $date)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->count();
    }

    /**
     * Get patient's appointments.
     */
    public function getPatientAppointments(int $patientId, ?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Appointment::with(['doctor.user'])
            ->where('patient_id', $patientId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest('appointment_date')->paginate($perPage);
    }

    /**
     * Get doctor's appointments.
     */
    public function getDoctorAppointments(int $doctorId, ?string $status = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = Appointment::with(['patient.user'])
            ->where('doctor_id', $doctorId);

        if ($status) {
            $query->where('status', $status);
        }

        return $query->latest('appointment_date')->paginate($perPage);
    }
}
