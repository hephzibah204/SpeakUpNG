import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    // 1. Get total votes per candidate
    const totalVotes = await queryAll(`
      SELECT candidate_name, party, COUNT(*) as vote_count
      FROM mock_votes_2027
      GROUP BY candidate_name, party
      ORDER BY vote_count DESC
    `);

    // 2. Get regional breakdowns
    const regionalBreakdowns = await queryAll(`
      SELECT voter_region, candidate_name, COUNT(*) as vote_count
      FROM mock_votes_2027
      GROUP BY voter_region, candidate_name
    `);

    return NextResponse.json({ totalVotes, regionalBreakdowns });
  } catch (error: any) {
    console.error('2027 API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidate_name, party, voter_region } = body;

    if (!candidate_name || !party || !voter_region) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO mock_votes_2027 (id, candidate_name, party, voter_region)
       VALUES (?, ?, ?, ?)`,
      [id, candidate_name, party, voter_region]
    );

    return NextResponse.json({ success: true, voteId: id });
  } catch (error: any) {
    console.error('Cast mock vote error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
