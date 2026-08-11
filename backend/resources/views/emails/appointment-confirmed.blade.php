@component('emails.layout')
    <h2 style="margin: 0 0 12px; text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 0.01em; color: #111827;">Your appointment is confirmed</h2>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; text-align: center;">
        Hi {{ $appointment->patient->user->name }}, good news — {{ $appointment->doctor->displayName() }}
        has confirmed your appointment. We look forward to seeing you.
    </p>

    @include('emails.partials.details-table', [
        'primaryLabel' => 'Doctor',
        'primaryValue' => $appointment->doctor->displayName(),
        'when' => $when,
        'reason' => $appointment->reason,
        'status' => $appointment->status->value,
    ])

    @include('emails.partials.cta-button', [
        'url' => config('app.frontend_url') . '/appointments',
        'label' => 'View in Dashboard',
    ])

    <p style="color: #6b7280; font-size: 13px; margin: 0; text-align: center;">
        Need to reschedule or cancel? You can manage this appointment any time from your DocSlot dashboard.
    </p>
@endcomponent
