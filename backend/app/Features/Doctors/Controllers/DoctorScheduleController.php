<?php

namespace App\Features\Doctors\Controllers;

use App\Features\Doctors\DTOs\ScheduleData;
use App\Features\Doctors\Repositories\DoctorRepository;
use App\Features\Doctors\Repositories\DoctorScheduleRepository;
use App\Features\Doctors\Requests\ScheduleRequest;
use App\Features\Doctors\Resources\DoctorScheduleResource;
use App\Features\Doctors\Services\DoctorService;
use App\Features\Doctors\Services\ScheduleService;
use App\Features\Shared\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;

class DoctorScheduleController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly DoctorService $doctorService,
        private readonly ScheduleService $scheduleService,
        private readonly DoctorScheduleRepository $scheduleRepository,
        private readonly DoctorRepository $doctorRepository,
    ) {}

    /**
     * Get a doctor's schedule.
     * GET /api/doctors/{id}/schedule
     */
    public function show(string $doctorId): JsonResponse
    {
        $doctor = $this->doctorRepository->findByPublicId($doctorId);
        $schedules = $this->scheduleService->getDoctorSchedule($doctor->id);

        return $this->success(DoctorScheduleResource::collection($schedules));
    }

    /**
     * Update a doctor's full-week schedule (full replace).
     * PUT /api/doctors/{id}/schedule
     */
    public function update(ScheduleRequest $request, string $doctorId): JsonResponse
    {
        $doctor = $this->doctorRepository->findByPublicId($doctorId);
        $scheduleData = ScheduleData::fromArray($request->validated(), $doctor->id);
        $schedules = $this->doctorService->manageSchedule($scheduleData);

        return $this->success(
            DoctorScheduleResource::collection($schedules),
            'Schedule updated successfully.'
        );
    }
}
