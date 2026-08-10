@component('emails.layout')
    <div style="text-align: center; margin-bottom: 8px;">
        <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 28px; font-weight: bold;">&check;</span>
    </div>
    <h2 style="margin: 0 0 12px; text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 0.01em; color: #111827;">Your appointment is confirmed</h2>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; text-align: center;">
        Hi {{ $appointment->patient->user->name }}, good news — Dr. {{ $appointment->doctor->user->name }}
        has confirmed your appointment. We look forward to seeing you.
    </p>

    <table role="presentation" style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e8ebf0; border-radius: 12px; margin: 0 0 24px;">
        <tr>
            <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280;">Doctor</td>
            <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-weight: 700; text-align: right; font-size: 16px; color: #1d4ed8;">Dr. {{ $appointment->doctor->user->name }}</td>
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

    <table role="presentation" style="width: 100%; margin: 0 0 24px;">
        <tr>
            <td align="center">
                <table role="presentation">
                    <tr>
                        <td style="border-radius: 8px; background: #2563eb;">
                            <a href="{{ config('app.frontend_url') }}/appointments" style="display: inline-block; padding: 13px 28px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px;">
                                View in Dashboard
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>

    <p style="color: #6b7280; font-size: 13px; margin: 0; text-align: center;">
        Need to reschedule or cancel? You can manage this appointment any time from your DocSlot dashboard.
    </p>
@endcomponent
