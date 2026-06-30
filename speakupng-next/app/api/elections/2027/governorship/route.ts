import { NextResponse } from 'next/server';
import { queryAll, execute } from '@/lib/db';
import { randomUUID } from 'crypto';

export async function GET() {
  try {
    const totalVotes = await queryAll(`
      SELECT candidate_name, party, state, COUNT(*) as vote_count
      FROM mock_governorship_votes_2027
      GROUP BY candidate_name, party, state
      ORDER BY state ASC, vote_count DESC
    `);
    return NextResponse.json({ totalVotes });
  } catch (error: any) {
    console.error('Governorship API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidate_name, party, state } = body;

    if (!candidate_name || !party || !state) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const id = randomUUID();
    await execute(
      `INSERT INTO mock_governorship_votes_2027 (id, candidate_name, party, state)
       VALUES (?, ?, ?, ?)`,
      [id, candidate_name, party, state]
    );

    return NextResponse.json({ success: true, voteId: id });
  } catch (error: any) {
    console.error('Cast mock governorship vote error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
