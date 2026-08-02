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

    /**
     * Update a prescription, replacing its medication lines when the caller
     * sends them.
     *
     * `medications` isn't a column, so passing the whole validated payload to
     * a mass update silently dropped it — the request came back "updated
     * successfully" while the medications were left untouched.
     *
     * @param  array<string, mixed>  $data
     */
    public function updatePrescription(Prescription $prescription, array $data): Prescription
    {
        return DB::transaction(function () use ($prescription, $data) {
            $medications = $data['medications'] ?? null;
            unset($data['medications']);

            $this->prescriptionRepository->update($prescription, $data);

            if (is_array($medications)) {
                $prescription->medications()->delete();

                foreach ($medications as $med) {
                    $prescription->medications()->create([
                        'medication_name' => $med['medication_name'],
                        'dosage' => $med['dosage'],
                        'frequency' => $med['frequency'],
                        'duration' => $med['duration'] ?? null,
                        'instructions' => $med['instructions'] ?? null,
                    ]);
                }
            }

            return $prescription->fresh()->load(['patient.user', 'doctor.user', 'medications']);
        });
    }
}
