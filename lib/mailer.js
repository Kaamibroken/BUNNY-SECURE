import nodemailer from 'nodemailer';

export async function sendResetEmail(toEmail, resetUrl) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"BUNNY Admin" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: '🔐 BUNNY — Password Reset Link',
    html: `
      <div style="background:#050505;color:#fff;padding:40px;font-family:monospace;max-width:500px;border:1px solid #ff0000;border-radius:12px">
        <h2 style="color:#ff0000;letter-spacing:4px;margin-bottom:16px">🐰 BUNNY ADMIN</h2>
        <p style="color:#aaa;margin-bottom:8px">Password reset request mila hai.</p>
        <p style="color:#555;font-size:13px;margin-bottom:28px">Ye link 30 minute mein expire ho jayega.</p>
        <a href="${resetUrl}"
          style="display:inline-block;background:#ff0000;color:#fff;padding:13px 30px;
          text-decoration:none;border-radius:7px;font-weight:bold;letter-spacing:2px;font-size:14px">
          RESET PASSWORD →
        </a>
        <p style="margin-top:28px;color:#333;font-size:11px">
          Agar aapne ye request nahi ki to ignore karo.
        </p>
      </div>`,
  });
}
