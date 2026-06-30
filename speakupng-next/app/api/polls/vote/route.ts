import { NextResponse } from 'next/server';
import { execute } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { poll_id, anon_id, option_index } = await request.json();

    if (!poll_id || !anon_id || typeof option_index !== 'number') {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    // Insert vote record
    await execute(
      `INSERT INTO poll_votes (id, poll_id, anon_id, option_index) VALUES (?, ?, ?, ?)`,
      [crypto.randomUUID(), poll_id, anon_id, option_index]
    );

    // Update the specific option vote count in the JSON array
    // Note: total_votes is updated by the trigger we created in 003_add_polls.sql
    await execute(
      `UPDATE polls 
       SET options = jsonb_set(
         options::jsonb, 
         array[?::text, 'votes'], 
         (COALESCE((options::jsonb #> array[?::text, 'votes'])::text::int, 0) + 1)::text::jsonb
       )
       WHERE id = ?`,
      [option_index, option_index, poll_id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE') || error.message?.includes('Constraint')) {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 });
    }
    console.error('Error submitting vote:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
