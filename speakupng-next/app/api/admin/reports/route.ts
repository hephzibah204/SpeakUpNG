import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const reports = await queryAll(`
      SELECT r.*, o.full_name as official_name
      FROM misconduct_reports r
      LEFT JOIN officials o ON r.official_id = o.id
      ORDER BY r.created_at DESC
    `);
    return NextResponse.json({ reports });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
