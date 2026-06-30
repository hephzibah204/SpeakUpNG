import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const polls = await queryAll(
      `SELECT * FROM polls WHERE status = 'active' ORDER BY created_at DESC`
    );
    
    // Parse the JSON options for each poll if it's a string
    const parsedPolls = polls.map((poll: any) => ({
      ...poll,
      options: typeof poll.options === 'string' ? JSON.parse(poll.options) : (poll.options || [])
    }));

    return NextResponse.json({ polls: parsedPolls });
  } catch (error) {
    console.error('Error fetching polls:', error);
    return NextResponse.json({ polls: [] }, { status: 500 });
  }
}
