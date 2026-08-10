<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * AuditLogController::index() paginates with ->latest() (orders by
 * created_at) and optionally filters with whereDate('created_at', ...), but
 * the table only carries the (entity_type, entity_id) index — every
 * unfiltered admin log listing forces a full filesort. Same gap the
 * add_list_sort_indexes migration closed for appointments/prescriptions/
 * medical_records; audit_logs was missed.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->index('created_at', 'audit_logs_created_at_index');
        });
    }

    public function down(): void
    {
        Schema::table('audit_logs', function (Blueprint $table) {
            $table->dropIndex('audit_logs_created_at_index');
        });
    }
};
