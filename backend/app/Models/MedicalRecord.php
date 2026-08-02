<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MedicalRecord extends Model
{
    protected $fillable = [
        'patient_id',
        'doctor_id',
        'appointment_id',
        'record_type',
        'title',
        'description',
        'file_path',
        'file_name',
        'file_mime',
        'file_size',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'file_size' => 'integer',
        ];
    }

    /**
     * True when the attachment is a file we hold on the private disk, as
     * opposed to a legacy external URL sitting in `file_path`.
     */
    public function hasStoredFile(): bool
    {
        return $this->file_path && $this->file_name;
    }

    public function patient(): BelongsTo
    {
        return $this->belongsTo(Patient::class);
    }

    public function doctor(): BelongsTo
    {
        return $this->belongsTo(Doctor::class);
    }

    public function appointment(): BelongsTo
    {
        return $this->belongsTo(Appointment::class);
    }
}
