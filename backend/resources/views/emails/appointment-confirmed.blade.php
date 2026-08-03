<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 0;">
    <div style="max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        <div style="text-align: center; margin-bottom: 8px;">
            <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #dcfce7; color: #16a34a; font-size: 28px; font-weight: bold;">&check;</span>
        </div>
        <h2 style="margin-bottom: 8px; text-align: center;">Your appointment is confirmed</h2>
        <p style="margin-top: 0;">
            Hi {{ $appointment->patient->user->name }}, good news — Dr. {{ $appointment->doctor->user->name }}
            has confirmed your appointment. We look forward to seeing you.
        </p>

        <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; margin: 24px 0;">
            <tr>
                <td style="padding: 10px 16px; color: #6b7280;">Doctor</td>
                <td style="padding: 10px 16px; font-weight: bold; text-align: right;">Dr. {{ $appointment->doctor->user->name }}</td>
            </tr>
            <tr>
                <td style="padding: 10px 16px; color: #6b7280;">When</td>
                <td style="padding: 10px 16px; font-weight: bold; text-align: right;">{{ $when }}</td>
            </tr>
            @if ($appointment->reason)
                <tr>
                    <td style="padding: 10px 16px; color: #6b7280;">Reason</td>
                    <td style="padding: 10px 16px; text-align: right;">{{ $appointment->reason }}</td>
                </tr>
            @endif
            <tr>
                <td style="padding: 10px 16px; color: #6b7280;">Status</td>
                <td style="padding: 10px 16px; text-align: right;">{{ ucfirst($appointment->status->value) }}</td>
            </tr>
        </table>

        <p style="color: #6b7280; font-size: 13px;">
            Need to reschedule or cancel? You can manage this appointment any time from your DocSlot dashboard.
        </p>
    </div>
</body>
</html>
