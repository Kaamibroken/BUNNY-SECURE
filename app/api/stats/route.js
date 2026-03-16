import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = getDb();
  const pages = db.prepare('SELECT COUNT(*) as c FROM pages').get().c;
  const visiblePages = db.prepare('SELECT COUNT(*) as c FROM pages WHERE is_visible=1').get().c;
  const totalApis = db.prepare('SELECT COUNT(*) as c FROM page_apis').get().c;
  const failedLogins = db.prepare("SELECT COUNT(*) as c FROM login_logs WHERE success=0 AND timestamp > datetime('now','-24 hours')").get().c;
  const recentLogins = db.prepare('SELECT * FROM login_logs ORDER BY timestamp DESC LIMIT 15').all();
  const admin = db.prepare('SELECT username, email, updated_at FROM admin WHERE id=1').get();

  return NextResponse.json({ success: true, stats: { pages, visiblePages, totalApis, failedLogins }, recentLogins, admin });
}
