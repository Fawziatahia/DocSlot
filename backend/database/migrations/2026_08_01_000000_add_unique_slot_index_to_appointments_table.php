<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Backstop against the double-booking race: even if two requests both
     * pass the application-level overlap check at the same time, the DB
     * will reject the second insert. Note this also blocks re-booking the
     * exact same doctor/date/start_time after a cancellation, since the
     * index applies regardless of status — an acceptable tradeoff since a
     * partial/filtered unique index isn't portable across MySQL and SQLite.
     */
    public function up(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->unique(['doctor_id', 'appointment_date', 'start_time'], 'appointments_doctor_date_start_unique');
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropUnique('appointments_doctor_date_start_unique');
        });
    }
};
