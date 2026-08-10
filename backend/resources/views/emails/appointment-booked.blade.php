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
            Dr. {{ $appointment->doctor->user->name }} is confirmed as booked.
        </p>
    @endif

    <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e8ebf0; border-radius: 12px; margin: 0 0 24px;">
        <tr>
            <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280;">
                {{ $audience === 'doctor' ? 'Patient' : 'Doctor' }}
            </td>
            <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-weight: 700; text-align: right; font-size: 16px; color: #1d4ed8;">
                {{ $audience === 'doctor'
                    ? $appointment->patient->user->name
                    : 'Dr. ' . $appointment->doctor->user->name }}
            </td>
        </tr>
        <tr>
            <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-top: 1px solid #e8ebf0;">When</td>
            <td style="padding: 14px 20px; font-weight: 700; text-align: right; font-size: 15px; color: #111827; border-top: 1px solid #e8ebf0;">{{ $when }}</td>
        </tr>
        @if ($appointment->reason)
            <tr>
                <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-top: 1px solid #e8ebf0;">Reason</td>
                <td style="padding: 14px 20px; text-align: right; font-size: 15px; color: #111827; border-top: 1px solid #e8ebf0;">{{ $appointment->reason }}</td>
            </tr>
        @endif
        <tr>
            <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-top: 1px solid #e8ebf0;">Status</td>
            <td style="padding: 14px 20px; text-align: right; border-top: 1px solid #e8ebf0;">@include('emails.partials.status-badge', ['status' => $appointment->status->value])</td>
        </tr>
    </table>

    <table role="presentation" style="margin: 0 0 24px;">
        <tr>
            <td style="border-radius: 8px; background: #2563eb;">
                <a href="{{ config('app.frontend_url') }}/appointments" style="display: inline-block; padding: 13px 28px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px;">
                    View in Dashboard
                </a>
            </td>
        </tr>
    </table>

    <p style="color: #6b7280; font-size: 13px; margin: 0;">
        You can view or manage this appointment any time from your DocSlot dashboard.
    </p>
@endcomponent
