import { NextResponse } from 'next/server';
import { createPool } from '@vercel/postgres';

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const state = searchParams.get('state');
  const lga = searchParams.get('lga');

  if (!state) {
    return NextResponse.json({ error: 'State parameter is required' }, { status: 400 });
  }

  try {
    // 1. Fetch Governor (State Executive)
    const governorRes = await sql.query(
      `SELECT id, full_name, role, tier, state, rating_avg, rating_count, photo_url, bio 
       FROM officials 
       WHERE LOWER(state) = LOWER($1) AND (LOWER(role) = 'governor' OR LOWER(role) LIKE '%governor%')
       LIMIT 1`,
      [state]
    );

    // 2. Fetch Senators (Senate Legislature)
    const senatorsRes = await sql.query(
      `SELECT id, full_name, role, tier, state, rating_avg, rating_count, photo_url, bio 
       FROM officials 
       WHERE LOWER(state) = LOWER($1) AND (LOWER(role) LIKE '%senator%' OR LOWER(role) LIKE '%senate%')
       ORDER BY rating_avg DESC`,
      [state]
    );

    // 3. Fetch House of Representatives members
    const repsRes = await sql.query(
      `SELECT id, full_name, role, tier, state, rating_avg, rating_count, photo_url, bio 
       FROM officials 
       WHERE LOWER(state) = LOWER($1) AND (LOWER(role) LIKE '%representative%' OR LOWER(role) LIKE '%house%')
       ORDER BY rating_avg DESC LIMIT 15`,
      [state]
    );

    return NextResponse.json({
      governor: governorRes.rows[0] || null,
      senators: senatorsRes.rows,
      representatives: repsRes.rows,
    });
  } catch (err: any) {
    console.error('Error looking up representatives:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
