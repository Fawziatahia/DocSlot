<?php

namespace App\Features\Doctors\Controllers;

use App\Features\Doctors\Actions\CreateDoctorAction;
use App\Features\Doctors\Actions\UpdateDoctorAction;
use App\Features\Doctors\DTOs\DoctorData;
use App\Features\Doctors\Repositories\DoctorRepository;
use App\Features\Doctors\Requests\StoreDoctorRequest;
use App\Features\Doctors\Requests\UpdateDoctorRequest;
use App\Features\Doctors\Resources\DoctorDetailResource;
use App\Features\Doctors\Resources\DoctorResource;
use App\Features\Doctors\Services\DoctorService;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Doctor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DoctorController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly DoctorRepository $doctorRepository,
        private readonly DoctorService $doctorService,
        private readonly CreateDoctorAction $createDoctorAction,
        private readonly UpdateDoctorAction $updateDoctorAction,
    ) {}

    /**
     * List/search doctors. Public for patients, full access for admin.
     * GET /api/doctors
     */
    public function index(Request $request): JsonResponse
    {
        $filters = $request->only(['q', 'specialization_id', 'department_id', 'min_fee', 'max_fee']);
        $perPage = (int) $request->input('per_page', 15);

        $doctors = $this->doctorService->searchDoctors($filters, $perPage);

        return $this->paginated($doctors, DoctorResource::class);
    }

    /**
     * Get doctor details with schedule.
     * GET /api/doctors/{id}
     */
    public function show(int $id): JsonResponse
    {
        $doctor = $this->doctorRepository->findWithSchedules($id);

        return $this->success(new DoctorDetailResource($doctor));
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
            'data' => new DoctorResource($doctor),
            'message' => 'Doctor created successfully.',
        ], 201);
    }

    /**
     * Update a doctor.
     * PUT /api/doctors/{id}
     */
    public function update(UpdateDoctorRequest $request, int $id): JsonResponse
    {
        $doctor = $this->updateDoctorAction->execute($id, $request->validated());
        $doctor->load(['user', 'specialization', 'department']);

        return $this->success(new DoctorResource($doctor), 'Doctor updated successfully.');
    }

    /**
     * Delete a doctor (admin only).
     * DELETE /api/doctors/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $doctor = $this->doctorRepository->findOrFail($id);
        $this->doctorRepository->delete($doctor);

        return $this->noContent();
    }

    /**
     * Suspend/activate a doctor (admin only).
     * PATCH /api/doctors/{id}/status
     */
    public function toggleStatus(Request $request, int $id): JsonResponse
    {
        $request->validate(['status' => ['required', 'string', 'in:active,suspended']]);

        $doctor = $this->doctorRepository->findOrFail($id);
        $this->doctorRepository->update($doctor, ['status' => $request->input('status')]);

        return $this->success(
            new DoctorResource($doctor->load(['user', 'specialization', 'department'])),
            'Doctor status updated successfully.'
        );
    }

    /**
     * Get available slots for a doctor on a given date.
     * GET /api/doctors/{id}/slots?date=2026-07-30
     */
    public function slots(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
        ]);

        $doctor = $this->doctorRepository->findOrFail($id);
        $date = $request->input('date');
        $dayOfWeek = (int) \Carbon\Carbon::parse($date)->format('w');

        $schedule = \App\Models\DoctorSchedule::where('doctor_id', $id)
            ->where('day_of_week', $dayOfWeek)
            ->where('is_available', true)
            ->first();

        if (!$schedule) {
            return $this->success([], 'No availability for this date.');
        }

        $slots = \App\Features\Shared\Helpers\SlotHelper::generateSlots(
            $schedule->start_time,
            $schedule->end_time,
            $schedule->slot_duration
        );

        // Remove slots that conflict with existing appointments
        $bookedAppointments = \App\Models\Appointment::where('doctor_id', $id)
            ->where('appointment_date', $date)
            ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
            ->get()
            ->keyBy(function ($apt) {
                return $apt->start_time;
            });

        $available = array_values(array_filter($slots, function ($slot) use ($bookedAppointments) {
            return !isset($bookedAppointments[$slot['start']]);
        }));

        // Enforce max_daily_appointments cap
        if ($schedule->max_daily_appointments) {
            $todayBookings = \App\Models\Appointment::where('doctor_id', $id)
                ->where('appointment_date', $date)
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->count();

            $remaining = max(0, $schedule->max_daily_appointments - $todayBookings);
            $available = array_slice($available, 0, $remaining);
        }

        return $this->success($available);
    }

    /**
     * Get appointments for a doctor.
     * GET /api/doctors/{id}/appointments
     */
    public function appointments(Request $request, int $id): JsonResponse
    {
        // TODO: Full implementation when Appointments feature is built
        return $this->success([
            'doctor_id' => $id,
            'message' => 'Appointments listing — to be implemented with Appointments feature.',
        ]);
    }
}
