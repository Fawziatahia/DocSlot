<?php

namespace App\Features\MedicalRecords\Policies;

use App\Models\MedicalRecord;
use App\Models\User;

class MedicalRecordPolicy
{
    /**
     * Any doctor may view any medical record (consistent with the patient
     * medical-history/prescriptions list endpoints, which already allow this).
     */
    public function view(User $user, MedicalRecord $record): bool
    {
        return $user->isAdmin()
            || $user->isDoctor()
            || ($user->isPatient() && $user->patient?->id === $record->patient_id);
    }

    /**
     * Admin can update any record; a doctor only the one they authored.
     */
    public function update(User $user, MedicalRecord $record): bool
    {
        return $user->isAdmin() || ($user->isDoctor() && $user->doctor?->id === $record->doctor_id);
    }
}
