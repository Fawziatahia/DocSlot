<?php

namespace App\Features\Patients\Controllers;

use App\Features\MedicalRecords\Repositories\MedicalRecordRepository;
use App\Features\MedicalRecords\Resources\MedicalRecordResource;
use App\Features\Patients\Repositories\PatientRepository;
use App\Features\Patients\Requests\UpdatePatientRequest;
use App\Features\Patients\Resources\PatientDetailResource;
use App\Features\Prescriptions\Repositories\PrescriptionRepository;
use App\Features\Prescriptions\Resources\PrescriptionResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Patient;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController
{
    use ApiResponseTrait, AuthorizesRequests;

    public function __construct(
        private readonly PatientRepository $patientRepository,
        private readonly MedicalRecordRepository $medicalRecordRepository,
        private readonly PrescriptionRepository $prescriptionRepository,
    ) {}

    /**
     * List/search patients (admin & doctor — PatientPolicy already lets both
     * view any patient record).
     * GET /api/patients?q=&status=
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['q', 'status']);
        $perPage = (int) $request->input('per_page', 15);

        $patients = $this->patientRepository->search($filters, $perPage);

        return $this->paginated($patients, PatientDetailResource::class);
    }

    /**
     * Get patient details (admin, doctor, or the patient themself).
     * GET /api/patients/{id}
     */
    public function show(string $id): JsonResponse
    {
        $patient = $this->patientRepository->findByPublicId($id);
        $this->authorize('view', $patient);

        return $this->success((new PatientDetailResource($patient))->detailed());
    }

    /**
     * Update patient.
     * PUT /api/patients/{id}
     */
    public function update(UpdatePatientRequest $request, string $id): JsonResponse
    {
        $patient = $this->patientRepository->findByPublicId($id);
        $this->authorize('update', $patient);

        $this->patientRepository->update($patient, $request->validated());

        return $this->success(
            (new PatientDetailResource($patient->fresh()->load('user')))->detailed(),
            'Patient updated successfully.'
        );
    }

    /**
     * Delete patient (admin only).
     * DELETE /api/patients/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $patient = $this->patientRepository->findByPublicId($id);
        $this->authorize('delete', $patient);

        $this->patientRepository->delete($patient);

        return $this->noContent();
    }

    /**
     * Suspend/activate patient.
     * PATCH /api/patients/{id}/status
     */
    public function toggleStatus(Request $request, string $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'string', 'in:active,suspended']]);
        $this->authorize('toggleStatus', Patient::class);

        $patient = $this->patientRepository->findByPublicId($id);
        $this->patientRepository->update($patient, ['status' => $request->input('status')]);
        $patient = $patient->fresh()->load('user');

        $isActive = $request->input('status') === 'active';
        $patient->user->update(['is_active' => $isActive]);
        if (! $isActive) {
            $patient->user->tokens()->delete();
        }

        return $this->success(
            (new PatientDetailResource($patient))->detailed(),
            'Patient status updated successfully.'
        );
    }

    /**
     * View medical history.
     * GET /api/patients/{id}/medical-history
     */
    public function medicalHistory(Request $request, string $id): JsonResponse
    {
        $patient = $this->patientRepository->findByPublicId($id);
        $this->authorize('viewMedicalHistory', $patient);

        $records = $this->medicalRecordRepository->getPatientRecords(
            $patient->id,
            $request->input('record_type'),
            (int) $request->input('per_page', 15),
        );

        return $this->paginated($records, MedicalRecordResource::class);
    }

    /**
     * View prescriptions.
     * GET /api/patients/{id}/prescriptions
     */
    public function prescriptions(Request $request, string $id): JsonResponse
    {
        $patient = $this->patientRepository->findByPublicId($id);
        $this->authorize('viewPrescriptions', $patient);

        $prescriptions = $this->prescriptionRepository->getPatientPrescriptions(
            $patient->id,
            (int) $request->input('per_page', 15),
            $request->only(['q', 'status']),
        );

        return $this->paginated($prescriptions, PrescriptionResource::class);
    }
}
