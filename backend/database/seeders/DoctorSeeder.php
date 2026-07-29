<?php

namespace Database\Seeders;

use App\Models\Doctor;
use App\Models\DoctorSchedule;
use App\Models\Department;
use App\Models\Specialization;
use App\Models\User;
use HasinHayder\Tyro\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    public function run(): void
    {
        // Departments
        $departments = [
            ['name' => 'Cardiology', 'description' => 'Heart and cardiovascular system'],
            ['name' => 'Medicine', 'description' => 'General internal medicine'],
            ['name' => 'Gynecology & Obstetrics', 'description' => 'Women\'s health and childbirth'],
            ['name' => 'Pediatrics', 'description' => 'Child health and diseases'],
            ['name' => 'Orthopedics', 'description' => 'Bone, joint, and muscle care'],
            ['name' => 'Neurology', 'description' => 'Brain and nervous system'],
            ['name' => 'Dermatology', 'description' => 'Skin, hair, and nail care'],
            ['name' => 'Ophthalmology', 'description' => 'Eye care and vision'],
            ['name' => 'ENT', 'description' => 'Ear, nose, and throat'],
            ['name' => 'Gastroenterology', 'description' => 'Digestive system'],
        ];

        // Specializations
        $specializations = [
            ['name' => 'Cardiologist', 'description' => 'Heart disease specialist'],
            ['name' => 'Medicine Specialist', 'description' => 'Internal medicine expert'],
            ['name' => 'Gynecologist', 'description' => 'Women\'s reproductive health'],
            ['name' => 'Pediatrician', 'description' => 'Child healthcare'],
            ['name' => 'Orthopedic Surgeon', 'description' => 'Bone and joint surgery'],
            ['name' => 'Neurologist', 'description' => 'Nervous system disorders'],
            ['name' => 'Dermatologist', 'description' => 'Skin conditions'],
            ['name' => 'Ophthalmologist', 'description' => 'Eye surgery and treatment'],
            ['name' => 'ENT Specialist', 'description' => 'Ear, nose, throat care'],
            ['name' => 'Gastroenterologist', 'description' => 'Digestive health'],
        ];

        foreach ($departments as $dept) {
            Department::firstOrCreate(['name' => $dept['name']], $dept);
        }

        foreach ($specializations as $spec) {
            Specialization::firstOrCreate(['name' => $spec['name']], $spec);
        }

        $departmentIds = Department::pluck('id', 'name');
        $specializationIds = Specialization::pluck('id', 'name');

        $doctorRole = Role::where('slug', 'doctor')->firstOrFail();

        // 50 Bangladeshi doctors with realistic data
        $doctorsData = [
            ['Dr. Abdullah Al Mamun', 'Medicine Specialist', 'Medicine', 'MBBS, FCPS (Medicine)', 800],
            ['Dr. Farzana Begum', 'Gynecologist', 'Gynecology & Obstetrics', 'MBBS, FCPS (OBGYN)', 1000],
            ['Dr. Md. Shahidul Islam', 'Cardiologist', 'Cardiology', 'MBBS, MD (Cardiology)', 1200],
            ['Dr. Nusrat Jahan', 'Pediatrician', 'Pediatrics', 'MBBS, DCH (Child Health)', 700],
            ['Dr. Hasanuzzaman Khan', 'Orthopedic Surgeon', 'Orthopedics', 'MBBS, MS (Ortho)', 1000],
            ['Dr. Tahmina Akter', 'Dermatologist', 'Dermatology', 'MBBS, DDV', 800],
            ['Dr. A. K. M. Fazlul Haque', 'Neurologist', 'Neurology', 'MBBS, MD (Neurology)', 1200],
            ['Dr. Shamima Sultana', 'Ophthalmologist', 'Ophthalmology', 'MBBS, DO, FCPS (Eye)', 900],
            ['Dr. Mizanur Rahman', 'Cardiologist', 'Cardiology', 'MBBS, FCPS (Cardiology)', 1100],
            ['Dr. Rokeya Begum', 'Gynecologist', 'Gynecology & Obstetrics', 'MBBS, MS (OBGYN)', 900],
            ['Dr. Emdadul Haque', 'Medicine Specialist', 'Medicine', 'MBBS, MD (Internal Medicine)', 800],
            ['Dr. Sharmin Akter', 'Pediatrician', 'Pediatrics', 'MBBS, FCPS (Pediatrics)', 700],
            ['Dr. Golam Mostafa', 'Orthopedic Surgeon', 'Orthopedics', 'MBBS, D-Ortho, MS', 1000],
            ['Dr. Mahmuda Khanom', 'Dermatologist', 'Dermatology', 'MBBS, MCPS (Dermatology)', 750],
            ['Dr. Tariqul Islam', 'ENT Specialist', 'ENT', 'MBBS, DLO, FCPS (ENT)', 800],
            ['Dr. Parveen Sultana', 'Gynecologist', 'Gynecology & Obstetrics', 'MBBS, FCPS (OBGYN)', 950],
            ['Dr. Md. Rafiqul Islam', 'Cardiologist', 'Cardiology', 'MBBS, MD (Cardiology)', 1300],
            ['Dr. Salma Khatun', 'Ophthalmologist', 'Ophthalmology', 'MBBS, MS (Ophthalmology)', 850],
            ['Dr. Zahirul Islam', 'Neurologist', 'Neurology', 'MBBS, FCPS (Neurology)', 1150],
            ['Dr. Ayesha Siddika', 'Pediatrician', 'Pediatrics', 'MBBS, MD (Pediatrics)', 750],
            ['Dr. Nurul Haque', 'Gastroenterologist', 'Gastroenterology', 'MBBS, FCPS (Gastro)', 900],
            ['Dr. Shahana Akhter', 'Medicine Specialist', 'Medicine', 'MBBS, MD (Internal Medicine)', 800],
            ['Dr. Kamrul Hasan', 'Cardiologist', 'Cardiology', 'MBBS, FCPS, FACC', 1500],
            ['Dr. Jahanara Begum', 'Dermatologist', 'Dermatology', 'MBBS, DDV, MCPS', 750],
            ['Dr. Moniruzzaman', 'Orthopedic Surgeon', 'Orthopedics', 'MBBS, MS (Ortho Surgery)', 1100],
            ['Dr. Halima Khatun', 'Gynecologist', 'Gynecology & Obstetrics', 'MBBS, FCPS (OBGYN)', 900],
            ['Dr. Sazzad Hossain', 'ENT Specialist', 'ENT', 'MBBS, DLO, MS (ENT)', 800],
            ['Dr. Rahima Akter', 'Pediatrician', 'Pediatrics', 'MBBS, FCPS (Pediatrics)', 700],
            ['Dr. Anwarul Kabir', 'Neurologist', 'Neurology', 'MBBS, MD (Neurology)', 1200],
            ['Dr. Shamsun Nahar', 'Ophthalmologist', 'Ophthalmology', 'MBBS, DO, FCPS', 850],
            ['Dr. Abdul Gafur', 'Gastroenterologist', 'Gastroenterology', 'MBBS, MD (Gastro)', 950],
            ['Dr. Fatema Akhter', 'Medicine Specialist', 'Medicine', 'MBBS, FCPS (Medicine)', 800],
            ['Dr. Didar Hossain', 'Cardiologist', 'Cardiology', 'MBBS, MD (Cardiology)', 1200],
            ['Dr. Nazma Sultana', 'Dermatologist', 'Dermatology', 'MBBS, DDV, MCPS', 750],
            ['Dr. Shekh Mofizur Rahman', 'Orthopedic Surgeon', 'Orthopedics', 'MBBS, D-Ortho, MS', 1000],
            ['Dr. Rowshan Ara', 'Gynecologist', 'Gynecology & Obstetrics', 'MBBS, MS (OBGYN)', 950],
            ['Dr. Fazlur Rahman Babu', 'ENT Specialist', 'ENT', 'MBBS, DLO, FCPS (ENT)', 800],
            ['Dr. Maksuda Parvin', 'Pediatrician', 'Pediatrics', 'MBBS, MD (Pediatrics)', 750],
            ['Dr. Quazi Tarikul Islam', 'Neurologist', 'Neurology', 'MBBS, FCPS (Neurology)', 1100],
            ['Dr. Morsheda Akter', 'Ophthalmologist', 'Ophthalmology', 'MBBS, MS (Ophthalmology)', 850],
            ['Dr. Syed Md. Akram Hossain', 'Gastroenterologist', 'Gastroenterology', 'MBBS, FCPS (Gastro)', 900],
            ['Dr. Sharifunnesa', 'Medicine Specialist', 'Medicine', 'MBBS, MD (Internal Medicine)', 800],
            ['Dr. Abdul Hamid', 'Cardiologist', 'Cardiology', 'MBBS, DM (Cardiology)', 1300],
            ['Dr. Zakia Sultana', 'Dermatologist', 'Dermatology', 'MBBS, DDV', 800],
            ['Dr. Harun Ur Rashid', 'Orthopedic Surgeon', 'Orthopedics', 'MBBS, MS (Ortho)', 1000],
            ['Dr. Nasrin Akter', 'Gynecologist', 'Gynecology & Obstetrics', 'MBBS, FCPS (OBGYN)', 900],
            ['Dr. Mahmudur Rahman Sarker', 'ENT Specialist', 'ENT', 'MBBS, DLO, MS (ENT)', 850],
            ['Dr. Rehana Begum', 'Pediatrician', 'Pediatrics', 'MBBS, DCH, FCPS', 700],
            ['Dr. Nurun Nahar', 'Neurologist', 'Neurology', 'MBBS, MD (Neurology)', 1200],
            ['Dr. Md. Shafiqul Islam', 'Gastroenterologist', 'Gastroenterology', 'MBBS, FCPS (Gastro)', 950],
        ];

        $schedulesCreated = false;

        foreach ($doctorsData as [$fullName, $specializationName, $departmentName, $qualifications, $fee]) {
            $emailSlug = str($fullName)->slug();
            $email = "{$emailSlug}@docslot.com";

            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $fullName,
                    'password' => Hash::make('123456'),
                    'phone' => '01' . fake()->numerify('########'),
                    'is_active' => true,
                ]
            );

            if (! $user->hasRole('doctor')) {
                $user->assignRole($doctorRole);
            }

            $doctor = Doctor::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'specialization_id' => $specializationIds[$specializationName],
                    'department_id' => $departmentIds[$departmentName],
                    'license_number' => 'BMDC-' . fake()->numerify('######'),
                    'qualifications' => $qualifications,
                    'bio' => "Experienced $specializationName with over " . rand(5, 20) . " years of practice. Dedicated to providing quality healthcare.",
                    'consultation_fee' => $fee,
                    'status' => 'active',
                ]
            );

            // Create schedules only for new doctors (no existing schedules)
            if ($doctor->schedules()->count() === 0) {
                // Saturday to Wednesday (6,0,1,2,3) — 5 days for some
                // Sunday to Thursday (0,1,2,3,4) — 5 days for others
                $workDays = fake()->randomElement([
                    [6, 0, 1, 2, 3],
                    [0, 1, 2, 3, 4],
                ]);

                foreach ($workDays as $day) {
                    DoctorSchedule::create([
                        'doctor_id' => $doctor->id,
                        'day_of_week' => $day,
                        'start_time' => sprintf('%02d:00', rand(8, 10)),
                        'end_time' => sprintf('%02d:00', rand(16, 20)),
                        'slot_duration' => 30,
                        'max_daily_appointments' => rand(10, 20),
                        'is_available' => true,
                    ]);
                }

                $schedulesCreated = true;
            }
        }
    }
}
