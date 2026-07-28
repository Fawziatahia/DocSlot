<?php

use App\Features\Admin\Controllers\AuditLogController;
use App\Features\Admin\Controllers\DepartmentController;
use App\Features\Admin\Controllers\SettingsController;
use App\Features\Admin\Controllers\SpecializationController;
use App\Features\Admin\Controllers\UserManagementController;
use App\Features\Auth\Controllers\AuthController;
use App\Features\Dashboard\Controllers\AdminDashboardController;
use App\Features\Dashboard\Controllers\DoctorDashboardController;
use App\Features\Dashboard\Controllers\PatientDashboardController;
use App\Features\Doctors\Controllers\DoctorController;
use App\Features\Doctors\Controllers\DoctorScheduleController;
use App\Features\Patients\Controllers\PatientController;
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
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('auth')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('me', [AuthController::class, 'me']);
});

// ──────────────────────────────────────────
// Doctor Routes
// ──────────────────────────────────────────
Route::prefix('doctors')->group(function () {
    Route::get('/', [DoctorController::class, 'index']);
    Route::get('/{id}', [DoctorController::class, 'show']);
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
        Route::post('/', [DoctorController::class, 'store']);
        Route::put('/{id}', [DoctorController::class, 'update']);
        Route::delete('/{id}', [DoctorController::class, 'destroy']);
        Route::patch('/{id}/status', [DoctorController::class, 'toggleStatus']);
        Route::get('/{id}/appointments', [DoctorController::class, 'appointments']);
        Route::get('/{id}/slots', [DoctorController::class, 'slots']);
        Route::get('/{id}/schedule', [DoctorScheduleController::class, 'show']);
        Route::put('/{id}/schedule', [DoctorScheduleController::class, 'update']);
    });
});

// ──────────────────────────────────────────
// Patient Routes (admin & doctor)
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('patients')->group(function () {
    Route::get('/', [PatientController::class, 'index']);
    Route::get('/{id}', [PatientController::class, 'show']);
    Route::put('/{id}', [PatientController::class, 'update']);
    Route::delete('/{id}', [PatientController::class, 'destroy']);
    Route::patch('/{id}/status', [PatientController::class, 'toggleStatus']);
});

// ──────────────────────────────────────────
// Admin Routes (admin-only, role-checked in controllers)
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('admin')->group(function () {
    // User management
    Route::get('users', [UserManagementController::class, 'index']);
    Route::get('users/{id}', [UserManagementController::class, 'show']);
    Route::patch('users/{id}/status', [UserManagementController::class, 'toggleStatus']);
    Route::delete('users/{id}', [UserManagementController::class, 'destroy']);

    // Settings
    Route::get('settings', [SettingsController::class, 'index']);
    Route::put('settings', [SettingsController::class, 'update']);
});

// ──────────────────────────────────────────
// Departments & Specializations
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('departments')->group(function () {
    Route::get('/', [DepartmentController::class, 'index']);
    Route::get('/{id}', [DepartmentController::class, 'show']);
    Route::post('/', [DepartmentController::class, 'store']);
    Route::put('/{id}', [DepartmentController::class, 'update']);
    Route::delete('/{id}', [DepartmentController::class, 'destroy']);
    Route::patch('/{id}/status', [DepartmentController::class, 'toggleStatus']);
});

Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('specializations')->group(function () {
    Route::get('/', [SpecializationController::class, 'index']);
    Route::get('/{id}', [SpecializationController::class, 'show']);
    Route::post('/', [SpecializationController::class, 'store']);
    Route::put('/{id}', [SpecializationController::class, 'update']);
    Route::delete('/{id}', [SpecializationController::class, 'destroy']);
    Route::patch('/{id}/status', [SpecializationController::class, 'toggleStatus']);
});

// ──────────────────────────────────────────
// Audit Logs (admin-only)
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('audit-logs')->group(function () {
    Route::get('/', [AuditLogController::class, 'index']);
    Route::get('/{id}', [AuditLogController::class, 'show']);
});

// ──────────────────────────────────────────
// Dashboard
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('dashboard')->group(function () {
    Route::get('admin', AdminDashboardController::class);
    Route::get('doctor', DoctorDashboardController::class);
    Route::get('patient', PatientDashboardController::class);
});
