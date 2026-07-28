<?php

namespace App\Features\Prescriptions\Services;

use App\Features\Prescriptions\DTOs\PrescriptionData;
use App\Features\Prescriptions\Repositories\PrescriptionRepository;
use App\Models\Prescription;
use Illuminate\Support\Facades\DB;

class PrescriptionService
{
    public function __construct(
        private readonly PrescriptionRepository $prescriptionRepository,
    ) {}

    public function createPrescription(PrescriptionData $data, int $doctorId): Prescription
    {
        return DB::transaction(function () use ($data, $doctorId) {
            $prescription = $this->prescriptionRepository->create([
                'patient_id' => $data->patientId,
                'doctor_id' => $doctorId,
                'appointment_id' => $data->appointmentId,
                'diagnosis' => $data->diagnosis,
                'notes' => $data->notes,
                'status' => 'active',
            ]);

            foreach ($data->medications as $med) {
                $prescription->medications()->create([
                    'medication_name' => $med['medication_name'],
                    'dosage' => $med['dosage'],
                    'frequency' => $med['frequency'],
                    'duration' => $med['duration'] ?? null,
                    'instructions' => $med['instructions'] ?? null,
                ]);
            }

            return $prescription->load(['patient.user', 'doctor.user', 'medications']);
        });
    }
}
