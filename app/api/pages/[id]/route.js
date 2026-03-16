import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { requireAdmin } from '@/lib/auth';

// GET page by slug (public)
export async function GET(req, { params }) {
  const db = getDb();
  // Try as slug first, then id
  const page = db.prepare('SELECT * FROM pages WHERE slug = ? AND is_visible = 1').get(params.id)
    || db.prepare('SELECT * FROM pages WHERE id = ? AND is_visible = 1').get(params.id);

  if (!page) return NextResponse.json({ error: 'Page nahi mila.' }, { status: 404 });

  const apis = db.prepare(
    'SELECT id, api_name, api_url, method, body_template, display_type, sort_order FROM page_apis WHERE page_id = ? ORDER BY sort_order ASC'
  ).all(page.id);

  return NextResponse.json({ success: true, page, apis });
}

// PUT update page (admin)
export async function PUT(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const db = getDb();
    const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(params.id);
    if (!page) return NextResponse.json({ error: 'Page nahi mila.' }, { status: 404 });

    const { title, description, emoji, color, is_visible, sort_order } = body;
    db.prepare(`UPDATE pages SET
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      emoji = COALESCE(?, emoji),
      color = COALESCE(?, color),
      is_visible = COALESCE(?, is_visible),
      sort_order = COALESCE(?, sort_order)
      WHERE id = ?`
    ).run(title, description, emoji, color, is_visible, sort_order, params.id);

    return NextResponse.json({ success: true, page: db.prepare('SELECT * FROM pages WHERE id = ?').get(params.id) });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE page (admin)
export async function DELETE(req, { params }) {
  const { error } = await requireAdmin();
  if (error) return error;

  const db = getDb();
  const page = db.prepare('SELECT * FROM pages WHERE id = ?').get(params.id);
  if (!page) return NextResponse.json({ error: 'Page nahi mila.' }, { status: 404 });

  db.prepare('DELETE FROM pages WHERE id = ?').run(params.id);
  return NextResponse.json({ success: true, message: 'Page delete ho gaya.' });
}
