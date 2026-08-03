<?php

namespace App\Features\Reports\Services;

use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\Patient;
use App\Models\Prescription;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ReportService
{
    public function appointmentReport(?string $from, ?string $to): array
    {
        $query = Appointment::query();
        if ($from) $query->where('appointment_date', '>=', $from);
        if ($to) $query->where('appointment_date', '<=', $to);

        $total = (clone $query)->count();
        $byStatus = (clone $query)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        return [
            'total_appointments' => $total,
            'by_status' => $byStatus,
            'period' => ['from' => $from, 'to' => $to],
        ];
    }

    public function revenueReport(?string $from, ?string $to): array
    {
        $query = Appointment::where('appointments.status', 'completed')
            ->join('doctors', 'doctors.id', '=', 'appointments.doctor_id');
        if ($from) $query->where('appointments.appointment_date', '>=', $from);
        if ($to) $query->where('appointments.appointment_date', '<=', $to);

        $result = $query
            ->selectRaw('COALESCE(SUM(doctors.consultation_fee), 0) as revenue, COUNT(*) as cnt')
            ->first();

        return [
            'total_revenue' => (float) ($result->revenue ?? 0),
            'total_completed_appointments' => (int) ($result->cnt ?? 0),
            'period' => ['from' => $from, 'to' => $to],
        ];
    }

    public function doctorReport(?string $from, ?string $to): array
    {
        $query = Appointment::query();
        if ($from) $query->where('appointment_date', '>=', $from);
        if ($to) $query->where('appointment_date', '<=', $to);

        $doctorStats = (clone $query)
            ->select('doctor_id', DB::raw('count(*) as total, sum(case when status = "completed" then 1 else 0 end) as completed'))
            ->groupBy('doctor_id')
            ->with('doctor.user')
            ->get()
            ->map(fn ($row) => [
                'doctor_id' => $row->doctor_id,
                'doctor_name' => $row->doctor?->user?->name,
                'total_appointments' => $row->total,
                'completed_appointments' => $row->completed,
            ]);

        return [
            'doctors' => $doctorStats,
            'period' => ['from' => $from, 'to' => $to],
        ];
    }

    public function patientReport(?string $from, ?string $to): array
    {
        $query = Appointment::query();
        if ($from) $query->where('appointment_date', '>=', $from);
        if ($to) $query->where('appointment_date', '<=', $to);

        $patientStats = (clone $query)
            ->select('patient_id', DB::raw('count(*) as total_appointments'))
            ->groupBy('patient_id')
            ->orderByDesc('total_appointments')
            ->limit(20)
            ->with('patient.user')
            ->get()
            ->map(fn ($row) => [
                'patient_id' => $row->patient_id,
                'patient_name' => $row->patient?->user?->name,
                'total_appointments' => $row->total_appointments,
            ]);

        return [
            'top_patients' => $patientStats,
            'period' => ['from' => $from, 'to' => $to],
        ];
    }

    public function prescriptionReport(?string $from, ?string $to): array
    {
        $query = Prescription::query();
        if ($from) $query->where('created_at', '>=', $from);
        if ($to) $query->where('created_at', '<=', $to);

        return [
            'total_prescriptions' => (clone $query)->count(),
            'period' => ['from' => $from, 'to' => $to],
        ];
    }
}
