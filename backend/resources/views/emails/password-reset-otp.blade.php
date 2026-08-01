<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 0;">
    <div style="max-width: 480px; margin: 0 auto; padding: 32px 24px;">
        <h2 style="margin-bottom: 8px;">Reset your password</h2>
        <p style="margin-top: 0;">Use the code below to reset your DocSlot account password.</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 24px 0;">
            {{ $otp }}
        </div>
        <p>This code expires in {{ $expiresInMinutes }} minutes.</p>
        <p style="color: #6b7280; font-size: 13px;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
</body>
</html>
