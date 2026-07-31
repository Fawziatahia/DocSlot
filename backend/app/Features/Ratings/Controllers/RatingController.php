<?php

namespace App\Features\Ratings\Controllers;

use App\Features\Doctors\Repositories\DoctorRepository;
use App\Features\Ratings\Repositories\RatingRepository;
use App\Features\Ratings\Requests\StoreRatingRequest;
use App\Features\Ratings\Resources\RatingResource;
use App\Features\Ratings\Services\RatingService;
use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Appointment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RatingController
{
    use ApiResponseTrait;

    public function __construct(
        private readonly RatingRepository $ratingRepository,
        private readonly RatingService $ratingService,
        private readonly DoctorRepository $doctorRepository,
    ) {}

    /**
     * Rate a completed appointment (patient only).
     * POST /api/appointments/{id}/rate
     */
    public function store(StoreRatingRequest $request, int $id): JsonResponse
    {
        $patient = $request->user()->patient;

        if (!$patient) {
            return $this->error('Only patients can rate appointments.', 403);
        }

        $appointment = Appointment::findOrFail($id);
        $rating = $this->ratingService->submitRating($appointment, $patient->id, $request->validated());

        return $this->created(new RatingResource($rating), 'Rating submitted successfully.');
    }

    /**
     * List a doctor's ratings (public).
     * GET /api/doctors/{id}/ratings
     */
    public function doctorRatings(Request $request, string $id): JsonResponse
    {
        $doctor = $this->doctorRepository->findByPublicId($id);
        $perPage = (int) $request->input('per_page', 15);
        $ratings = $this->ratingRepository->getDoctorRatings($doctor->id, $perPage);

        return $this->paginated($ratings, RatingResource::class);
    }
}
