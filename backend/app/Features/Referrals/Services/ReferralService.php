<?php

namespace App\Features\Referrals\Services;

use App\Features\Notifications\Enums\NotificationTypeEnum;
use App\Features\Notifications\Services\NotificationService;
use App\Features\Referrals\Repositories\ReferralRepository;
use App\Features\Shared\Exceptions\ApiException;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Referral;

class ReferralService
{
    public function __construct(
        private readonly ReferralRepository $referralRepository,
        private readonly NotificationService $notificationService,
    ) {}

    public function referPatient(Patient $patient, Doctor $referringDoctor, int $receivingDoctorId, ?string $note): Referral
    {
        if ($receivingDoctorId === $referringDoctor->id) {
            throw new ApiException('You cannot refer a patient to yourself.', 422);
        }

        $receivingDoctor = Doctor::with('user')->findOrFail($receivingDoctorId);

        $referral = $this->referralRepository->create([
            'patient_id' => $patient->id,
            'referring_doctor_id' => $referringDoctor->id,
            'receiving_doctor_id' => $receivingDoctor->id,
            'note' => $note,
        ]);

        $this->notificationService->createNotification(
            $receivingDoctor->user_id,
            NotificationTypeEnum::PatientReferral->value,
            'New Patient Referral',
            "{$referringDoctor->user->name} referred {$patient->user->name} to you." . ($note ? " Note: {$note}" : ''),
            [
                'referral_id' => $referral->id,
                'patient_id' => $patient->public_id,
                'referring_doctor_id' => $referringDoctor->id,
            ],
        );

        // The patient also needs to know, since they're the one who has to
        // book the follow-up appointment with the receiving doctor.
        $this->notificationService->createNotification(
            $patient->user_id,
            NotificationTypeEnum::PatientReferral->value,
            'You Have Been Referred',
            "{$referringDoctor->user->name} referred you to {$receivingDoctor->user->name} for further evaluation."
                . ($note ? " Note: {$note}" : '')
                . ' Book an appointment — they will already have access to your medical records.',
            [
                'referral_id' => $referral->id,
                'doctor_id' => $receivingDoctor->public_id,
            ],
        );

        return $referral->load(['patient.user', 'referringDoctor.user', 'receivingDoctor.user']);
    }
}
