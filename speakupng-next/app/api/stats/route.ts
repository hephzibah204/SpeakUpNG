import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export async function GET() {
  try {
    const [ratingsResult, officialsResult] = await Promise.all([
      queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM public_ratings'),
      queryFirst<{ count: number }>('SELECT COUNT(*) as count FROM officials WHERE status = ?', ['active']),
    ]);

    return NextResponse.json({
      ratings: ratingsResult?.count || 0,
      officials: officialsResult?.count || 0,
    });
  } catch {
    return NextResponse.json({ ratings: 0, officials: 0 });
  }
}