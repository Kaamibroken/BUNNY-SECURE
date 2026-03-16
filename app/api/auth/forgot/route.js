import { NextResponse } from 'next/server';
import crypto from 'crypto';
import getDb from '@/lib/db';
import { sendResetEmail } from '@/lib/mailer';
import { checkRateLimit } from '@/lib/auth';

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(`forgot_${ip}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Ek ghante mein 3 baar hi request kar sakte ho.' }, { status: 429 });
  }

  try {
    const db = getDb();
    const admin = db.prepare('SELECT * FROM admin WHERE id = 1').get();
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + 30 * 60 * 1000;

    db.prepare('UPDATE admin SET reset_token = ?, reset_expires = ? WHERE id = 1').run(token, expires);

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const resetUrl = `${siteUrl}/reset-password?token=${token}`;

    await sendResetEmail(admin.email, resetUrl);

    return NextResponse.json({ success: true, message: `Reset link ${admin.email} pe bhej diya!` });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Email send nahi hui. .env mein EMAIL_PASS check karo.' }, { status: 500 });
  }
}
