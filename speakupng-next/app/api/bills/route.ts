import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const bills = await queryAll(
      `SELECT b.*, o.full_name as sponsor_name, o.role as sponsor_role
       FROM bills b
       LEFT JOIN officials o ON b.sponsor_id = o.id
       ORDER BY b.date_introduced DESC`
    );
    return NextResponse.json({ bills });
  } catch (error: any) {
    console.error('Bills API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
