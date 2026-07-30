<?php

namespace App\Models;

use App\Features\Doctors\Enums\DoctorStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Doctor extends Model
{
    protected $fillable = [
        'user_id',
        'specialization_id',
        'department_id',
        'license_number',
        'qualifications',
        'bio',
        'consultation_fee',
        'avg_rating',
        'total_reviews',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'consultation_fee' => 'decimal:2',
            'avg_rating' => 'decimal:2',
            'total_reviews' => 'integer',
            'status' => DoctorStatusEnum::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function specialization(): BelongsTo
    {
        return $this->belongsTo(Specialization::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(DoctorSchedule::class);
    }

    public function ratings(): HasMany
    {
        return $this->hasMany(Rating::class);
    }

    /**
     * Whether this doctor should be visible/bookable by the public.
     * False if the doctor profile is suspended or the underlying user account was deactivated.
     */
    public function isPubliclyVisible(): bool
    {
        return $this->status === DoctorStatusEnum::Active && (bool) $this->user->is_active;
    }
}
