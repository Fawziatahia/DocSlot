<?php

namespace App\Features\Landing\Controllers;

use App\Features\Shared\Traits\ApiResponseTrait;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Rating;
use App\Models\Setting;
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

    /** How many doctors to keep on the shortlist the finder panel draws from. */
    private const FEATURED_POOL_SIZE = 12;

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
     * Doctors for the landing page's finder panel.
     *
     * A shortlist of the best-reviewed doctors is cached, then shuffled per
     * request — so the panel shows a different face on each visit instead of
     * the same doctor forever, without querying on every page load.
     *
     * GET /api/landing/featured-doctors
     */
    public function featuredDoctors(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 3), self::FEATURED_POOL_SIZE);

        $pool = Cache::remember('landing.featured.pool', self::CACHE_TTL_SECONDS, function () {
            return $this->bookableDoctors()
                ->with(['user', 'specialization', 'department'])
                ->orderByDesc('total_reviews')
                ->orderByDesc('avg_rating')
                ->limit(self::FEATURED_POOL_SIZE)
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

        $doctors = collect($pool)->shuffle()->take($limit)->values()->all();

        return $this->success($doctors);
    }

    /**
     * Doctors ranked by the reviews patients actually left.
     *
     * Only doctors with at least one review appear — an unrated doctor has no
     * business in a "top rated" list — so the section is empty, and hidden,
     * until real ratings exist.
     *
     * GET /api/landing/top-rated-doctors
     */
    public function topRatedDoctors(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 4), 12);
        $leadDays = (int) Setting::current()->min_booking_lead_days;

        $doctors = Cache::remember("landing.top-rated.{$limit}.{$leadDays}", self::CACHE_TTL_SECONDS, function () use ($limit, $leadDays) {
            return $this->bookableDoctors()
                ->with(['user', 'specialization', 'department', 'schedules'])
                ->where('reviews_enabled', true)
                ->where('total_reviews', '>', 0)
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
                    'avg_rating' => round((float) $d->avg_rating, 1),
                    'total_reviews' => $d->total_reviews,
                    // A licence number on file is what "verified" means here.
                    'is_verified' => filled($d->license_number),
                    'next_available' => $this->nextAvailableLabel($d, $leadDays),
                ])
                ->all();
        });

        return $this->success($doctors);
    }

    /**
     * Real patient reviews, quoted verbatim.
     *
     * Nothing here is written for marketing: every quote is a `ratings` row
     * left after an appointment. Reviews belonging to a doctor who has turned
     * reviews off are excluded, matching how their profile behaves, and the
     * section disappears entirely when no one has written anything yet.
     *
     * Patient names are already public on the doctor ratings endpoint, so this
     * discloses nothing new.
     *
     * GET /api/landing/testimonials
     */
    public function testimonials(Request $request): JsonResponse
    {
        $limit = min((int) $request->input('limit', 3), 12);

        $testimonials = Cache::remember("landing.testimonials.{$limit}", self::CACHE_TTL_SECONDS, function () use ($limit) {
            return Rating::query()
                ->whereNotNull('comment')
                ->where('comment', '!=', '')
                ->whereHas('doctor', function ($d) {
                    $d->where('reviews_enabled', true)
                        ->where('status', 'active')
                        ->whereHas('user', fn ($u) => $u->where('is_active', true));
                })
                ->with(['patient.user', 'doctor.user', 'doctor.specialization'])
                ->orderByDesc('score')
                ->orderByDesc('created_at')
                ->limit($limit)
                ->get()
                ->map(fn (Rating $r) => [
                    'score' => $r->score,
                    'comment' => $r->comment,
                    'patient_name' => $r->patient?->user?->name ?: 'Anonymous',
                    'doctor_name' => $r->doctor->user->name,
                    'doctor_public_id' => $r->doctor->public_id,
                    'specialization' => $r->doctor->specialization?->name,
                    'created_at' => $r->created_at?->toIso8601String(),
                ])
                ->all();
        });

        return $this->success($testimonials);
    }

    /**
     * The next day this doctor has an available schedule, respecting the
     * booking lead time — so the badge never promises a day nobody could
     * actually book.
     */
    private function nextAvailableLabel(Doctor $doctor, int $leadDays): ?string
    {
        $openDays = $doctor->schedules
            ->where('is_available', true)
            ->pluck('day_of_week')
            ->all();

        if (! $openDays) {
            return null;
        }

        for ($offset = $leadDays; $offset < $leadDays + 7; $offset++) {
            $date = now()->addDays($offset);

            if (! in_array($date->dayOfWeek, $openDays, true)) {
                continue;
            }

            return match ($offset) {
                0 => 'Today',
                1 => 'Tomorrow',
                default => $date->format('l'),
            };
        }

        return null;
    }
}
