import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret');
const COOKIE = 'bunny_admin_token';

export async function signToken(payload) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('8h')
    .sign(SECRET);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminFromCookie() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE)?.value;
  if (!token) return null;
  return await verifyToken(token);
}

export function setAuthCookie(res, token) {
  res.cookies.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 8 * 60 * 60,
    path: '/',
  });
}

export function clearAuthCookie(res) {
  res.cookies.set(COOKIE, '', { maxAge: 0, path: '/' });
}

export async function requireAdmin() {
  const admin = await getAdminFromCookie();
  if (!admin) {
    return { error: NextResponse.json({ error: 'Login required.' }, { status: 401 }) };
  }
  return { admin };
}

// Rate limiting (simple in-memory)
const attempts = new Map();

export function checkRateLimit(ip, max = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = ip;
  const record = attempts.get(key) || { count: 0, resetAt: now + windowMs };

  if (now > record.resetAt) {
    record.count = 0;
    record.resetAt = now + windowMs;
  }

  record.count++;
  attempts.set(key, record);

  return record.count <= max;
}
