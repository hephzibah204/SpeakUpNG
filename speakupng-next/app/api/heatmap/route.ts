import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

const REGION_TO_CODE: Record<string, string> = {
  'North West': 'nw',
  'North East': 'ne',
  'North Central': 'nc',
  'South West': 'sw',
  'South East': 'se',
  'South South': 'ss',
};

const ZONE_NAMES: Record<string, string> = {
  nw: 'North West',
  ne: 'North East',
  nc: 'North Central',
  sw: 'South West',
  se: 'South East',
  ss: 'South South',
};

/**
 * Builds a zone-by-zone view from real citizen ratings only. No party
 * affiliation or "strength" is guessed/fabricated — strength is the
 * zone's average citizen rating (0-100), and candidates shown are real
 * top-rated officials in that zone (politicians carry their actual party).
 */
export async function GET() {
  try {
    const officials = await queryAll<any>(`
      SELECT o.id, o.full_name, o.role, o.state, o.rating_avg, o.rating_count, s.region
      FROM officials o
      JOIN states s ON o.state = s.name
      WHERE o.rating_avg > 0
    `);

    const states = await queryAll<any>('SELECT name, region FROM states');

    const zones: Record<string, any> = {};
    for (const code of Object.keys(ZONE_NAMES)) {
      zones[code] = { name: ZONE_NAMES[code], states: [], candidates: [], strength: null };
    }

    for (const st of states) {
      const code = REGION_TO_CODE[st.region];
      if (code && !zones[code].states.includes(st.name)) zones[code].states.push(st.name);
    }

    const zoneRatings: Record<string, number[]> = {};
    for (const o of officials) {
      const code = REGION_TO_CODE[o.region];
      if (!code) continue;
      zoneRatings[code] = zoneRatings[code] || [];
      zoneRatings[code].push(Number(o.rating_avg));
      zones[code].candidates.push({
        name: o.full_name,
        role: o.role,
        rating: Math.round((Number(o.rating_avg) / 5) * 100),
      });
    }

    for (const code of Object.keys(zones)) {
      zones[code].candidates.sort((a: any, b: any) => b.rating - a.rating);
      zones[code].candidates = zones[code].candidates.slice(0, 3);
      const ratings = zoneRatings[code];
      zones[code].strength = ratings?.length
        ? `${Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length / 5) * 100)}%`
        : null;
    }

    return NextResponse.json({ zones });
  } catch (error: any) {
    console.error('Heatmap API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
