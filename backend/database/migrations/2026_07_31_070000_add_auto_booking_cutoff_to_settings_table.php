<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('booking_cutoff_mode', 10)->default('fixed')->after('max_booking_date');
            $table->unsignedInteger('auto_booking_advance_days')->nullable()->after('booking_cutoff_mode');
        });
    }

    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['booking_cutoff_mode', 'auto_booking_advance_days']);
        });
    }
};
