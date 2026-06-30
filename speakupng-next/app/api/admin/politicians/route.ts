import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      common_name,
      party,
      aspiration_title,
      photo_url,
      profile_bio,
      bio,
    } = body;

    if (!full_name || !party) {
      return NextResponse.json({ error: 'Full name and party are required' }, { status: 400 });
    }

    const id = randomUUID();
    await queryRun(`
      INSERT INTO politicians (id, full_name, common_name, party, aspiration_title, photo_url, profile_bio, bio, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      id,
      full_name,
      common_name || null,
      party,
      aspiration_title || null,
      photo_url || null,
      profile_bio || null,
      bio || null,
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating politician:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
