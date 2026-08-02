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

    /**
     * Narrow an appointment query by free-text search and status.
     *
     * `q` matches an appointment number, a patient or doctor ID exactly, or
     * partially matches either party's name or the stated reason for the
     * visit — so "42", "p7894622", "Rahman" and "chest pain" all find it.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Appointment>  $query
     * @param  array<string, mixed>  $filters
     */
    private function applyFilters($query, array $filters)
    {
        if (! empty($filters['q'])) {
            $q = trim($filters['q']);
            $query->where(function ($qry) use ($q) {
                $qry->where('reason', 'like', "%{$q}%")
                    ->orWhereHas('patient', function ($p) use ($q) {
                        $p->where('public_id', $q)
                            ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%"));
                    })
                    ->orWhereHas('doctor', function ($d) use ($q) {
                        $d->where('public_id', $q)
                            ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%"));
                    });

                if (ctype_digit($q)) {
                    $qry->orWhere('id', (int) $q);
                }
            });
        }

        if (! empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        return $query;
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Appointment::with(['patient.user', 'doctor.user']);

        return $this->applyFilters($query, $filters)->latest()->paginate($perPage);
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
     *
     * @param  array<string, mixed>  $filters
     */
    public function getPatientAppointments(int $patientId, ?string $status = null, int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Appointment::with(['doctor.user'])
            ->where('patient_id', $patientId);

        return $this->applyFilters($query, $filters + ['status' => $status])
            ->latest('appointment_date')
            ->paginate($perPage);
    }

    /**
     * Get doctor's appointments.
     *
     * @param  array<string, mixed>  $filters
     */
    public function getDoctorAppointments(int $doctorId, ?string $status = null, int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Appointment::with(['patient.user'])
            ->where('doctor_id', $doctorId);

        return $this->applyFilters($query, $filters + ['status' => $status])
            ->latest('appointment_date')
            ->paginate($perPage);
    }
}
