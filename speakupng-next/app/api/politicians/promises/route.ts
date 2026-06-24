import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const politicianId = searchParams.get('politician_id') || '';
  const officialId = searchParams.get('official_id') || '';

  try {
    const { queryAll } = await import('@/lib/db');
    let results: any[] = [];

    if (politicianId) {
      results = queryAll('SELECT * FROM official_promises WHERE politician_id = ? ORDER BY created_at DESC', [politicianId]);
    } else if (officialId) {
      results = queryAll('SELECT * FROM official_promises WHERE official_id = ? ORDER BY created_at DESC', [officialId]);
    } else {
      results = queryAll('SELECT * FROM official_promises ORDER BY created_at DESC LIMIT 50');
    }

    return NextResponse.json({ promises: results });
  } catch {
    return NextResponse.json({ promises: [] });
  }
}
