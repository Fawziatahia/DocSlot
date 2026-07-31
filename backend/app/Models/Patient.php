<?php

namespace App\Models;

use App\Features\Patients\Enums\PatientStatusEnum;
use App\Features\Shared\Helpers\PublicIdHelper;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Patient extends Model
{
    protected $fillable = [
        'user_id',
        'public_id',
        'date_of_birth',
        'gender',
        'address',
        'blood_group',
        'emergency_contact',
        'emergency_contact_name',
        'medical_history_notes',
        'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (Patient $patient) {
            if (! $patient->public_id) {
                $patient->public_id = PublicIdHelper::generate(self::class, 'p');
            }
        });
    }

    protected function casts(): array
    {
        return [
            'date_of_birth' => 'date',
            'status' => PatientStatusEnum::class,
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
