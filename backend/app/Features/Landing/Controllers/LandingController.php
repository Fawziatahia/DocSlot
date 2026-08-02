<?php

namespace App\Features\Landing\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Rating;
use App\Models\Specialization;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

/**
 * Public, unauthenticated data for the marketing landing page.
 *
 * Everything here is counted from real rows — the page shows what the
 * platform actually holds rather than aspirational placeholder figures.
 */
class LandingController
{
    use ApiResponseTrait;

    private const CACHE_TTL_SECONDS = 300;

    /**
     * Only doctors a visitor could actually book: an active profile on an
     * active account. Matches what the doctor directory lists.
     *
     * @return \Illuminate\Database\Eloquent\Builder<Doctor>
     */
    private function bookableDoctors()
    {
        return Doctor::query()
            ->where('status', 'active')
            ->whereHas('user', fn ($q) => $q->where('is_active', true));
    }

    /**
     * GET /api/landing/stats
     */
    public function stats(): JsonResponse
    {
        $stats = Cache::remember('landing.stats', self::CACHE_TTL_SECONDS, function () {
            $reviewCount = Rating::count();

            return [
                'doctors' => $this->bookableDoctors()->count(),
                'patients' => Patient::count(),
                'specialties' => Specialization::where('is_active', true)
                    ->whereHas('doctors', fn ($q) => $q->where('status', 'active'))
                    ->count(),
                'appointments' => Appointment::count(),
                'reviews' => $reviewCount,
                // Null rather than a flattering zero when nobody has rated yet;
                // the page hides the stat instead of showing "0.0".
                'average_rating' => $reviewCount > 0 ? round((float) Rating::avg('score'), 1) : null,
            ];
        });

        return $this->success($stats);
    }

    /**
     * Specialties that actually have bookable doctors behind them.
     * GET /api/landing/specialties
     */
    public function specialties(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 8), 24);

        $specialties = Cache::remember("landing.specialties.{$limit}", self::CACHE_TTL_SECONDS, function () use ($limit) {
            return Specialization::query()
                ->where('is_active', true)
                ->withCount(['doctors' => fn ($q) => $q->where('status', 'active')
                    ->whereHas('user', fn ($u) => $u->where('is_active', true))])
                ->having('doctors_count', '>', 0)
                ->orderByDesc('doctors_count')
                ->orderBy('name')
                ->limit($limit)
                ->get()
                ->map(fn (Specialization $s) => [
                    'id' => $s->id,
                    'name' => $s->name,
                    'description' => $s->description,
                    'doctors_count' => $s->doctors_count,
                ])
                // Cache a plain array: a serialised Collection comes back from
                // the file store as an incomplete class and breaks the response.
                ->all();
        });

        return $this->success($specialties);
    }

    /**
     * A few well-reviewed doctors to show the search panel isn't empty.
     * GET /api/landing/featured-doctors
     */
    public function featuredDoctors(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 3), 10);

        $doctors = Cache::remember("landing.featured.{$limit}", self::CACHE_TTL_SECONDS, function () use ($limit) {
            return $this->bookableDoctors()
                ->with(['user', 'specialization', 'department'])
                ->orderByDesc('avg_rating')
                ->orderByDesc('total_reviews')
                ->limit($limit)
                ->get()
                ->map(fn (Doctor $d) => [
                    'public_id' => $d->public_id,
                    'name' => $d->user->name,
                    'specialization' => $d->specialization?->name,
                    'department' => $d->department?->name,
                    'consultation_fee' => (float) $d->consultation_fee,
                    'avg_rating' => (float) $d->avg_rating,
                    'total_reviews' => $d->total_reviews,
                    'reviews_enabled' => (bool) $d->reviews_enabled,
                ])
                ->all();
        });

        return $this->success($doctors);
    }
}
