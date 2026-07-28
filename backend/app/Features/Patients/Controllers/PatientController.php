<?php

namespace App\Features\Patients\Controllers;

use App\Features\Patients\Policies\PatientPolicy;
use App\Features\Patients\Repositories\PatientRepository;
use App\Features\Patients\Requests\StorePatientRequest;
use App\Features\Patients\Requests\UpdatePatientRequest;
use App\Features\Patients\Resources\PatientDetailResource;
use App\Features\Patients\Resources\PatientResource;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly PatientRepository $patientRepository,
        private readonly PatientPolicy $policy,
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
    public function medicalHistory(int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);
        $user = request()->user();

        if (!$this->policy->viewMedicalHistory($user, $patient)) {
            return $this->error('Forbidden.', 403);
        }

        // TODO: Return actual medical records when MedicalRecords feature is built
        return $this->success([
            'patient_id' => $id,
            'records' => [],
            'message' => 'Medical records — to be implemented with MedicalRecords feature.',
        ]);
    }

    /**
     * View prescriptions.
     * GET /api/patients/{id}/prescriptions
     */
    public function prescriptions(int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);
        $user = request()->user();

        if (!$this->policy->viewPrescriptions($user, $patient)) {
            return $this->error('Forbidden.', 403);
        }

        // TODO: Return actual prescriptions when Prescriptions feature is built
        return $this->success([
            'patient_id' => $id,
            'prescriptions' => [],
            'message' => 'Prescriptions — to be implemented with Prescriptions feature.',
        ]);
    }
}
