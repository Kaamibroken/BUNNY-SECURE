import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import getDb from '@/lib/db';
import { requireAdmin, clearAuthCookie } from '@/lib/auth';

export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { currentPassword, newUsername, newPassword } = await req.json();
    if (!currentPassword) return NextResponse.json({ error: 'Current password dalo.' }, { status: 400 });

    const db = getDb();
    const admin = db.prepare('SELECT * FROM admin WHERE id = 1').get();
    const ok = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!ok) return NextResponse.json({ error: 'Current password galat hai.' }, { status: 401 });

    const fields = [];
    const params = [];

    if (newUsername?.trim()) { fields.push('username = ?'); params.push(newUsername.trim()); }
    if (newPassword?.length >= 6) {
      fields.push('password_hash = ?');
      params.push(await bcrypt.hash(newPassword, 12));
    }

    if (!fields.length) return NextResponse.json({ error: 'Kuch change karne ko nahi diya.' }, { status: 400 });

    params.push(1);
    db.prepare(`UPDATE admin SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...params);

    const res = NextResponse.json({ success: true, message: '✅ Credentials change ho gaye! Dobara login karo.' });
    clearAuthCookie(res);
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
