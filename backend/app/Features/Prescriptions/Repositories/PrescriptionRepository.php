<?php

namespace App\Features\Prescriptions\Repositories;

use App\Models\Prescription;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class PrescriptionRepository
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Prescription::with(['patient.user', 'doctor.user', 'medications'])
            ->latest()
            ->paginate($perPage);
    }

    public function findOrFail(int $id): Prescription
    {
        return Prescription::with(['patient.user', 'doctor.user', 'medications'])->findOrFail($id);
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

    public function getPatientPrescriptions(int $patientId, int $perPage = 15): LengthAwarePaginator
    {
        return Prescription::with(['doctor.user', 'medications'])
            ->where('patient_id', $patientId)
            ->latest()
            ->paginate($perPage);
    }

    public function getDoctorPrescriptions(int $doctorId, int $perPage = 15): LengthAwarePaginator
    {
        return Prescription::with(['patient.user', 'medications'])
            ->where('doctor_id', $doctorId)
            ->latest()
            ->paginate($perPage);
    }
}
