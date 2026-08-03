<?php

use App\Features\Admin\Controllers\AuditLogController;
use App\Features\Admin\Controllers\SettingsController;
use App\Features\Admin\Controllers\TaxonomyController;
use App\Features\Admin\Controllers\UserManagementController;
use App\Features\Appointments\Controllers\AppointmentController;
use App\Features\Auth\Controllers\AuthController;
use App\Features\Dashboard\Controllers\AdminDashboardController;
use App\Features\Dashboard\Controllers\DoctorDashboardController;
use App\Features\Dashboard\Controllers\PatientDashboardController;
use App\Features\Doctors\Controllers\DoctorController;
use App\Features\Landing\Controllers\LandingController;
use App\Features\Doctors\Controllers\DoctorScheduleController;
use App\Features\MedicalRecords\Controllers\MedicalRecordController;
use App\Features\Notifications\Controllers\NotificationController;
use App\Features\Patients\Controllers\PatientController;
use App\Features\Prescriptions\Controllers\PrescriptionController;
use App\Features\Ratings\Controllers\RatingController;
use App\Features\Referrals\Controllers\ReferralController;
use App\Features\Reports\Controllers\ReportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Feature-based route groups.
|
*/

// ──────────────────────────────────────────
// Auth Routes (no auth required)
// ──────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
});

// ──────────────────────────────────────────
// Authenticated Auth Routes
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->prefix('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
    Route::post('change-password', [AuthController::class, 'changePassword']);
});

// ──────────────────────────────────────────
// Landing page (public, read-only)
// ──────────────────────────────────────────
Route::prefix('landing')->group(function () {
    Route::get('stats', [LandingController::class, 'stats']);
    Route::get('specialties', [LandingController::class, 'specialties']);
    Route::get('featured-doctors', [LandingController::class, 'featuredDoctors']);
    Route::get('top-rated-doctors', [LandingController::class, 'topRatedDoctors']);
    Route::get('testimonials', [LandingController::class, 'testimonials']);
});

// ──────────────────────────────────────────
// Doctor Routes
// ──────────────────────────────────────────
Route::prefix('doctors')->group(function () {
    Route::get('/', [DoctorController::class, 'index']);
    Route::get('/{id}', [DoctorController::class, 'show']);
    Route::get('/{id}/ratings', [RatingController::class, 'doctorRatings']);
    Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->group(function () {
        Route::post('/', [DoctorController::class, 'store'])->middleware('role:admin');
        Route::put('/{id}', [DoctorController::class, 'update']);
        Route::get('/{id}/appointments', [DoctorController::class, 'appointments'])->middleware('roles:admin,doctor');
        Route::get('/{id}/slots', [DoctorController::class, 'slots']);
        Route::get('/{id}/schedule', [DoctorScheduleController::class, 'show']);
        Route::put('/{id}/schedule', [DoctorScheduleController::class, 'update']);

        Route::middleware('role:admin')->group(function () {
            Route::delete('/{id}', [DoctorController::class, 'destroy']);
            Route::patch('/{id}/status', [DoctorController::class, 'toggleStatus']);
        });
    });
});

// ──────────────────────────────────────────
// Patient Routes (admin & doctor)
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->prefix('patients')->group(function () {
    Route::get('/', [PatientController::class, 'index'])->middleware('roles:admin,doctor');
    Route::get('/{id}', [PatientController::class, 'show']);
    Route::put('/{id}', [PatientController::class, 'update']);
    Route::delete('/{id}', [PatientController::class, 'destroy']);
    Route::patch('/{id}/status', [PatientController::class, 'toggleStatus']);
    Route::get('/{id}/medical-history', [PatientController::class, 'medicalHistory']);
    Route::get('/{id}/prescriptions', [PatientController::class, 'prescriptions']);
    Route::post('/{id}/refer', [ReferralController::class, 'store'])->middleware('role:doctor');
});

// ──────────────────────────────────────────
// Referrals
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1', 'role:doctor'])->prefix('referrals')->group(function () {
    Route::get('my', [ReferralController::class, 'myReferrals']);
});

// ──────────────────────────────────────────
// Admin Routes (admin-only, enforced via Tyro's `role` middleware)
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1', 'role:admin'])->prefix('admin')->group(function () {
    // User management
    Route::get('users', [UserManagementController::class, 'index']);
    Route::get('users/{id}', [UserManagementController::class, 'show']);
    Route::patch('users/{id}/status', [UserManagementController::class, 'toggleStatus']);
    Route::delete('users/{id}', [UserManagementController::class, 'destroy']);

    // Settings
    Route::get('settings', [SettingsController::class, 'index']);
    Route::put('settings', [SettingsController::class, 'update']);
});

