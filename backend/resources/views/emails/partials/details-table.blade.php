<table role="presentation" style="width: 100%; border-collapse: collapse; background: #f8fafc; border: 1px solid #e8ebf0; border-radius: 12px; margin: 0 0 24px;">
    <tr>
        <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280;">{{ $primaryLabel }}</td>
        <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-weight: 700; text-align: right; font-size: 16px; color: #1d4ed8;">{{ $primaryValue }}</td>
    </tr>
    <tr>
        <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-top: 1px solid #e8ebf0;">When</td>
        <td style="padding: 14px 20px; font-weight: 700; text-align: right; font-size: 15px; color: #111827; border-top: 1px solid #e8ebf0;">{{ $when }}</td>
    </tr>
    @if ($reason ?? null)
        <tr>
            <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-top: 1px solid #e8ebf0;">Reason</td>
            <td style="padding: 14px 20px; text-align: right; font-size: 15px; color: #111827; border-top: 1px solid #e8ebf0;">{{ $reason }}</td>
        </tr>
    @endif
    <tr>
        <td style="padding: 14px 20px; font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-top: 1px solid #e8ebf0;">Status</td>
        <td style="padding: 14px 20px; text-align: right; border-top: 1px solid #e8ebf0;">@include('emails.partials.status-badge', ['status' => $status])</td>
    </tr>
</table>
