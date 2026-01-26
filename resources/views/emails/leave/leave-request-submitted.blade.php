<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>New Leave Request</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f1f5f9; line-height: 1.6;">

    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f1f5f9; padding: 40px 20px;">
        <tr>
            <td align="center">

                <!-- Main Container -->
                <table width="650" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);">

                    <!-- Header with Logo -->
                    <tr>
                        <td style="background-color: #2596be; padding: 50px 40px; text-align: center;">

                            <!-- Logo with Black Background -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 28px;">
                                        <div style="background-color: #000000; display: inline-block; padding: 20px 50px; border-radius: 12px; box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);">
                                            <img src="https://i.postimg.cc/RV82nPB5/image.png" alt="Rocket Partners" style="height: 50px; width: auto; display: block;">
                                        </div>
                                    </td>
                                </tr>
                            </table>

                            <h1 style="margin: 0 0 12px 0; font-size: 38px; font-weight: 800; color: #ffffff; text-shadow: 0 2px 4px rgba(0,0,0,0.1); letter-spacing: -0.5px;">
                                📅 New Leave Request
                            </h1>
                            <p style="margin: 0; font-size: 19px; color: #ffffff; opacity: 0.95; font-weight: 500;">
                                {{ $employee->name }} has submitted a leave request
                            </p>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 45px 40px;">

                            <!-- Greeting -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td>
                                        <h2 style="margin: 0 0 12px 0; font-size: 26px; font-weight: 700; color: #0f172a;">
                                            Leave Request Details
                                        </h2>
                                        <p style="margin: 0; font-size: 16px; color: #475569; line-height: 1.8;">
                                            A new leave request has been submitted and requires your review.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Employee Info -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                                <tr>
                                    <td style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #2596be; border-radius: 12px; padding: 24px;">
                                        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0c4a6e;">
                                            👤 Employee Information
                                        </h3>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Name:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 14px; color: #0f172a; font-weight: 700;">{{ $employee->name }}</span>
                                                </td>
                                            </tr>
                                            @if($employee->position)
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Position:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 14px; color: #0f172a;">{{ $employee->position }}</span>
                                                </td>
                                            </tr>
                                            @endif
                                            @if($employee->department)
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Department:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 14px; color: #0f172a;">{{ $employee->department }}</span>
                                                </td>
                                            </tr>
                                            @endif
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Email:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 14px; color: #2596be;">{{ $employee->email }}</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Leave Details -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px;">
                                <tr>
                                    <td style="background-color: #ffffff; border: 2px solid #2596be; border-radius: 12px; padding: 24px;">
                                        <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #0f172a;">
                                            📋 Leave Details
                                        </h3>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Leave Type:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 14px; color: #0f172a; font-weight: 700;">{{ $leaveType->name }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Start Date:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 14px; color: #0f172a; font-weight: 700;">{{ $startDate }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">End Date:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 14px; color: #0f172a; font-weight: 700;">{{ $endDate }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Total Days:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    <span style="font-size: 16px; color: #2596be; font-weight: 700;">{{ $totalDays }} day{{ $totalDays > 1 ? 's' : '' }}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td width="35%" style="padding: 8px 0; vertical-align: top;">
                                                    <span style="font-size: 14px; color: #64748b; font-weight: 600;">Status:</span>
                                                </td>
                                                <td style="padding: 8px 0;">
                                                    @if($status === 'pending_manager')
                                                        <span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 6px;">⏳ PENDING MANAGER APPROVAL</span>
                                                    @elseif($status === 'pending_hr')
                                                        <span style="display: inline-block; background-color: #dbeafe; color: #1e40af; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 6px;">⏳ PENDING HR APPROVAL</span>
                                                    @elseif($status === 'approved')
                                                        <span style="display: inline-block; background-color: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; padding: 6px 12px; border-radius: 6px;">✓ AUTO-APPROVED</span>
                                                    @endif
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Reason Section -->
                            @if($reason)
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="background-color: #f8fafc; border: 2px solid #e2e8f0; border-radius: 10px; padding: 20px;">
                                        <h4 style="margin: 0 0 12px 0; font-size: 15px; font-weight: 700; color: #334155;">
                                            💬 Reason for Leave:
                                        </h4>
                                        <p style="margin: 0; font-size: 14px; color: #475569; line-height: 1.7;">
                                            {{ $reason }}
                                        </p>
                                    </td>
                                </tr>
                            </table>
                            @endif

                            <!-- Action Button -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center" style="background-color: #2596be; border-radius: 12px; box-shadow: 0 6px 20px rgba(37, 150, 190, 0.4);">
                                                    <a href="{{ $viewUrl }}" style="display: block; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 19px; padding: 20px 60px; border-radius: 12px;">
                                                        👁️ View Leave Request
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Alternative Link -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                                <tr>
                                    <td style="background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 18px;">
                                        <p style="margin: 0 0 10px 0; font-size: 13px; color: #64748b; text-align: center;">
                                            Can't click the button? Copy this link:
                                        </p>
                                        <p style="margin: 0; font-size: 11px; color: #67bed9; word-break: break-all; font-family: 'Courier New', monospace; background-color: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; text-align: center;">
                                            {{ $viewUrl }}
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <!-- Help Section -->
                            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                                <tr>
                                    <td style="border-top: 2px solid #e2e8f0; padding-top: 28px;">
                                        <p style="margin: 0; font-size: 14px; color: #64748b; text-align: center; line-height: 1.7;">
                                            This is an automated notification. Please review the leave request in the system.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #0f172a; padding: 36px 40px; text-align: center;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding-bottom: 20px;">
                                        <div style="background-color: #000000; display: inline-block; padding: 12px 32px; border-radius: 8px;">
                                            <img src="https://i.postimg.cc/RV82nPB5/image.png" alt="Rocket Partners" style="height: 32px; width: auto; display: block;">
                                        </div>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin: 0 0 8px 0; font-size: 14px; color: #94a3b8;">
                                © {{ date('Y') }} <strong style="color: #2596be;">Rocket Partners</strong>. All rights reserved.
                            </p>
                            <p style="margin: 0 0 20px 0; font-size: 12px; color: #64748b;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center">
                                        <a href="https://rocketpartners.ph" style="color: #2596be; text-decoration: none; margin: 0 16px; font-size: 14px; font-weight: 600;">🌐 Website</a>
                                        <a href="#" style="color: #2596be; text-decoration: none; margin: 0 16px; font-size: 14px; font-weight: 600;">💼 LinkedIn</a>
                                        <a href="#" style="color: #2596be; text-decoration: none; margin: 0 16px; font-size: 14px; font-weight: 600;">📱 Facebook</a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>
