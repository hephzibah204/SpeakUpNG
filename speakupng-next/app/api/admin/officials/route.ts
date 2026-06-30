import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      full_name,
      common_name,
      role,
      tier,
      state,
      party,
      office_start,
      photo_url,
      website,
      profile_bio,
      bio,
    } = body;

    if (!full_name || !role || !tier) {
      return NextResponse.json({ error: 'Full name, role, and tier are required' }, { status: 400 });
    }

    const id = randomUUID();
    await queryRun(`
      INSERT INTO officials (id, full_name, common_name, role, tier, state, party, office_start, photo_url, website, profile_bio, bio, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `, [
      id,
      full_name,
      common_name || null,
      role,
      tier,
      state || null,
      party || null,
      office_start || null,
      photo_url || null,
      website || null,
      profile_bio || null,
      bio || null,
    ]);

    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error creating official:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
