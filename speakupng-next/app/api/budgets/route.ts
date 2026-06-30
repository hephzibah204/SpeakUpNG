import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    const budgets = await queryAll(
      `SELECT * FROM budget_allocations ORDER BY year DESC, amount_allocated DESC`
    );
    return NextResponse.json({ budgets });
  } catch (error: any) {
    console.error('Budgets API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
