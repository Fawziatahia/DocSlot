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
        $today = today()->toDateString();

        // Fold the doctor and appointment breakdowns into one grouped query each
        // (conditional aggregation) instead of a separate COUNT per metric.
        $doctors = Doctor::selectRaw("COUNT(*) as total, SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active")->first();

        $appointments = Appointment::selectRaw(
            "COUNT(*) as total,
             SUM(CASE WHEN appointment_date = ? THEN 1 ELSE 0 END) as today,
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed",
            [$today]
        )->first();

        return [
            'total_doctors' => (int) $doctors->total,
            'active_doctors' => (int) $doctors->active,
            'total_patients' => Patient::count(),
            'total_appointments' => (int) $appointments->total,
            'today_appointments' => (int) $appointments->today,
            'pending_appointments' => (int) $appointments->pending,
            'completed_appointments' => (int) $appointments->completed,
            'total_prescriptions' => Prescription::count(),
            'total_revenue' => (float) Appointment::where('appointments.status', 'completed')
                ->join('doctors', 'doctors.id', '=', 'appointments.doctor_id')
                ->sum('doctors.consultation_fee'),
        ];
    }

    public function doctorStats(int $doctorId): array
    {
        $today = today()->toDateString();

        $appointments = Appointment::where('doctor_id', $doctorId)->selectRaw(
            "COUNT(*) as total,
             SUM(CASE WHEN appointment_date = ? THEN 1 ELSE 0 END) as today,
             SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed",
            [$today]
        )->first();

        return [
            'total_appointments' => (int) $appointments->total,
            'today_appointments' => (int) $appointments->today,
            'pending_appointments' => (int) $appointments->pending,
            'completed_appointments' => (int) $appointments->completed,
            'total_prescriptions' => Prescription::where('doctor_id', $doctorId)->count(),
        ];
    }

    public function patientStats(int $patientId): array
    {
        $today = today()->toDateString();

        $appointments = Appointment::where('patient_id', $patientId)->selectRaw(
            "COUNT(*) as total,
             SUM(CASE WHEN status IN ('pending', 'confirmed') AND appointment_date >= ? THEN 1 ELSE 0 END) as upcoming,
             SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed",
            [$today]
        )->first();

        return [
            'total_appointments' => (int) $appointments->total,
            'upcoming_appointments' => (int) $appointments->upcoming,
            'completed_appointments' => (int) $appointments->completed,
            'total_prescriptions' => Prescription::where('patient_id', $patientId)->count(),
        ];
    }
}
