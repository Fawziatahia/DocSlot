<?php

namespace App\Features\Referrals\Repositories;

use App\Models\Referral;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ReferralRepository
{
    public function create(array $data): Referral
    {
        return Referral::create($data);
    }

    public function getReceivedByDoctor(int $doctorId, int $perPage = 15): LengthAwarePaginator
    {
        return Referral::where('receiving_doctor_id', $doctorId)
            ->with(['patient.user', 'referringDoctor.user'])
            ->latest()
            ->paginate($perPage);
    }

    public function getSentByDoctor(int $doctorId, int $perPage = 15): LengthAwarePaginator
    {
        return Referral::where('referring_doctor_id', $doctorId)
            ->with(['patient.user', 'receivingDoctor.user'])
            ->latest()
            ->paginate($perPage);
    }
}
