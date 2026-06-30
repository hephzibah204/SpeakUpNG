import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

/**
 * Weekly Political Influence Index: ranks officials/politicians by rating
 * activity (new ratings) in the last 7 days, weighted toward higher-rated profiles.
 */
export async function GET() {
  try {
    const [mostRatedOfficials, mostRatedPoliticians, topRatedOfficials, topRatedPoliticians] = await Promise.all([
      queryAll(`
        SELECT o.id, o.full_name, o.role, o.tier, o.photo_url, o.rating_avg,
          COUNT(r.id) AS recent_ratings
        FROM officials o
        JOIN public_ratings r ON r.official_id = o.id AND r.created_at > NOW() - INTERVAL '7 days'
        GROUP BY o.id, o.full_name, o.role, o.tier, o.photo_url, o.rating_avg
        ORDER BY recent_ratings DESC
        LIMIT 10
      `),
      queryAll(`
        SELECT p.id, p.full_name, p.party, p.aspiration_title, p.photo_url, p.rating_avg,
          COUNT(r.id) AS recent_ratings
        FROM politicians p
        JOIN politician_ratings r ON r.politician_id = p.id AND r.created_at > NOW() - INTERVAL '7 days'
        GROUP BY p.id, p.full_name, p.party, p.aspiration_title, p.photo_url, p.rating_avg
        ORDER BY recent_ratings DESC
        LIMIT 10
      `),
      queryAll(`
        SELECT id, full_name, role, tier, photo_url, rating_avg, rating_count
        FROM officials WHERE rating_count >= 3
        ORDER BY rating_avg DESC LIMIT 10
      `),
      queryAll(`
        SELECT id, full_name, party, aspiration_title, photo_url, rating_avg, rating_count
        FROM politicians WHERE rating_count >= 3
        ORDER BY rating_avg DESC LIMIT 10
      `),
    ]);

    return NextResponse.json({
      most_searched_week: [...mostRatedOfficials, ...mostRatedPoliticians]
        .sort((a: any, b: any) => Number(b.recent_ratings) - Number(a.recent_ratings))
        .slice(0, 10),
      most_trusted: [...topRatedOfficials, ...topRatedPoliticians]
        .sort((a: any, b: any) => Number(b.rating_avg) - Number(a.rating_avg))
        .slice(0, 10),
      generated_at: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('influence-index error:', error);
    return NextResponse.json({ most_searched_week: [], most_trusted: [] });
  }
}
