<?php

namespace App\Features\Ratings\Services;

use App\Features\Appointments\Enums\AppointmentStatusEnum;
use App\Features\Ratings\Repositories\RatingRepository;
use App\Features\Shared\Exceptions\ApiException;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Rating;

class RatingService
{
    public function __construct(
        private readonly RatingRepository $ratingRepository,
    ) {}

    public function submitRating(Appointment $appointment, int $patientId, array $data): Rating
    {
        if ($appointment->patient_id !== $patientId) {
            throw new ApiException('This appointment does not belong to you.', 403);
        }

        if ($appointment->status !== AppointmentStatusEnum::Completed) {
            throw new ApiException('You can only rate a completed appointment.', 409);
        }

        if ($this->ratingRepository->existsForAppointment($appointment->id)) {
            throw new ApiException('You have already rated this appointment.', 409);
        }

        $rating = $this->ratingRepository->create([
            'doctor_id' => $appointment->doctor_id,
            'patient_id' => $patientId,
            'appointment_id' => $appointment->id,
            'score' => $data['score'],
            'comment' => $data['comment'] ?? null,
        ]);

        $this->recalculateDoctorRating($appointment->doctor_id);

        return $rating->load('patient.user');
    }

    private function recalculateDoctorRating(int $doctorId): void
    {
        $doctor = Doctor::findOrFail($doctorId);

        $doctor->update([
            'avg_rating' => (float) $doctor->ratings()->avg('score') ?: 0,
            'total_reviews' => $doctor->ratings()->count(),
        ]);
    }
}
