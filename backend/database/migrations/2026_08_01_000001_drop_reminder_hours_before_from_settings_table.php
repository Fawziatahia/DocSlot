<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * reminder_hours_before was saved by the admin UI but never read by
     * anything — no reminder job exists yet. Dropped rather than enforced;
     * building the reminder queue job is future work.
     */
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn('reminder_hours_before');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->unsignedInteger('reminder_hours_before')->default(24);
        });
    }
};
