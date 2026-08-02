<?php

namespace App\Features\Appointments\Controllers;

use App\Features\Appointments\DTOs\AppointmentData;
use App\Features\Appointments\DTOs\RescheduleData;
use App\Features\Appointments\Repositories\AppointmentRepository;
use App\Features\Appointments\Requests\BookAppointmentRequest;
use App\Features\Appointments\Requests\CancelAppointmentRequest;
use App\Features\Appointments\Requests\RescheduleAppointmentRequest;
use App\Features\Appointments\Resources\AppointmentDetailResource;
use App\Features\Appointments\Resources\AppointmentResource;
use App\Features\Appointments\Services\AppointmentService;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Doctor;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController
{
    use ApiResponseTrait, AuthorizesRequests;

    public function __construct(
        private readonly AppointmentRepository $appointmentRepository,
        private readonly AppointmentService $appointmentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $appointments = $this->appointmentRepository->paginate($perPage, $request->only(['q', 'status']));

        return $this->paginated($appointments, AppointmentResource::class);
    }

    public function show(int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorize('view', $appointment);

        return $this->success(new AppointmentDetailResource($appointment));
    }

    public function store(BookAppointmentRequest $request): JsonResponse
    {
        $doctor = Doctor::where('public_id', $request->validated('doctor_id'))->firstOrFail();
        $data = AppointmentData::fromArray(array_merge($request->validated(), ['doctor_id' => $doctor->id]));
        $patient = $request->user()->patient;

        if (!$patient) {
            return $this->error('Only patients can book appointments.', 403);
        }

        $appointment = $this->appointmentService->bookAppointment($data, $patient->id);
        $appointment->load(['patient.user', 'doctor.user']);

        return response()->json([
            'success' => true,
            'data' => new AppointmentDetailResource($appointment),
            'message' => 'Appointment booked successfully.',
        ], 201);
    }

    public function cancel(CancelAppointmentRequest $request, int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorize('view', $appointment);

        $appointment = $this->appointmentService->cancelAppointment(
            $appointment,
            $request->validated('cancellation_reason'),
        );

        return $this->success(
            new AppointmentDetailResource($appointment->load(['patient.user', 'doctor.user'])),
            'Appointment cancelled successfully.'
        );
    }

    public function confirm(int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorize('actAsDoctor', $appointment);
        $appointment = $this->appointmentService->confirmAppointment($appointment);

        return $this->success(
            new AppointmentDetailResource($appointment->load(['patient.user', 'doctor.user'])),
            'Appointment confirmed successfully.'
        );
    }

    public function complete(int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorize('actAsDoctor', $appointment);
        $appointment = $this->appointmentService->completeAppointment($appointment);

        return $this->success(
            new AppointmentDetailResource($appointment->load(['patient.user', 'doctor.user'])),
            'Appointment completed successfully.'
        );
    }

    public function reschedule(RescheduleAppointmentRequest $request, int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorize('view', $appointment);
        $data = RescheduleData::fromArray($request->validated());

        $appointment = $this->appointmentService->rescheduleAppointment(
            $appointment,
            $data->appointmentDate,
            $data->startTime,
            $data->endTime,
        );

        return $this->success(
            new AppointmentDetailResource($appointment->load(['patient.user', 'doctor.user'])),
            'Appointment rescheduled successfully.'
        );
    }

    public function myAppointments(Request $request): JsonResponse
    {
        $user = $request->user();

        $perPage = (int) $request->input('per_page', 15);
        $filters = $request->only(['q']);

        if ($user->isPatient()) {
            $patient = $user->patient;
            $appointments = $this->appointmentRepository->getPatientAppointments(
                $patient->id,
                $request->input('status'),
                $perPage,
                $filters,
            );
        } elseif ($user->isDoctor()) {
            $doctor = $user->doctor;
            $appointments = $this->appointmentRepository->getDoctorAppointments(
                $doctor->id,
                $request->input('status'),
                $perPage,
                $filters,
            );
        } else {
            return $this->error('Unauthorized.', 403);
        }

        return $this->paginated($appointments, AppointmentResource::class);
    }
}
