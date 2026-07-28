<?php

namespace App\Features\MedicalRecords\Repositories;

use App\Models\MedicalRecord;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

class MedicalRecordRepository
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return MedicalRecord::with(['patient.user', 'doctor.user'])
            ->latest()
            ->paginate($perPage);
    }

    public function findOrFail(int $id): MedicalRecord
    {
        return MedicalRecord::with(['patient.user', 'doctor.user'])->findOrFail($id);
    }

    public function create(array $data): MedicalRecord
    {
        return MedicalRecord::create($data);
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

    public function getPatientRecords(int $patientId, ?string $type = null, int $perPage = 15): LengthAwarePaginator
    {
        $query = MedicalRecord::with(['doctor.user'])
            ->where('patient_id', $patientId);

        if ($type) {
            $query->where('record_type', $type);
        }

        return $query->latest()->paginate($perPage);
    }
}