// Public booking rules (e.g. minimum advance-booking lead time)
Route::get('booking-settings', [SettingsController::class, 'publicBookingSettings']);

// ──────────────────────────────────────────
// Departments & Specializations
// ──────────────────────────────────────────
foreach (['departments', 'specializations'] as $resource) {
    Route::prefix($resource)->group(function () use ($resource) {
        Route::get('/', [TaxonomyController::class, 'index'])->defaults('resource', $resource);
        Route::get('/{id}', [TaxonomyController::class, 'show'])->defaults('resource', $resource);

        Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1', 'role:admin'])->group(function () use ($resource) {
            Route::post('/', [TaxonomyController::class, 'store'])->defaults('resource', $resource);
            Route::put('/{id}', [TaxonomyController::class, 'update'])->defaults('resource', $resource);
            Route::delete('/{id}', [TaxonomyController::class, 'destroy'])->defaults('resource', $resource);
            Route::patch('/{id}/status', [TaxonomyController::class, 'toggleStatus'])->defaults('resource', $resource);
        });
    });
}

// ──────────────────────────────────────────
// Appointments
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->prefix('appointments')->group(function () {
    Route::get('/', [AppointmentController::class, 'index'])->middleware('role:admin');
    Route::get('my', [AppointmentController::class, 'myAppointments']);
    Route::get('/{id}', [AppointmentController::class, 'show']);
    Route::post('/', [AppointmentController::class, 'store']);
    Route::post('/{id}/cancel', [AppointmentController::class, 'cancel']);
    Route::post('/{id}/confirm', [AppointmentController::class, 'confirm']);
    Route::post('/{id}/complete', [AppointmentController::class, 'complete']);
    Route::post('/{id}/reschedule', [AppointmentController::class, 'reschedule']);
    Route::post('/{id}/rate', [RatingController::class, 'store'])->middleware('role:patient');
});

// ──────────────────────────────────────────
// Prescriptions
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->prefix('prescriptions')->group(function () {
    Route::get('/', [PrescriptionController::class, 'index'])->middleware('role:admin');
    Route::get('my', [PrescriptionController::class, 'myPrescriptions']);
    Route::get('/{id}', [PrescriptionController::class, 'show']);
    Route::post('/', [PrescriptionController::class, 'store']);
    Route::put('/{id}', [PrescriptionController::class, 'update']);
    Route::delete('/{id}', [PrescriptionController::class, 'destroy'])->middleware('role:admin');
});

// ──────────────────────────────────────────
// Medical Records
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->prefix('medical-records')->group(function () {
    Route::get('/', [MedicalRecordController::class, 'index'])->middleware('role:admin');
    Route::get('my', [MedicalRecordController::class, 'myRecords']);
    Route::get('/{id}', [MedicalRecordController::class, 'show']);
    Route::get('/{id}/file', [MedicalRecordController::class, 'downloadFile']);
    Route::post('/', [MedicalRecordController::class, 'store']);
    Route::put('/{id}', [MedicalRecordController::class, 'update']);
    Route::delete('/{id}', [MedicalRecordController::class, 'destroy'])->middleware('role:admin');
});

// ──────────────────────────────────────────
// Notifications
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->prefix('notifications')->group(function () {
    Route::get('/', [NotificationController::class, 'index']);
    Route::get('unread-count', [NotificationController::class, 'unreadCount']);
    Route::post('mark-all-read', [NotificationController::class, 'markAllAsRead']);
    Route::get('/{id}', [NotificationController::class, 'show']);
    Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
});

// ──────────────────────────────────────────
// Reports
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1', 'role:admin'])->prefix('reports')->group(function () {
    Route::get('appointments', [ReportController::class, 'appointments']);
    Route::get('revenue', [ReportController::class, 'revenue']);
    Route::get('doctors', [ReportController::class, 'doctors']);
    Route::get('patients', [ReportController::class, 'patients']);
    Route::get('prescriptions', [ReportController::class, 'prescriptions']);
});

// ──────────────────────────────────────────
// Audit Logs (admin-only)
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1', 'role:admin'])->prefix('audit-logs')->group(function () {
    Route::get('/', [AuditLogController::class, 'index']);
    Route::get('/{id}', [AuditLogController::class, 'show']);
});

// ──────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'active', 'password-changed', 'throttle:60,1'])->prefix('dashboard')->group(function () {
    Route::get('admin', AdminDashboardController::class)->middleware('role:admin');
    Route::get('doctor', DoctorDashboardController::class)->middleware('role:doctor');
    Route::get('patient', PatientDashboardController::class)->middleware('role:patient');
});
