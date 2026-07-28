<?php

namespace App\Features\Patients\Actions;

use App\Features\Doctors\Repositories\DoctorRepository;

class SearchDoctorsAction
{
    public function __construct(
        private readonly DoctorRepository $doctorRepository,
    ) {}

    public function execute(array $filters, int $perPage = 15)
    {
        return $this->doctorRepository->search($filters, $perPage);
    }
}
