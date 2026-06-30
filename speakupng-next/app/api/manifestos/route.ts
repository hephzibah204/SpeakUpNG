import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const manifestos = await queryAll(
      `SELECT m.*, 
              COALESCE(p.full_name, o.full_name) as politician_name, 
              COALESCE(p.party, 'APC') as party 
       FROM official_manifestos m
       LEFT JOIN politicians p ON m.politician_id = p.id
       LEFT JOIN officials o ON m.official_id = o.id
       ORDER BY m.created_at DESC`
    );
    return NextResponse.json({ manifestos });
  } catch (error: any) {
    console.error('Manifestos API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
