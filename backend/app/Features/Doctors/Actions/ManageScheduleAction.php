<?php

namespace App\Features\Doctors\Actions;

use App\Features\Doctors\DTOs\ScheduleData;
use App\Features\Doctors\Services\DoctorService;
use Illuminate\Database\Eloquent\Collection;

class ManageScheduleAction
{
    public function __construct(
        private readonly DoctorService $doctorService,
    ) {}

    public function execute(ScheduleData $data): Collection
    {
        return $this->doctorService->manageSchedule($data);
    }
}
