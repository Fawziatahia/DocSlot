<?php

namespace App\Features\Patients\Policies;

use App\Models\Patient;
use App\Models\User;

class PatientPolicy
{
    /**
     * Admin can view any patient.
     */
    public function view(User $user, Patient $patient): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('doctor')) {
            return true;
        }

        return $user->hasRole('patient') && $user->patient?->id === $patient->id;
    }

    /**
     * Admin can update any patient; doctor can update any patient;
     * a patient can update only their own record.
     */
    public function update(User $user, Patient $patient): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('doctor')) {
            return true;
        }

        return $user->hasRole('patient') && $user->patient?->id === $patient->id;
    }

    /**
     * Admin can delete patients.
     */
    public function delete(User $user, Patient $patient): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Admin can toggle patient status.
     */
    public function toggleStatus(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Can view medical history.
     */
    public function viewMedicalHistory(User $user, Patient $patient): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        if ($user->hasRole('doctor')) {
            // Doctor can view any patient's medical history
            return true;
        }

        return $user->hasRole('patient') && $user->patient?->id === $patient->id;
    }

    /**
     * Can view prescriptions.
     */
    public function viewPrescriptions(User $user, Patient $patient): bool
    {
        return $this->viewMedicalHistory($user, $patient);
    }
}
