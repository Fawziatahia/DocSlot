<?php

namespace App\Features\Doctors\Actions;

use App\Features\Doctors\Repositories\DoctorRepository;
use App\Models\Doctor;

class AssignDepartmentAction
{
    public function __construct(
        private readonly DoctorRepository $doctorRepository,
    ) {}

    public function execute(int $doctorId, int $departmentId, ?int $specializationId = null): Doctor
    {
        $doctor = $this->doctorRepository->findOrFail($doctorId);

        $data = ['department_id' => $departmentId];

        if ($specializationId !== null) {
            $data['specialization_id'] = $specializationId;
        }

        return $this->doctorRepository->update($doctor, $data);
    }
}
