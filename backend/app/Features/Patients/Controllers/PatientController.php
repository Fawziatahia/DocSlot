<?php

namespace App\Features\Patients\Controllers;

use App\Features\Patients\Repositories\PatientRepository;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PatientController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly PatientRepository $patientRepository,
    ) {}

    /**
     * List patients (admin only).
     * GET /api/patients
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $patients = $this->patientRepository->paginate($perPage);

        return $this->paginated($patients, \App\Features\Patients\Resources\PatientResource::class);
    }

    /**
     * Get patient details.
     * GET /api/patients/{id}
     */
    public function show(int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);

        return $this->success(new \App\Features\Patients\Resources\PatientDetailResource($patient));
    }

    /**
     * Update patient.
     * PUT /api/patients/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $patient = $this->patientRepository->findOrFail($id);

        $validated = $request->validate([
            'date_of_birth' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'in:male,female,other'],
            'address' => ['nullable', 'string', 'max:500'],
            'blood_group' => ['nullable', 'string', 'max:5'],
            'emergency_contact' => ['nullable', 'string', 'max:20'],
            'emergency_contact_name' => ['nullable', 'string', 'max:255'],
        ]);

        $this->patientRepository->update($patient, $validated);

        return $this->success(
            new \App\Features\Patients\Resources\PatientDetailResource($patient->fresh()->load('user')),
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

        $patient = $this->patientRepository->findOrFail($id);
        $this->patientRepository->update($patient, ['status' => $request->input('status')]);

        return $this->success(
            new \App\Features\Patients\Resources\PatientDetailResource($patient->fresh()->load('user')),
            'Patient status updated successfully.'
        );
    }
}
