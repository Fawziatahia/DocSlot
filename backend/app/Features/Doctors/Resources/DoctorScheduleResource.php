<?php

namespace App\Features\Doctors\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DoctorScheduleResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        return [
            'id' => $this->id,
            'day_of_week' => $this->day_of_week,
            'day_name' => $days[$this->day_of_week] ?? 'Unknown',
            'start_time' => $this->start_time,
            'end_time' => $this->end_time,
            'slot_duration' => $this->slot_duration,
            'max_daily_appointments' => $this->max_daily_appointments,
            'is_available' => $this->is_available,
        ];
    }
}
