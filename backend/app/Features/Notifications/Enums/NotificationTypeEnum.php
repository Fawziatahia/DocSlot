<?php

namespace App\Features\Notifications\Enums;

enum NotificationTypeEnum: string
{
    case AppointmentBooked = 'appointment_booked';
    case AppointmentCancelled = 'appointment_cancelled';
    case AppointmentRescheduled = 'appointment_rescheduled';
    case AppointmentConfirmed = 'appointment_confirmed';
    case AppointmentCompleted = 'appointment_completed';
    case AppointmentReminder = 'appointment_reminder';
    case PrescriptionIssued = 'prescription_issued';
    case NewPatient = 'new_patient';
    case PatientReferral = 'patient_referral';
    case System = 'system';
}
