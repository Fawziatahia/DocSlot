<?php

namespace App\Features\Doctors\Controllers;

use App\Features\Appointments\Repositories\AppointmentRepository;
use App\Features\Appointments\Resources\AppointmentResource;
use App\Features\Appointments\Services\SlotService;
use App\Features\Doctors\Actions\CreateDoctorAction;
use App\Features\Doctors\Actions\UpdateDoctorAction;
use App\Features\Doctors\DTOs\DoctorData;
use App\Features\Doctors\Repositories\DoctorRepository;
use App\Features\Doctors\Requests\StoreDoctorRequest;
use App\Features\Doctors\Requests\UpdateDoctorRequest;
use App\Features\Doctors\Resources\DoctorDetailResource;
use App\Features\Doctors\Services\DoctorService;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Doctor;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class DoctorController
{
    use ApiResponseTrait, AuthorizesRequests;

    public function __construct(
        private readonly DoctorRepository $doctorRepository,
        private readonly DoctorService $doctorService,
        private readonly CreateDoctorAction $createDoctorAction,
        private readonly UpdateDoctorAction $updateDoctorAction,
        private readonly AppointmentRepository $appointmentRepository,
        private readonly SlotService $slotService,
    ) {}

    /**
     * List/search doctors. Public for patients, full access for admin.
     * GET /api/doctors
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['q', 'specialization_id', 'department_id', 'min_fee', 'max_fee', 'status']);
        $perPage = (int) $request->input('per_page', 15);

        // Admins search the whole roster, including suspended doctors, and can
        // match on licence number and email; everyone else sees the directory.
        $filters['privileged'] = (bool) $request->user('sanctum')?->isAdmin();

        $doctors = $this->doctorService->searchDoctors($filters, $perPage);

        return $this->paginated($doctors, DoctorDetailResource::class);
    }

    /**
     * Get doctor details with schedule.
     * GET /api/doctors/{id}
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $doctor = $this->doctorRepository->findWithSchedules($id);

        $user = $request->user('sanctum');
        $isOwnerOrAdmin = $user && Gate::forUser($user)->allows('view', $doctor);

        if (! $doctor->isPubliclyVisible() && ! $isOwnerOrAdmin) {
            return $this->error('Doctor not found.', 404);
        }

        return $this->success((new DoctorDetailResource($doctor))->detailed());
    }

    /**
     * Create a new doctor (admin only).
     * POST /api/doctors
     */
    public function store(StoreDoctorRequest $request): JsonResponse
    {
        $data = DoctorData::fromArray($request->validated());
        $doctor = $this->createDoctorAction->execute($data);

        $doctor->load(['user', 'specialization', 'department']);

        return response()->json([
            'success' => true,
            'data' => new DoctorDetailResource($doctor),
            'message' => 'Doctor created successfully.',
        ], 201);
    }

    /**
     * Update a doctor.
     * PUT /api/doctors/{id}
     */
    public function update(UpdateDoctorRequest $request, string $id): JsonResponse
    {
        $this->authorize('update', $this->doctorRepository->findByPublicId($id));

        $doctor = $this->updateDoctorAction->execute($id, $request->validated());
        $doctor->load(['user', 'specialization', 'department']);

        return $this->success(new DoctorDetailResource($doctor), 'Doctor updated successfully.');
    }

    /**
     * Delete a doctor (admin only).
     * DELETE /api/doctors/{id}
     */
    public function destroy(string $id): JsonResponse
    {
        $doctor = $this->doctorRepository->findByPublicId($id);
        $this->doctorRepository->delete($doctor);

        return $this->noContent();
    }

    /**
     * Suspend/activate a doctor (admin only).
     * PATCH /api/doctors/{id}/status
     */
    public function toggleStatus(Request $request, string $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'string', 'in:active,suspended']]);

        $doctor = $this->doctorRepository->findByPublicId($id);
        $this->doctorRepository->update($doctor, ['status' => $request->input('status')]);
        $doctor->load(['user', 'specialization', 'department']);

        $isActive = $request->input('status') === 'active';
        $doctor->user->update(['is_active' => $isActive]);
        if (! $isActive) {
            $doctor->user->tokens()->delete();
        }

        return $this->success(
            new DoctorDetailResource($doctor),
            'Doctor status updated successfully.'
        );
    }

    /**
     * Get available slots for a doctor on a given date.
     * GET /api/doctors/{id}/slots?date=2026-07-30
     */
    public function slots(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $doctor = $this->doctorRepository->findByPublicId($id);

        if (! $doctor->isPubliclyVisible()) {
            return $this->success([], 'This doctor is not currently accepting appointments.');
        }

        $slots = $this->slotService->availableSlots($doctor, $request->input('date'));

        return $this->success($slots);
    }

    /**
     * Get appointments for a doctor.
     * GET /api/doctors/{id}/appointments
     */
    public function appointments(Request $request, string $id): JsonResponse
    {
        $doctor = $this->doctorRepository->findByPublicId($id);
        $this->authorize('viewAppointments', $doctor);

        $perPage = (int) $request->input('per_page', 15);
        $appointments = $this->appointmentRepository->getDoctorAppointments(
            $doctor->id,
            $request->input('status'),
        );

        return $this->paginated($appointments, AppointmentResource::class);
    }
}
