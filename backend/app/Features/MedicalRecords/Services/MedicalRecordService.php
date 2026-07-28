<?php

namespace App\Features\MedicalRecords\Services;

use App\Features\MedicalRecords\Repositories\MedicalRecordRepository;
use App\Models\MedicalRecord;

class MedicalRecordService
{
    public function __construct(
        private readonly MedicalRecordRepository $medicalRecordRepository,
    ) {}

    public function createRecord(array $data, int $doctorId): MedicalRecord
    {
        return $this->medicalRecordRepository->create([
            'patient_id' => $data['patient_id'],
            'doctor_id' => $doctorId,
            'appointment_id' => $data['appointment_id'] ?? null,
            'record_type' => $data['record_type'],
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'file_path' => $data['file_path'] ?? null,
            'notes' => $data['notes'] ?? null,
        ]);
    }
}
