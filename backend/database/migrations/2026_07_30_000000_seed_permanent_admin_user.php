<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

return new class extends Migration
{
    public function up(): void
    {
        $adminRoleId = DB::table('roles')->where('slug', 'admin')->value('id');

        if (! $adminRoleId) {
            $adminRoleId = DB::table('roles')->insertGetId([
                'name' => 'Admin',
                'slug' => 'admin',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        $adminUserId = DB::table('users')->where('email', 'admin@docslot.app')->value('id');

        if (! $adminUserId) {
            $adminUserId = DB::table('users')->insertGetId([
                'name' => 'Admin',
                'email' => 'admin@docslot.app',
                'email_verified_at' => now(),
                'password' => Hash::make('123456'),
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }

        DB::table('user_roles')->updateOrInsert(
            ['user_id' => $adminUserId, 'role_id' => $adminRoleId],
            ['created_at' => now(), 'updated_at' => now()],
        );
    }

    public function down(): void
    {
        $adminUserId = DB::table('users')->where('email', 'admin@docslot.app')->value('id');

        if ($adminUserId) {
            DB::table('user_roles')->where('user_id', $adminUserId)->delete();
            DB::table('users')->where('id', $adminUserId)->delete();
        }
    }
};
