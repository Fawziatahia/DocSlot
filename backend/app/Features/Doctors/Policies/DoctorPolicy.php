<?php

namespace App\Features\Doctors\Policies;

use App\Models\Doctor;
use App\Models\User;

class DoctorPolicy
{
    /**
     * Admin can view any doctor's sensitive fields/hidden profile; a doctor can view their own.
     */
    public function view(User $user, Doctor $doctor): bool
    {
        return $user->isAdmin() || ($user->isDoctor() && $user->doctor?->id === $doctor->id);
    }

    /**
     * Admin can update any doctor; a doctor can update only their own profile.
     */
    public function update(User $user, Doctor $doctor): bool
    {
        return $user->isAdmin() || ($user->isDoctor() && $user->doctor?->id === $doctor->id);
    }

    /**
     * Same rule as update: admin, or the doctor managing their own schedule.
     */
    public function manageSchedule(User $user, Doctor $doctor): bool
    {
        return $this->update($user, $doctor);
    }

    /**
     * Admin can view any doctor's appointments; a doctor can view only their own.
     */
    public function viewAppointments(User $user, Doctor $doctor): bool
    {
        return $user->isAdmin() || ($user->isDoctor() && $user->doctor?->id === $doctor->id);
    }
}
