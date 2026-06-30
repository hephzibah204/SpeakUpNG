import { NextResponse } from 'next/server';
import { checkCredentials, createSessionToken, ADMIN_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    if (!checkCredentials(username, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const token = await createSessionToken(username);
    const res = NextResponse.json({ ok: true, user: { username } });
    res.cookies.set(ADMIN_COOKIE, token, sessionCookieOptions);
    return res;
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
