import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET all visible pages (public)
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const all = searchParams.get('all');

  const db = getDb();

  if (all) {
    const { error } = await requireAdmin();
    if (error) return error;
    const pages = db.prepare('SELECT * FROM pages ORDER BY sort_order ASC, id ASC').all();
    return NextResponse.json({ success: true, pages });
  }

  const pages = db.prepare(
    'SELECT id, title, slug, description, emoji, color, sort_order FROM pages WHERE is_visible = 1 ORDER BY sort_order ASC, id ASC'
  ).all();
  return NextResponse.json({ success: true, pages });
}

// POST create page (admin)
export async function POST(req) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const { title, slug, description = '', emoji = '📦', color = '#ff0000', sort_order = 0 } = await req.json();

    if (!title || !slug)
      return NextResponse.json({ error: 'Title aur slug dalo.' }, { status: 400 });

    const cleanSlug = slug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const db = getDb();

    const exists = db.prepare('SELECT id FROM pages WHERE slug = ?').get(cleanSlug);
    if (exists) return NextResponse.json({ error: 'Ye slug pehle se hai. Dusra likho.' }, { status: 409 });

    const result = db.prepare(
      'INSERT INTO pages (title, slug, description, emoji, color, sort_order) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(title, cleanSlug, description, emoji, color, sort_order);

    const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json({ success: true, page }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
