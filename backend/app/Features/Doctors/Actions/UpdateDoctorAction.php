<?php

namespace App\Features\Doctors\Actions;

use App\Features\Doctors\Repositories\DoctorRepository;
use App\Models\Doctor;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class UpdateDoctorAction
{
    public function __construct(
        private readonly DoctorRepository $doctorRepository,
    ) {}

    public function execute(int $id, array $data): Doctor
    {
        $doctor = $this->doctorRepository->findOrFail($id);

        return $this->doctorRepository->update($doctor, $data);
    }
}
