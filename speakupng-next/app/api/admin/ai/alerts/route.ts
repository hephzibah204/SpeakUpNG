import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const alerts = await queryAll(`
      SELECT id, official_name, old_role, new_role, tier, state_code, party, change_type, change_date, source, headline, confidence, created_at as detected_at
      FROM news_alerts
      ORDER BY created_at DESC LIMIT 20
    `);
    return NextResponse.json({ alerts });
  } catch (error: any) {
    console.error('Error fetching news alerts:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
