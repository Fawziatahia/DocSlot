<?php

namespace App\Features\Prescriptions\Controllers;

use App\Features\Prescriptions\DTOs\PrescriptionData;
use App\Features\Prescriptions\Repositories\PrescriptionRepository;
use App\Features\Prescriptions\Requests\StorePrescriptionRequest;
use App\Features\Prescriptions\Requests\UpdatePrescriptionRequest;
use App\Features\Prescriptions\Resources\PrescriptionResource;
use App\Features\Prescriptions\Services\PrescriptionService;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Patient;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PrescriptionController
{
    use ApiResponseTrait, AuthorizesRequests;

    public function __construct(
        private readonly PrescriptionRepository $prescriptionRepository,
        private readonly PrescriptionService $prescriptionService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $prescriptions = $this->prescriptionRepository->paginate($perPage, $request->only(['q', 'status']));

        return $this->paginated($prescriptions, PrescriptionResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $prescription = $this->prescriptionRepository->findOrFail($id);
        $this->authorize('view', $prescription);

        return $this->success(new PrescriptionResource($prescription));
    }

    public function store(StorePrescriptionRequest $request): JsonResponse
    {
        $doctor = $request->user()->doctor;

        if (!$doctor) {
            return $this->error('Only doctors can create prescriptions.', 403);
        }

        $patient = Patient::where('public_id', $request->validated('patient_id'))->firstOrFail();
        $data = PrescriptionData::fromArray(array_merge($request->validated(), ['patient_id' => $patient->id]));
        $prescription = $this->prescriptionService->createPrescription($data, $doctor->id);

        return response()->json([
            'success' => true,
            'data' => new PrescriptionResource($prescription),
            'message' => 'Prescription created successfully.',
        ], 201);
    }

    public function update(UpdatePrescriptionRequest $request, int $id): JsonResponse
    {
        $prescription = $this->prescriptionRepository->findOrFail($id);
        $this->authorize('update', $prescription);

        $prescription = $this->prescriptionService->updatePrescription($prescription, $request->validated());

        return $this->success(
            new PrescriptionResource($prescription),
            'Prescription updated successfully.'
        );
    }

    public function destroy(int $id): JsonResponse
    {
        $prescription = $this->prescriptionRepository->findOrFail($id);
        $this->prescriptionRepository->delete($prescription);

        return $this->noContent();
    }

    public function myPrescriptions(Request $request): JsonResponse
    {
        $user = $request->user();

        $filters = $request->only(['q', 'status']);

        if ($user->isPatient()) {
            $prescriptions = $this->prescriptionRepository->getPatientPrescriptions(
                $user->patient->id,
                (int) $request->input('per_page', 15),
                $filters,
            );
        } elseif ($user->isDoctor()) {
            $prescriptions = $this->prescriptionRepository->getDoctorPrescriptions(
                $user->doctor->id,
                (int) $request->input('per_page', 15),
                $filters,
            );
        } else {
            return $this->error('Unauthorized.', 403);
        }

        return $this->paginated($prescriptions, PrescriptionResource::class);
    }
}
