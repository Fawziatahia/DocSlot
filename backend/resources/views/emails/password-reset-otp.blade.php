@component('emails.layout')
    <div style="text-align: center; margin-bottom: 8px;">
        <span style="display: inline-block; width: 56px; height: 56px; line-height: 56px; border-radius: 50%; background: #dbeafe; color: #1d4ed8; font-size: 26px; font-weight: bold;">&#128274;</span>
    </div>
    <h2 style="margin: 0 0 8px; text-align: center; font-size: 22px; font-weight: 800; letter-spacing: 0.01em; color: #111827;">Reset your password</h2>
    <p style="margin: 0 0 20px; font-size: 15px; line-height: 1.6; text-align: center;">Use the code below to reset your DocSlot account password.</p>
    <div style="font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 34px; font-weight: 800; letter-spacing: 8px; text-align: center; color: #1d4ed8; background: #eff6ff; border: 1px solid #dbeafe; border-radius: 12px; padding: 22px; margin: 0 0 24px;">
        {{ $otp }}
    </div>
    <p style="margin: 0 0 8px; font-size: 15px; text-align: center;">This code expires in {{ $expiresInMinutes }} minutes.</p>
    <p style="color: #6b7280; font-size: 13px; margin: 0; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
@endcomponent
