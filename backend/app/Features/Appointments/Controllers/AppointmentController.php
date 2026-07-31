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
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppointmentController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly AppointmentRepository $appointmentRepository,
        private readonly AppointmentService $appointmentService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->input('per_page', 15);
        $appointments = $this->appointmentRepository->paginate($perPage);

        return $this->paginated($appointments, AppointmentResource::class);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorizeAction($request->user(), $appointment);

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
        $this->authorizeAction($request->user(), $appointment);

        $appointment = $this->appointmentService->cancelAppointment(
            $appointment,
            $request->validated('cancellation_reason'),
        );

        return $this->success(
            new AppointmentDetailResource($appointment->load(['patient.user', 'doctor.user'])),
            'Appointment cancelled successfully.'
        );
    }

    public function confirm(Request $request, int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorizeDoctorAction($request->user(), $appointment);
        $appointment = $this->appointmentService->confirmAppointment($appointment);

        return $this->success(
            new AppointmentDetailResource($appointment->load(['patient.user', 'doctor.user'])),
            'Appointment confirmed successfully.'
        );
    }

    public function complete(Request $request, int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorizeDoctorAction($request->user(), $appointment);
        $appointment = $this->appointmentService->completeAppointment($appointment);

        return $this->success(
            new AppointmentDetailResource($appointment->load(['patient.user', 'doctor.user'])),
            'Appointment completed successfully.'
        );
    }

    public function reschedule(RescheduleAppointmentRequest $request, int $id): JsonResponse
    {
        $appointment = $this->appointmentRepository->findOrFail($id);
        $this->authorizeAction($request->user(), $appointment);
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

        if ($user->isPatient()) {
            $patient = $user->patient;
            $appointments = $this->appointmentRepository->getPatientAppointments(
                $patient->id,
                $request->input('status'),
            );
        } elseif ($user->isDoctor()) {
            $doctor = $user->doctor;
            $appointments = $this->appointmentRepository->getDoctorAppointments(
                $doctor->id,
                $request->input('status'),
            );
        } else {
            return $this->error('Unauthorized.', 403);
        }

        return $this->paginated($appointments, AppointmentResource::class);
    }

    private function authorizeAction($user, $appointment): void
    {
        $isDoctor = $user->isDoctor() && $user->doctor->id === $appointment->doctor_id;
        $isPatient = $user->isPatient() && $user->patient->id === $appointment->patient_id;
        $isAdmin = $user->isAdmin();

        if (!$isDoctor && !$isPatient && !$isAdmin) {
            abort(403, 'This action is not allowed.');
        }
    }

    private function authorizeDoctorAction($user, $appointment): void
    {
        $isDoctor = $user->isDoctor() && $user->doctor->id === $appointment->doctor_id;
        $isAdmin = $user->isAdmin();

        if (!$isDoctor && !$isAdmin) {
            abort(403, 'This action is not allowed.');
        }
    }
}
