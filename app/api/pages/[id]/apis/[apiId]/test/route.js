import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(req, { params }) {
  try {
    const db = getDb();
    const apiEntry = db.prepare('SELECT * FROM page_apis WHERE id = ? AND page_id = ?').get(params.apiId, params.id);
    if (!apiEntry) return NextResponse.json({ error: 'API nahi mili.' }, { status: 404 });

    const { prompt = 'Hello', extra = {} } = await req.json();

    const headers = { 'Content-Type': 'application/json' };
    if (apiEntry.api_key) {
      headers['Authorization'] = `Bearer ${apiEntry.api_key}`;
      headers['x-api-key'] = apiEntry.api_key;
    }

    // Auto-detect known APIs
    let bodyObj = {};
    try { bodyObj = JSON.parse(apiEntry.body_template || '{}'); } catch {}

    if (apiEntry.api_url.includes('anthropic.com')) {
      bodyObj = { model: 'claude-sonnet-4-20250514', max_tokens: 600, messages: [{ role: 'user', content: prompt }] };
    } else if (apiEntry.api_url.includes('openai.com')) {
      bodyObj = { model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: prompt }] };
    } else {
      // Replace {{input}} placeholder in body template
      const bodyStr = JSON.stringify(bodyObj).replace(/\{\{input\}\}/g, prompt);
      try { bodyObj = JSON.parse(bodyStr); } catch {}
      bodyObj = { ...bodyObj, prompt, query: prompt, q: prompt, ...extra };
    }

    const fetchOptions = { method: apiEntry.method, headers };
    if (!['GET', 'HEAD'].includes(apiEntry.method)) fetchOptions.body = JSON.stringify(bodyObj);

    const response = await fetch(apiEntry.api_url, fetchOptions);
    const data = await response.json();

    // Extract readable result
    let result = data;
    if (apiEntry.api_url.includes('anthropic.com') && data.content)
      result = data.content[0]?.text || JSON.stringify(data, null, 2);
    else if (apiEntry.api_url.includes('openai.com') && data.choices)
      result = data.choices[0]?.message?.content || JSON.stringify(data, null, 2);

    return NextResponse.json({ success: true, result, status: response.status });
  } catch (e) {
    return NextResponse.json({ error: `API call failed: ${e.message}` }, { status: 500 });
  }
}
