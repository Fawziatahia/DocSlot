<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Status ranking used when collapsing duplicate slots: the most
     * meaningful record wins (a completed/confirmed booking outranks a
     * cancelled leftover). Anything not listed sorts last.
     */
    private const STATUS_PRIORITY = [
        'completed' => 5,
        'confirmed' => 4,
        'in_progress' => 3,
        'pending' => 2,
        'no_show' => 1,
        'cancelled' => 0,
    ];

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
        $this->collapseDuplicateSlots();

        Schema::table('appointments', function (Blueprint $table) {
            $table->unique(['doctor_id', 'appointment_date', 'start_time'], 'appointments_doctor_date_start_unique');
        });
    }

    /**
     * The status-agnostic unique index below cannot coexist with pre-existing
     * duplicate slots (e.g. a slot that was booked, cancelled, then re-booked).
     * Keep the highest-priority row per slot — newest wins on a tie — and
     * delete the rest so the constraint can be created cleanly on every
     * environment. Wrapped in a transaction so a partial cleanup never lands.
     */
    private function collapseDuplicateSlots(): void
    {
        $groups = DB::table('appointments')
            ->select('doctor_id', 'appointment_date', 'start_time')
            ->groupBy('doctor_id', 'appointment_date', 'start_time')
            ->havingRaw('COUNT(*) > 1')
            ->get();

        if ($groups->isEmpty()) {
            return;
        }

        DB::transaction(function () use ($groups) {
            foreach ($groups as $group) {
                $rows = DB::table('appointments')
                    ->where('doctor_id', $group->doctor_id)
                    ->where('appointment_date', $group->appointment_date)
                    ->where('start_time', $group->start_time)
                    ->get();

                $keep = $rows->sort(function ($a, $b) {
                    $pa = self::STATUS_PRIORITY[$a->status] ?? -1;
                    $pb = self::STATUS_PRIORITY[$b->status] ?? -1;

                    return $pa === $pb ? $b->id <=> $a->id : $pb <=> $pa;
                })->first();

                DB::table('appointments')
                    ->where('doctor_id', $group->doctor_id)
                    ->where('appointment_date', $group->appointment_date)
                    ->where('start_time', $group->start_time)
                    ->where('id', '!=', $keep->id)
                    ->delete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('appointments', function (Blueprint $table) {
            $table->dropUnique('appointments_doctor_date_start_unique');
        });
    }
};
