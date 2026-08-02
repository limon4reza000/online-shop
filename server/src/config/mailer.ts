import nodemailer from 'nodemailer';
import { env } from './env.js';

const transporter = env.smtp.enabled
  ? nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: { user: env.smtp.user, pass: env.smtp.pass },
    })
  : null;

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email via SMTP when configured; otherwise logs it to the
 * console so auth flows (OTP, verification, reset) remain testable
 * without real credentials. Wire up SMTP_* in .env to go live.
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  if (!transporter) {
    console.log(`\n[mailer] SMTP not configured — would send email:\n  To: ${to}\n  Subject: ${subject}\n  Body: ${html}\n`);
    return;
  }
  await transporter.sendMail({ from: env.smtp.from, to, subject, html });
}

export const emailTemplates = {
  otp: (code: string) => `
    <div style="font-family: sans-serif; padding: 24px;">
      <h2 style="color:#F778A1;">আপনার নিত্যঘর যাচাইকরণ কোড</h2>
      <p>আপনার অ্যাকাউন্ট যাচাই করতে এই কোডটি ব্যবহার করুন:</p>
      <p style="font-size: 28px; font-weight: bold; letter-spacing: 6px;">${code}</p>
      <p>এই কোডের মেয়াদ ১০ মিনিট।</p>
    </div>`,
  passwordReset: (link: string) => `
    <div style="font-family: sans-serif; padding: 24px;">
      <h2 style="color:#F778A1;">আপনার পাসওয়ার্ড রিসেট করুন</h2>
      <p>আপনার নিত্যঘর পাসওয়ার্ড রিসেট করতে নিচের লিংকে ক্লিক করুন। এই লিংকের মেয়াদ ১ ঘণ্টা।</p>
      <a href="${link}" style="display:inline-block;margin-top:12px;padding:12px 24px;background:#F778A1;color:#fff;border-radius:999px;text-decoration:none;">পাসওয়ার্ড রিসেট করুন</a>
    </div>`,
};
