<?php

use App\Features\Shared\Helpers\PublicIdHelper;
use App\Models\Doctor;
use App\Models\Patient;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->string('public_id', 10)->nullable()->unique()->after('id');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->string('public_id', 10)->nullable()->unique()->after('id');
        });

        Doctor::whereNull('public_id')->each(function (Doctor $doctor) {
            $doctor->update(['public_id' => PublicIdHelper::generate(Doctor::class, 'd')]);
        });

        Patient::whereNull('public_id')->each(function (Patient $patient) {
            $patient->update(['public_id' => PublicIdHelper::generate(Patient::class, 'p')]);
        });
    }

    public function down(): void
    {
        Schema::table('doctors', function (Blueprint $table) {
            $table->dropColumn('public_id');
        });

        Schema::table('patients', function (Blueprint $table) {
            $table->dropColumn('public_id');
        });
    }
};
