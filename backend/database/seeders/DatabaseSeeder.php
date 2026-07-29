<?php

namespace Database\Seeders;

use App\Models\User;
use HasinHayder\Tyro\Models\Role;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Admin'],
        );

        Role::firstOrCreate(
            ['slug' => 'patient'],
            ['name' => 'Patient'],
        );

        Role::firstOrCreate(
            ['slug' => 'doctor'],
            ['name' => 'Doctor'],
        );

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@admin.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('123456'),
            ]
        );

        if (! $admin->hasRole('admin')) {
            $admin->assignRole($adminRole);
        }

        $this->call([
            DoctorSeeder::class,
        ]);
    }
}
