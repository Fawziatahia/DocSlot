<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Referral extends Model
{
    protected $fillable = [
        'patient_id',
        'referring_doctor_id',
        'receiving_doctor_id',
        'note',
    ];

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function referringDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'referring_doctor_id');
    }

    public function receivingDoctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class, 'receiving_doctor_id');
    }
}
