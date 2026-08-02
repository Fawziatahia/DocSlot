<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 0;">
    <div style="max-width: 520px; margin: 0 auto; padding: 32px 24px;">
        @if ($audience === 'doctor')
            <h2 style="margin-bottom: 8px;">New appointment booked</h2>
            <p style="margin-top: 0;">
                {{ $appointment->patient->user->name }} has booked an appointment with you.
            </p>
        @else
            <h2 style="margin-bottom: 8px;">Your appointment is booked</h2>
            <p style="margin-top: 0;">
                Hi {{ $appointment->patient->user->name }}, your appointment with
                Dr. {{ $appointment->doctor->user->name }} is confirmed as booked.
            </p>
        @endif

        <table style="width: 100%; border-collapse: collapse; background: #f8fafc; border-radius: 8px; margin: 24px 0;">
            <tr>
                <td style="padding: 10px 16px; color: #6b7280;">
                    {{ $audience === 'doctor' ? 'Patient' : 'Doctor' }}
                </td>
                <td style="padding: 10px 16px; font-weight: bold; text-align: right;">
                    {{ $audience === 'doctor'
                        ? $appointment->patient->user->name
                        : 'Dr. ' . $appointment->doctor->user->name }}
                </td>
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
            You can view or manage this appointment from your DocSlot dashboard.
        </p>
    </div>
</body>
</html>
