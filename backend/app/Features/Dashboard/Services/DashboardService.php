<?php

namespace App\Features\Dashboard\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Prescription;

class DashboardService
{
    /**
     * Get admin dashboard stats.
     *
     * @return array<string, mixed>
     */
    public function adminStats(): array
    {
        return [
            'total_doctors' => Doctor::count(),
            'active_doctors' => Doctor::where('status', 'active')->count(),
            'total_patients' => Patient::count(),
            'total_appointments' => Appointment::count(),
            'today_appointments' => Appointment::whereDate('appointment_date', today())->count(),
            'pending_appointments' => Appointment::where('status', 'pending')->count(),
            'completed_appointments' => Appointment::where('status', 'completed')->count(),
            'total_prescriptions' => Prescription::count(),
            'total_revenue' => Appointment::where('status', 'completed')
                ->with('doctor')
                ->get()
                ->sum(fn ($a) => (float) ($a->doctor?->consultation_fee ?? 0)),
        ];
    }

    public function doctorStats(int $doctorId): array
    {
        return [
            'total_appointments' => Appointment::where('doctor_id', $doctorId)->count(),
            'today_appointments' => Appointment::where('doctor_id', $doctorId)
                ->whereDate('appointment_date', today())
                ->count(),
            'pending_appointments' => Appointment::where('doctor_id', $doctorId)
                ->where('status', 'pending')
                ->count(),
            'completed_appointments' => Appointment::where('doctor_id', $doctorId)
                ->where('status', 'completed')
                ->count(),
            'total_prescriptions' => Prescription::where('doctor_id', $doctorId)->count(),
        ];
    }

    public function patientStats(int $patientId): array
    {
        return [
            'total_appointments' => Appointment::where('patient_id', $patientId)->count(),
            'upcoming_appointments' => Appointment::where('patient_id', $patientId)
                ->whereIn('status', ['pending', 'confirmed'])
                ->where('appointment_date', '>=', today())
                ->count(),
            'completed_appointments' => Appointment::where('patient_id', $patientId)
                ->where('status', 'completed')
                ->count(),
            'total_prescriptions' => Prescription::where('patient_id', $patientId)->count(),
        ];
    }
}
