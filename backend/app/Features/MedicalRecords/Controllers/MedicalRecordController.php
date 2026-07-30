<?php

namespace App\Features\MedicalRecords\Controllers;

use App\Features\MedicalRecords\Repositories\MedicalRecordRepository;
use App\Features\MedicalRecords\Requests\StoreMedicalRecordRequest;
use App\Features\MedicalRecords\Requests\UpdateMedicalRecordRequest;
use App\Features\MedicalRecords\Resources\MedicalRecordResource;
use App\Features\MedicalRecords\Services\MedicalRecordService;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicalRecordController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly MedicalRecordRepository $medicalRecordRepository,
        private readonly MedicalRecordService $medicalRecordService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $records = $this->medicalRecordRepository->paginate($perPage);

        return $this->paginated($records, MedicalRecordResource::class);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $record = $this->medicalRecordRepository->findOrFail($id);
        $this->authorizeView($request->user(), $record);

        return $this->success(new MedicalRecordResource($record));
    }

    public function store(StoreMedicalRecordRequest $request): JsonResponse
    {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return $this->error('Only doctors can create medical records.', 403);
        }

        $record = $this->medicalRecordService->createRecord($request->validated(), $doctor->id);

        return response()->json([
            'success' => true,
            'data' => new MedicalRecordResource($record->load(['patient.user', 'doctor.user'])),
            'message' => 'Medical record created successfully.',
        ], 201);
    }

    public function update(UpdateMedicalRecordRequest $request, int $id): JsonResponse
    {
        $record = $this->medicalRecordRepository->findOrFail($id);
        $this->authorizeEdit($request->user(), $record);
        $this->medicalRecordRepository->update($record, $request->validated());

        return $this->success(
            new MedicalRecordResource($record->fresh()->load(['patient.user', 'doctor.user'])),
            'Medical record updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $record = $this->medicalRecordRepository->findOrFail($id);
        $this->medicalRecordRepository->delete($record);

        return $this->noContent();
    }

    public function myRecords(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->isPatient()) {
            $records = $this->medicalRecordRepository->getPatientRecords(
                $user->patient->id,
                $request->input('record_type'),
                (int) $request->input('per_page', 15),
            );
        } else {
            return $this->error('Unauthorized.', 403);
        }

        return $this->paginated($records, MedicalRecordResource::class);
    }

    private function authorizeView($user, $record): void
    {
        // Any doctor may view any medical record (consistent with the patient
        // medical-history/prescriptions list endpoints, which already allow this).
        $isDoctor = $user->isDoctor();
        $isPatient = $user->isPatient() && $user->patient->id === $record->patient_id;
        $isAdmin = $user->isAdmin();

        if (!$isDoctor && !$isPatient && !$isAdmin) {
            abort(403, 'This action is not allowed.');
        }
    }

    private function authorizeEdit($user, $record): void
    {
        $isDoctor = $user->isDoctor() && $user->doctor->id === $record->doctor_id;
        $isAdmin = $user->isAdmin();

        if (!$isDoctor && !$isAdmin) {
            abort(403, 'This action is not allowed.');
        }
    }
}
