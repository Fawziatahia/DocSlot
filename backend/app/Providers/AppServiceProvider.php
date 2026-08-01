<?php

namespace App\Providers;

use App\Features\Appointments\Events\AppointmentBooked;
use App\Features\Appointments\Events\AppointmentCancelled;
use App\Features\Appointments\Events\AppointmentRescheduled;
use App\Features\Appointments\Events\AppointmentStatusChanged;
use App\Features\Appointments\Listeners\SendAppointmentBookedNotifications;
use App\Features\Appointments\Listeners\SendAppointmentCancelledNotifications;
use App\Features\Appointments\Listeners\SendAppointmentRescheduledNotifications;
use App\Features\Appointments\Listeners\SendAppointmentStatusChangedNotifications;
use App\Features\Appointments\Policies\AppointmentPolicy;
use App\Features\Doctors\Policies\DoctorPolicy;
use App\Features\MedicalRecords\Policies\MedicalRecordPolicy;
use App\Features\Patients\Policies\PatientPolicy;
use App\Features\Prescriptions\Policies\PrescriptionPolicy;
use App\Models\Appointment;
use App\Models\Doctor;
use App\Models\MedicalRecord;
use App\Models\Patient;
use App\Models\Prescription;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Event::listen(AppointmentBooked::class, SendAppointmentBookedNotifications::class);
        Event::listen(AppointmentCancelled::class, SendAppointmentCancelledNotifications::class);
        Event::listen(AppointmentRescheduled::class, SendAppointmentRescheduledNotifications::class);
        Event::listen(AppointmentStatusChanged::class, SendAppointmentStatusChangedNotifications::class);

        Gate::policy(Doctor::class, DoctorPolicy::class);
        Gate::policy(Patient::class, PatientPolicy::class);
        Gate::policy(MedicalRecord::class, MedicalRecordPolicy::class);
        Gate::policy(Prescription::class, PrescriptionPolicy::class);
        Gate::policy(Appointment::class, AppointmentPolicy::class);

        // The API has no reset-password page of its own — point the emailed
        // link at the SPA, which reads the token/email from the query string.
        ResetPassword::createUrlUsing(function ($notifiable, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');
            $email = urlencode($notifiable->getEmailForPasswordReset());

            return "{$frontendUrl}/reset-password?token={$token}&email={$email}";
        });
    }
}
