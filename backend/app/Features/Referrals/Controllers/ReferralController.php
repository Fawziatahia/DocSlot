<?php

namespace App\Features\Referrals\Controllers;

use App\Features\Referrals\Repositories\ReferralRepository;
use App\Features\Referrals\Requests\ReferPatientRequest;
use App\Features\Referrals\Resources\ReferralResource;
use App\Features\Referrals\Services\ReferralService;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Patient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReferralController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly ReferralRepository $referralRepository,
        private readonly ReferralService $referralService,
    ) {}

    /**
     * Refer a patient to another doctor.
     * POST /api/patients/{id}/refer
     */
    public function store(ReferPatientRequest $request, string $id): JsonResponse
    {
        $referringDoctor = $request->user()->doctor;

        if (! $referringDoctor) {
            return $this->error('Only doctors can refer patients.', 403);
        }

        $patient = Patient::with('user')->where('public_id', $id)->firstOrFail();
        $receivingDoctor = \App\Models\Doctor::where('public_id', $request->validated('doctor_id'))->firstOrFail();

        $referral = $this->referralService->referPatient(
            $patient,
            $referringDoctor,
            $receivingDoctor->id,
            $request->validated('note'),
        );

        return $this->created(new ReferralResource($referral), 'Patient referred successfully.');
    }

    /**
     * List referrals sent or received by the authenticated doctor.
     * GET /api/referrals/my?type=received|sent
     */
    public function myReferrals(Request $request): JsonResponse
    {
        $doctor = $request->user()->doctor;

        if (! $doctor) {
            return $this->error('Only doctors have referrals.', 403);
        }

        $perPage = (int) $request->input('per_page', 15);
        $type = $request->input('type', 'received');

        $referrals = $type === 'sent'
            ? $this->referralRepository->getSentByDoctor($doctor->id, $perPage)
            : $this->referralRepository->getReceivedByDoctor($doctor->id, $perPage);

        return $this->paginated($referrals, ReferralResource::class);
    }
}
