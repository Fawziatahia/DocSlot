<?php

namespace App\Models;

use App\Features\Patients\Enums\PatientStatusEnum;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Patient extends Model
{
    protected $fillable = [
        'user_id',
        'date_of_birth',
        'gender',
        'address',
        'blood_group',
        'emergency_contact',
        'emergency_contact_name',
        'medical_history_notes',
        'status',
    ];

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
