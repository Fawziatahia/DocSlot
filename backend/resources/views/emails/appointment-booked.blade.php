@component('emails.layout')
    @if ($audience === 'doctor')
        <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; letter-spacing: 0.01em; color: #111827;">New appointment booked</h2>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
            {{ $appointment->patient->user->name }} has booked an appointment with you.
        </p>
    @else
        <h2 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; letter-spacing: 0.01em; color: #111827;">Your appointment is booked</h2>
        <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6;">
            Hi {{ $appointment->patient->user->name }}, your appointment with
            {{ $appointment->doctor->displayName() }} is confirmed as booked.
        </p>
    @endif

    @include('emails.partials.details-table', [
        'primaryLabel' => $audience === 'doctor' ? 'Patient' : 'Doctor',
        'primaryValue' => $audience === 'doctor'
            ? $appointment->patient->user->name
            : $appointment->doctor->displayName(),
        'when' => $when,
        'reason' => $appointment->reason,
        'status' => $appointment->status->value,
    ])

    @include('emails.partials.cta-button', [
        'url' => config('app.frontend_url') . '/appointments',
        'label' => 'View in Dashboard',
        'align' => 'left',
    ])

    <p style="color: #6b7280; font-size: 13px; margin: 0;">
        You can view or manage this appointment any time from your DocSlot dashboard.
    </p>
@endcomponent
