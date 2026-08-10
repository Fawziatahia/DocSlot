<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!--[if !mso]><!-->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sora:wght@600;700;800&display=swap" rel="stylesheet">
<!--<![endif]-->
<title>{{ $subject ?? 'DocSlot' }}</title>
<style>
    body, table, td { font-family: 'Inter', 'Segoe UI', Arial, sans-serif; }
    h1, h2, h3 { font-family: 'Sora', 'Segoe UI', Arial, sans-serif; }
</style>
</head>
<body style="margin: 0; padding: 0; background: #f6f8fb; font-family: 'Inter', 'Segoe UI', Arial, sans-serif; font-size: 15px; line-height: 1.6; color: #1f2937;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background: #f6f8fb; padding: 32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 24px rgba(17, 24, 39, 0.08); border: 1px solid #e8ebf0;">
                    <tr>
                        <td style="background: #1d4ed8; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 36px 32px; text-align: center;">
                            <img src="https://i.ibb.co.com/RGZ5cg0p/logo-1.png" alt="DocSlot" height="64" style="height: 64px; width: auto; display: inline-block; vertical-align: middle;">
                            <div style="font-family: 'Sora', 'Segoe UI', Arial, sans-serif; font-size: 26px; font-weight: 800; letter-spacing: 0.02em; color: #ffffff; margin-top: 10px;">DocSlot</div>
                        </td>
                    </tr>
                    <tr>
                        <td height="4" style="height: 4px; line-height: 4px; font-size: 4px; background: #1d4ed8; background: linear-gradient(90deg, #60a5fa 0%, #2563eb 50%, #1d4ed8 100%);">&nbsp;</td>
                    </tr>
                    <tr>
                        <td style="padding: 36px 32px;">
                            {{ $slot }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 22px 32px; background: #f6f8fb; border-top: 1px solid #e8ebf0; text-align: center;">
                            <img src="https://i.ibb.co.com/RGZ5cg0p/logo-1.png" alt="DocSlot" height="20" style="height: 20px; width: auto; opacity: 0.5; margin-bottom: 8px;">
                            <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                                &copy; {{ date('Y') }} DocSlot. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
