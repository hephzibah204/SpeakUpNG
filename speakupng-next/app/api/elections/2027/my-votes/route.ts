import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceHash = searchParams.get('device_hash');

    if (!deviceHash) {
      return NextResponse.json({ votes: {} });
    }

    // 1. Presidential vote
    const presVote = await queryFirst<{ candidate_name: string; party: string }>(
      `SELECT candidate_name, party FROM mock_votes_2027 WHERE device_hash = ? LIMIT 1`,
      [deviceHash]
    );

    // 2. Governorship votes (keyed by state)
    const govVotes = await queryAll<{ state: string; candidate_name: string; party: string }>(
      `SELECT state, candidate_name, party FROM mock_governorship_votes_2027 WHERE device_hash = ?`,
      [deviceHash]
    );

    // 3. Senate votes (keyed by district)
    const senateVotes = await queryAll<{ district: string; candidate_name: string; party: string }>(
      `SELECT district, candidate_name, party FROM mock_senate_votes_2027 WHERE device_hash = ?`,
      [deviceHash]
    );

    // 4. House of Reps votes (keyed by district)
    const repsVotes = await queryAll<{ district: string; candidate_name: string; party: string }>(
      `SELECT district, candidate_name, party FROM mock_reps_votes_2027 WHERE device_hash = ?`,
      [deviceHash]
    );

    // 5. State Assembly votes (keyed by district)
    const assemblyVotes = await queryAll<{ district: string; candidate_name: string; party: string }>(
      `SELECT district, candidate_name, party FROM mock_assembly_votes_2027 WHERE device_hash = ?`,
      [deviceHash]
    );

    // 6. LGA Chairmanship votes (keyed by district)
    const lgaVotes = await queryAll<{ district: string; candidate_name: string; party: string }>(
      `SELECT district, candidate_name, party FROM mock_lga_votes_2027 WHERE device_hash = ?`,
      [deviceHash]
    );

    const govMap: Record<string, { candidate_name: string; party: string }> = {};
    for (const row of govVotes) {
      govMap[row.state] = { candidate_name: row.candidate_name, party: row.party };
    }

    const senateMap: Record<string, { candidate_name: string; party: string }> = {};
    for (const row of senateVotes) {
      senateMap[row.district] = { candidate_name: row.candidate_name, party: row.party };
    }

    const repsMap: Record<string, { candidate_name: string; party: string }> = {};
    for (const row of repsVotes) {
      repsMap[row.district] = { candidate_name: row.candidate_name, party: row.party };
    }

    const assemblyMap: Record<string, { candidate_name: string; party: string }> = {};
    for (const row of assemblyVotes) {
      assemblyMap[row.district] = { candidate_name: row.candidate_name, party: row.party };
    }

    const lgaMap: Record<string, { candidate_name: string; party: string }> = {};
    for (const row of lgaVotes) {
      lgaMap[row.district] = { candidate_name: row.candidate_name, party: row.party };
    }

    return NextResponse.json({
      votes: {
        presidential: presVote ? { candidate_name: presVote.candidate_name, party: presVote.party } : null,
        governorship: govMap,
        senate: senateMap,
        reps: repsMap,
        assembly: assemblyMap,
        lga: lgaMap,
      },
    });
  } catch (error: any) {
    console.error('Fetch my-votes error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
