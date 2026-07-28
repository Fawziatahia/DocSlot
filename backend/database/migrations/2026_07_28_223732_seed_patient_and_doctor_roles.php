<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $roles = [
            ['name' => 'Patient', 'slug' => 'patient'],
            ['name' => 'Doctor', 'slug' => 'doctor'],
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['slug' => $role['slug']],
                $role,
            );
        }
    }

    public function down(): void
    {
        DB::table('roles')->whereIn('slug', ['patient', 'doctor'])->delete();
    }
};
