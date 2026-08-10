<?php

namespace App\Features\Prescriptions\Repositories;

use App\Models\Prescription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class PrescriptionRepository
{
    /**
     * Narrow a prescription query by free-text search and status.
     *
     * `q` matches a patient or doctor ID exactly, or partially matches either
     * party's name, the diagnosis, or a prescribed medication — so "p7894622",
     * "Rahman", "asthma" and "Salbutamol" all find the same record.
     *
     * @param  \Illuminate\Database\Eloquent\Builder<Prescription>  $query
     * @param  array<string, mixed>  $filters
     */
    private function applyFilters($query, array $filters)
    {
        if (! empty($filters['q'])) {
            $q = trim($filters['q']);
            $query->where(function ($qry) use ($q) {
                $qry->where('diagnosis', 'like', "%{$q}%")
                    ->orWhereHas('patient', function ($p) use ($q) {
                        $p->where('public_id', $q)
                            ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%"));
                    })
                    ->orWhereHas('doctor', function ($d) use ($q) {
                        $d->where('public_id', $q)
                            ->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$q}%"));
                    })
                    ->orWhereHas('medications', fn ($m) => $m->where('medication_name', 'like', "%{$q}%"));
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
        $query = Prescription::with(['patient.user', 'doctor.user', 'medications']);

        return $this->applyFilters($query, $filters)
            ->latest()
            ->paginate($perPage);
    }

    public function findOrFail(int $id): Prescription
    {
        return Prescription::with([
            'patient.user',
            'doctor.user',
            'doctor.specialization',
            'doctor.department',
            'medications',
        ])->findOrFail($id);
    }

    public function create(array $data): Prescription
    {
        return Prescription::create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);
        return $model;
    }

    public function delete(Model $model): bool
    {
        return $model->delete();
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function getPatientPrescriptions(int $patientId, int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Prescription::with(['doctor.user', 'medications'])
            ->where('patient_id', $patientId);

        return $this->applyFilters($query, $filters)
            ->latest()
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $filters
     */
    public function getDoctorPrescriptions(int $doctorId, int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = Prescription::with(['patient.user', 'medications'])
            ->where('doctor_id', $doctorId);

        return $this->applyFilters($query, $filters)
            ->latest()
            ->paginate($perPage);
    }
}
