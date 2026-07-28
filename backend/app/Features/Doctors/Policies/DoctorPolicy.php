<?php

namespace App\Features\Doctors\Policies;

use App\Models\Doctor;
use App\Models\User;

class DoctorPolicy
{
    /**
     * Admin can view any doctor.
     */
    public function view(User $user, Doctor $doctor): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Admin can create doctors.
     */
    public function create(User $user): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Admin can update any doctor; a doctor can update only their own profile.
     */
    public function update(User $user, Doctor $doctor): bool
    {
        if ($user->hasRole('admin')) {
            return true;
        }

        return $user->hasRole('doctor') && $doctor->user_id === $user->id;
    }

    /**
     * Admin can delete doctors.
     */
    public function delete(User $user, Doctor $doctor): bool
    {
        return $user->hasRole('admin');
    }

    /**
     * Admin can suspend/activate doctors.
     */
    public function toggleStatus(User $user): bool
    {
        return $user->hasRole('admin');
    }
}
