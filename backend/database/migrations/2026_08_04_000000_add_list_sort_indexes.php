<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Follow-up to add_performance_indexes: the admin list endpoints paginate an
 * entire table ordered by `created_at DESC` (->latest()) with no narrowing
 * WHERE, which forces a full filesort per page. Index the sort column so the
 * database can read rows in order instead. Also indexes prescriptions.status,
 * the one remaining unindexed list filter.
 *
 *  - appointments.created_at     — AppointmentRepository::paginate() ->latest()
 *  - prescriptions.created_at    — PrescriptionRepository::paginate() ->latest()
 *  - prescriptions.status        — PrescriptionRepository::applyFilters() where(status)
 *  - medical_records.created_at  — MedicalRecordRepository::paginate() ->latest()
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->index('created_at', 'appointments_created_at_index');
        });

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->index('created_at', 'prescriptions_created_at_index');
            $table->index('status', 'prescriptions_status_index');
        });

        Schema::table('medical_records', function (Blueprint $table) {
            $table->index('created_at', 'medical_records_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropIndex('appointments_created_at_index');
        });

        Schema::table('prescriptions', function (Blueprint $table) {
            $table->dropIndex('prescriptions_created_at_index');
            $table->dropIndex('prescriptions_status_index');
        });

        Schema::table('medical_records', function (Blueprint $table) {
            $table->dropIndex('medical_records_created_at_index');
        });
    }
};
