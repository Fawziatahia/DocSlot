<?php

namespace App\Features\Prescriptions\Policies;

use App\Models\Prescription;
use App\Models\User;

class PrescriptionPolicy
{
    /**
     * Any doctor may view any prescription (consistent with the patient
     * medical-history/prescriptions list endpoints, which already allow this).
     */
    public function view(User $user, Prescription $prescription): bool
    {
        return $user->isAdmin()
            || $user->isDoctor()
            || ($user->isPatient() && $user->patient?->id === $prescription->patient_id);
    }

    /**
     * Admin can update any prescription; a doctor only the one they authored.
     */
    public function update(User $user, Prescription $prescription): bool
    {
        return $user->isAdmin() || ($user->isDoctor() && $user->doctor?->id === $prescription->doctor_id);
    }
}
