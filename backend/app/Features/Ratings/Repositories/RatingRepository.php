<?php

namespace App\Features\Ratings\Repositories;

use App\Models\Rating;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class RatingRepository
{
    public function existsForAppointment(int $appointmentId): bool
    {
        return Rating::where('appointment_id', $appointmentId)->exists();
    }

    public function create(array $data): Rating
    {
        return Rating::create($data);
    }

    public function getDoctorRatings(int $doctorId, int $perPage = 15): LengthAwarePaginator
    {
        return Rating::where('doctor_id', $doctorId)
            ->with('patient.user')
            ->latest()
            ->paginate($perPage);
    }
}
