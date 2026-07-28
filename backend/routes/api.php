<?php

use App\Features\Auth\Controllers\AuthController;
use App\Features\Doctors\Controllers\DoctorController;
use App\Features\Doctors\Controllers\DoctorScheduleController;
use App\Features\Patients\Controllers\PatientController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Feature-based route groups. Each group is rate-limited and
| authenticated as appropriate.
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
    // Public search/list (patients & admins)
    Route::get('/', [DoctorController::class, 'index']);

    // Doctor detail (all authenticated users)
    Route::get('/{id}', [DoctorController::class, 'show']);

    // Admin-only mutations
    Route::middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
        Route::post('/', [DoctorController::class, 'store']);
        Route::put('/{id}', [DoctorController::class, 'update']);
        Route::delete('/{id}', [DoctorController::class, 'destroy']);
        Route::patch('/{id}/status', [DoctorController::class, 'toggleStatus']);

        // Schedule (admin or doctor owner)
        Route::get('/{id}/schedule', [DoctorScheduleController::class, 'show']);
        Route::put('/{id}/schedule', [DoctorScheduleController::class, 'update']);
    });
});

// ──────────────────────────────────────────
// Patient Routes
// ──────────────────────────────────────────
Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('patients')->group(function () {
    Route::get('/', [PatientController::class, 'index']);
    Route::get('/{id}', [PatientController::class, 'show']);
    Route::put('/{id}', [PatientController::class, 'update']);
    Route::delete('/{id}', [PatientController::class, 'destroy']);
    Route::patch('/{id}/status', [PatientController::class, 'toggleStatus']);
});

// ──────────────────────────────────────────
// Appointments — TODO: implement in next phase
// ──────────────────────────────────────────
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('appointments')->group(function () {
//     Route::get('/', [AppointmentController::class, 'index']);
//     Route::post('/', [AppointmentController::class, 'store']);
//     Route::get('/my', [PatientAppointmentController::class, 'myAppointments']);
//     Route::get('/my/upcoming', [PatientAppointmentController::class, 'upcoming']);
//     Route::get('/my/history', [PatientAppointmentController::class, 'history']);
//     Route::get('/available-slots', [AppointmentController::class, 'availableSlots']);
//     Route::get('/{id}', [AppointmentController::class, 'show']);
//     Route::patch('/{id}/status', [AppointmentController::class, 'updateStatus']);
//     Route::post('/{id}/reschedule', [AppointmentController::class, 'reschedule']);
// });

// ──────────────────────────────────────────
// Prescriptions — TODO: implement in next phase
// ──────────────────────────────────────────
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('prescriptions')->group(function () {
//     // ...
// });

// ──────────────────────────────────────────
// Medical Records — TODO: implement in next phase
// ──────────────────────────────────────────
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('medical-records')->group(function () {
//     // ...
// });

// ──────────────────────────────────────────
// Notifications — TODO: implement in next phase
// ──────────────────────────────────────────
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('notifications')->group(function () {
//     // ...
// });

// ──────────────────────────────────────────
// Dashboard — TODO: implement in next phase
// ──────────────────────────────────────────
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('dashboard')->group(function () {
//     // ...
// });

// ──────────────────────────────────────────
// Reports — TODO: implement in next phase
// ──────────────────────────────────────────
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('reports')->group(function () {
//     // ...
// });

// ──────────────────────────────────────────
// Departments & Specializations — TODO: implement in next phase
// ──────────────────────────────────────────
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('departments')->group(function () {
//     // ...
// });
// Route::middleware(['auth:sanctum', 'throttle:60,1'])->prefix('specializations')->group(function () {
//     // ...
// });
