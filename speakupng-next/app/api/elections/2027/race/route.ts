import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';
import { randomUUID } from 'crypto';

const TABLE_MAP: Record<string, string> = {
  senate: 'mock_senate_votes_2027',
  reps: 'mock_reps_votes_2027',
  assembly: 'mock_assembly_votes_2027',
  lga: 'mock_lga_votes_2027',
  governorship: 'mock_governorship_votes_2027',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = (searchParams.get('type') || 'senate').toLowerCase();
    const tableName = TABLE_MAP[type];

    if (!tableName) {
      return NextResponse.json({ error: 'Invalid race type' }, { status: 400 });
    }

    if (type === 'governorship') {
      const totalVotes = await queryAll(`
        SELECT candidate_name, party, state, COUNT(*) as vote_count
        FROM ${tableName}
        GROUP BY candidate_name, party, state
        ORDER BY state ASC, vote_count DESC
      `);
      return NextResponse.json({ totalVotes });
    }

    const totalVotes = await queryAll(`
      SELECT candidate_name, party, state, district, COUNT(*) as vote_count
      FROM ${tableName}
      GROUP BY candidate_name, party, state, district
      ORDER BY state ASC, district ASC, vote_count DESC
    `);

    return NextResponse.json({ totalVotes });
  } catch (error: any) {
    console.error('Race votes API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, candidate_name, party, state, district, device_hash } = body;
    const raceType = (type || 'senate').toLowerCase();
    const tableName = TABLE_MAP[raceType];

    if (!tableName) {
      return NextResponse.json({ error: 'Invalid race type' }, { status: 400 });
    }

    if (!candidate_name || !party || !state) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const id = randomUUID();

    if (raceType === 'governorship') {
      if (device_hash) {
        await execute(
          `INSERT INTO ${tableName} (id, candidate_name, party, state, device_hash, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW())
           ON CONFLICT (device_hash, state)
           DO UPDATE SET
             candidate_name = EXCLUDED.candidate_name,
             party = EXCLUDED.party,
             updated_at = NOW()`,
          [id, candidate_name, party, state, device_hash]
        );
      } else {
        await execute(
          `INSERT INTO ${tableName} (id, candidate_name, party, state)
           VALUES (?, ?, ?, ?)`,
          [id, candidate_name, party, state]
        );
      }
    } else {
      const dist = district || 'General';
      if (device_hash) {
        await execute(
          `INSERT INTO ${tableName} (id, candidate_name, party, state, district, device_hash, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())
           ON CONFLICT (device_hash, district)
           DO UPDATE SET
             candidate_name = EXCLUDED.candidate_name,
             party = EXCLUDED.party,
             state = EXCLUDED.state,
             updated_at = NOW()`,
          [id, candidate_name, party, state, dist, device_hash]
        );
      } else {
        await execute(
          `INSERT INTO ${tableName} (id, candidate_name, party, state, district)
           VALUES (?, ?, ?, ?, ?)`,
          [id, candidate_name, party, state, dist]
        );
      }
    }

    return NextResponse.json({ success: true, voteId: id, verifiedDevice: Boolean(device_hash) });
  } catch (error: any) {
    console.error('Cast mock race vote error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
