import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'official';

  try {
    const table = type === 'politician' ? 'politician_ratings' : 'public_ratings';
    await queryRun(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
