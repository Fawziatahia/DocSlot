<?php

namespace App\Features\Patients\Controllers;

use App\Features\MedicalRecords\Repositories\MedicalRecordRepository;
use App\Features\MedicalRecords\Resources\MedicalRecordResource;
use App\Features\Patients\Policies\PatientPolicy;
use App\Features\Patients\Repositories\PatientRepository;
use App\Features\Patients\Requests\StorePatientRequest;
use App\Features\Patients\Requests\UpdatePatientRequest;
use App\Features\Patients\Resources\PatientDetailResource;
use App\Features\Patients\Resources\PatientResource;
use App\Features\Prescriptions\Repositories\PrescriptionRepository;
use App\Features\Prescriptions\Resources\PrescriptionResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly PatientRepository $patientRepository,
        private readonly PatientPolicy $policy,
        private readonly MedicalRecordRepository $medicalRecordRepository,
        private readonly PrescriptionRepository $prescriptionRepository,
    ) {}

    /**
     * List patients (admin only).
     * GET /api/patients
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $patients = $this->patientRepository->paginate($perPage);

        return $this->paginated($patients, PatientResource::class);
    }

    /**
     * Get patient details (admin, doctor, or the patient themself).
     * GET /api/patients/{id}
     */
    public function show(int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);

        // Policy check
        if (!$this->policy->view($request = request()->user(), $patient)) {
            return $this->error('Forbidden.', 403);
        }

        return $this->success(new PatientDetailResource($patient));
    }

    /**
     * Update patient.
     * PUT /api/patients/{id}
     */
    public function update(UpdatePatientRequest $request, int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);

        $this->patientRepository->update($patient, $request->validated());

        return $this->success(
            new PatientDetailResource($patient->fresh()->load('user')),
            'Patient updated successfully.'
        );
    }

    /**
     * Delete patient (admin only).
     * DELETE /api/patients/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);

        if (!request()->user()?->hasRole('admin')) {
            return $this->error('Forbidden.', 403);
        }

        $this->patientRepository->delete($patient);

        return $this->noContent();
    }

    /**
     * Suspend/activate patient.
     * PATCH /api/patients/{id}/status
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'string', 'in:active,suspended']]);

        if (!$request->user()?->hasRole('admin')) {
            return $this->error('Forbidden.', 403);
        }

        $patient = $this->patientRepository->findOrFail($id);
        $this->patientRepository->update($patient, ['status' => $request->input('status')]);

        return $this->success(
            new PatientDetailResource($patient->fresh()->load('user')),
            'Patient status updated successfully.'
        );
    }

    /**
     * View medical history.
     * GET /api/patients/{id}/medical-history
     */
    public function medicalHistory(Request $request, int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);
        $user = $request->user();

        if (!$this->policy->viewMedicalHistory($user, $patient)) {
            return $this->error('Forbidden.', 403);
        }

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
    public function prescriptions(Request $request, int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);
        $user = $request->user();

        if (!$this->policy->viewPrescriptions($user, $patient)) {
            return $this->error('Forbidden.', 403);
        }

        $prescriptions = $this->prescriptionRepository->getPatientPrescriptions(
            $patient->id,
            (int) $request->input('per_page', 15),
        );

        return $this->paginated($prescriptions, PrescriptionResource::class);
    }
}
