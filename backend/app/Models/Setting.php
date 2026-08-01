<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'appointment_cutoff_minutes',
        'max_reschedule_count',
        'default_slot_duration',
        'default_max_daily_appointments',
        'min_booking_lead_days',
        'max_booking_date',
        'booking_cutoff_mode',
        'auto_booking_advance_days',
    ];

    protected function casts(): array
    {
        return [
            'appointment_cutoff_minutes' => 'integer',
            'max_reschedule_count' => 'integer',
            'default_slot_duration' => 'integer',
            'default_max_daily_appointments' => 'integer',
            'min_booking_lead_days' => 'integer',
            'max_booking_date' => 'date:Y-m-d',
            'auto_booking_advance_days' => 'integer',
        ];
    }

    /**
     * The actual cutoff date bookings/reschedules are validated against.
     *
     * In "auto" mode this is a rolling window that always sits N days ahead
     * of today (so it never needs manual upkeep); in "fixed" mode it's
     * whatever calendar date the admin picked, or null for no cutoff.
     */
    public function effectiveMaxBookingDate(): ?string
    {
        if ($this->booking_cutoff_mode === 'auto' && $this->auto_booking_advance_days) {
            return now()->addDays($this->auto_booking_advance_days)->format('Y-m-d');
        }

        return $this->max_booking_date?->format('Y-m-d');
    }

    /**
     * Settings are a single global row; create it with column defaults
     * if it's somehow missing rather than failing.
     *
     * Uses save()+fresh() rather than firstOrCreate() so a newly inserted
     * row reloads its DB-applied column defaults instead of holding nulls
     * for every attribute that wasn't explicitly set.
     */
    public static function current(): self
    {
        $setting = static::query()->first();

        if (! $setting) {
            $setting = new static();
            $setting->save();
            $setting = $setting->fresh();
        }

        return $setting;
    }
}
