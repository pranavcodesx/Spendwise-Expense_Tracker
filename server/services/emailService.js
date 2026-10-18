import nodemailer from 'nodemailer';

// Returns true only when the email was really handed to the SMTP server.
export async function sendResetEmail(to, link) {
  if (!process.env.SMTP_HOST) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`\n[DEV MODE - SMTP not configured] Password reset link for ${to}:\n${link}\n`);
    } else {
      console.error('SMTP is not configured, so the password reset email was NOT sent.');
    }
    return false;
  }
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'SpendWise <no-reply@spendwise.app>',
    to,
    subject: 'Reset your SpendWise password',
    text: `Use this link to reset your password (valid for 1 hour):\n${link}\n\nIf you did not ask for this, ignore this email.`,
  });
  return true;
}
