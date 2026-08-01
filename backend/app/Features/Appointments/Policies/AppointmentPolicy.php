<?php

namespace App\Features\Appointments\Policies;

use App\Models\Appointment;
use App\Models\User;

class AppointmentPolicy
{
    /**
     * The doctor or patient on the appointment, or an admin.
     * Governs view/cancel/reschedule.
     */
    public function view(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin()
            || ($user->isDoctor() && $user->doctor?->id === $appointment->doctor_id)
            || ($user->isPatient() && $user->patient?->id === $appointment->patient_id);
    }

    /**
     * Only the appointment's doctor, or an admin.
     * Governs confirm/complete.
     */
    public function actAsDoctor(User $user, Appointment $appointment): bool
    {
        return $user->isAdmin() || ($user->isDoctor() && $user->doctor?->id === $appointment->doctor_id);
    }
}
