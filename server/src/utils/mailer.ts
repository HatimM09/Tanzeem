import nodemailer from 'nodemailer';

/**
 * Creates a nodemailer transporter.
 * Uses environment variables for SMTP config.
 * Falls back to Ethereal (fake SMTP) in dev/demo mode.
 */
async function getTransporter() {
  // If SMTP credentials are configured, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Dev fallback: Ethereal fake SMTP (logs preview URL to console)
  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host:   'smtp.ethereal.email',
    port:   587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
}

export async function sendOTPEmail(
  to: string,
  name: string,
  otp: string,
  role: string,
): Promise<void> {
  const transporter = await getTransporter();

  const roleLabel = role === 'admin' ? 'Admin' : 'Supervisor';
  const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="UTF-8"></head>
  <body style="margin:0;padding:0;background:#0a0e1a;font-family:sans-serif">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="padding:40px 20px">
        <table width="480" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;overflow:hidden">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1,#06b6d4);padding:24px;text-align:center">
              <div style="font-size:22px;font-weight:800;color:white;letter-spacing:-0.5px">Procurement Tracker</div>
              <div style="font-size:12px;color:rgba(255,255,255,0.75);margin-top:4px">Mahad al Zahra · Al Jamea Tus Saifiyah, Galiakot</div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 28px">
              <p style="color:#94a3b8;font-size:14px;margin:0 0 8px">Hello, <strong style="color:#f1f5f9">${name}</strong></p>
              <p style="color:#94a3b8;font-size:14px;margin:0 0 24px">Your one-time login code for the <strong style="color:#818cf8">${roleLabel} Portal</strong> is:</p>

              <!-- OTP Box -->
              <div style="background:#1e2d45;border:2px solid #6366f1;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
                <div style="font-size:42px;font-weight:900;letter-spacing:12px;color:#f1f5f9;font-family:monospace">${otp}</div>
                <div style="font-size:12px;color:#475569;margin-top:8px">Valid for <strong style="color:#f59e0b">10 minutes</strong> · One-time use only</div>
              </div>

              <p style="color:#475569;font-size:12px;margin:0">If you did not request this code, please ignore this email. Do not share this code with anyone.</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#0a0e1a;padding:16px 28px;border-top:1px solid #1e2d45">
              <p style="color:#1e2d45;font-size:11px;margin:0;text-align:center">
                © Tanzeem Department · Mahad al Zahra · Al Jamea Tus Saifiyah, Galiakot
              </p>
            </td>
          </tr>

        </table>
      </td></tr>
    </table>
  </body>
  </html>
  `;

  const info = await transporter.sendMail({
    from:    `"Procurement Tracker" <${process.env.SMTP_FROM || 'noreply@procurementtracker.app'}>`,
    to,
    subject: `🔐 Your Login Code: ${otp} — Procurement Tracker`,
    html,
    text: `Your Procurement Tracker OTP for ${roleLabel} portal is: ${otp}\nValid for 10 minutes. One-time use only.`,
  });

  // In dev with Ethereal, log the preview URL
  if (!process.env.SMTP_HOST) {
    console.log('📧 Email preview URL:', nodemailer.getTestMessageUrl(info));
  }
}
