<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Indexes for the recurring filter/sort columns that were previously
 * unindexed. Foreign-key columns already carry their own indexes; these
 * cover the WHERE/ORDER BY patterns the app actually issues:
 *
 *  - appointments.status              — dashboard/report status counts, list filters
 *  - appointments.appointment_date    — report date-range scans, "today"/upcoming lookups
 *  - appointments (patient_id, date)  — a patient's list, filtered + ordered by date
 *  - doctors.status                   — public directory (status = active) + admin counts
 *  - notifications (user_id, is_read) — per-user unread count and inbox filtering
 *
 * doctor_id + appointment_date is already covered by the existing unique
 * index (doctor_id, appointment_date, start_time), so it is not repeated here.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->index('status', 'appointments_status_index');
            $table->index('appointment_date', 'appointments_appointment_date_index');
            $table->index(['patient_id', 'appointment_date'], 'appointments_patient_date_index');
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->index('status', 'doctors_status_index');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->index(['user_id', 'is_read'], 'notifications_user_read_index');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appointments_status_index');
            $table->dropIndex('appointments_appointment_date_index');
            $table->dropIndex('appointments_patient_date_index');
        });

        Schema::table('doctors', function (Blueprint $table) {
            $table->dropIndex('doctors_status_index');
        });

        Schema::table('notifications', function (Blueprint $table) {
            $table->dropIndex('notifications_user_read_index');
        });
    }
};
