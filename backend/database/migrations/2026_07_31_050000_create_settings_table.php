<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('appointment_cutoff_minutes')->default(120);
            $table->unsignedInteger('max_reschedule_count')->default(2);
            $table->unsignedInteger('reminder_hours_before')->default(24);
            $table->unsignedInteger('default_slot_duration')->default(30);
            $table->unsignedInteger('default_max_daily_appointments')->default(10);
            $table->unsignedInteger('min_booking_lead_days')->default(1);
            $table->timestamps();
        });

        DB::table('settings')->insert([
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
