<?php

namespace App\Features\Doctors\Actions;

use App\Features\Doctors\DTOs\DoctorData;
use App\Features\Doctors\Services\DoctorService;
use App\Models\Doctor;

class CreateDoctorAction
{
    public function __construct(
        private readonly DoctorService $doctorService,
    ) {}

    public function execute(DoctorData $data): Doctor
    {
        return $this->doctorService->createDoctor([
            'name' => $data->name,
            'email' => $data->email,
            'phone' => $data->phone,
            'specialization_id' => $data->specializationId,
            'department_id' => $data->departmentId,
            'license_number' => $data->licenseNumber,
            'qualifications' => $data->qualifications,
            'bio' => $data->bio,
            'consultation_fee' => $data->consultationFee,
        ]);
    }
}
