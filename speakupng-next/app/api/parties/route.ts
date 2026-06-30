import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const parties = await queryAll('SELECT * FROM political_parties ORDER BY name ASC');
    return NextResponse.json({ parties });
  } catch (error: any) {
    console.error('Parties API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
