<?php

namespace App\Features\MedicalRecords\Controllers;

use App\Features\MedicalRecords\Repositories\MedicalRecordRepository;
use App\Features\MedicalRecords\Requests\StoreMedicalRecordRequest;
use App\Features\MedicalRecords\Requests\UpdateMedicalRecordRequest;
use App\Features\MedicalRecords\Resources\MedicalRecordResource;
use App\Features\MedicalRecords\Services\MedicalRecordService;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Patient;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MedicalRecordController
{
    use ApiResponseTrait, AuthorizesRequests;

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

    public function show(int $id): JsonResponse
    {
        $record = $this->medicalRecordRepository->findOrFail($id);
        $this->authorize('view', $record);

        return $this->success(new MedicalRecordResource($record));
    }

    public function store(StoreMedicalRecordRequest $request): JsonResponse
    {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return $this->error('Only doctors can create medical records.', 403);
        }

        $patient = Patient::where('public_id', $request->validated('patient_id'))->firstOrFail();
        $record = $this->medicalRecordService->createRecord(
            array_merge($request->validated(), ['patient_id' => $patient->id]),
            $doctor->id
        );

        return response()->json([
            'success' => true,
            'data' => new MedicalRecordResource($record->load(['patient.user', 'doctor.user'])),
            'message' => 'Medical record created successfully.',
        ], 201);
    }

    public function update(UpdateMedicalRecordRequest $request, int $id): JsonResponse
    {
        $record = $this->medicalRecordRepository->findOrFail($id);
        $this->authorize('update', $record);
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
}
