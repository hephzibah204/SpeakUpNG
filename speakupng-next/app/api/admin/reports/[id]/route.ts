import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  try {
    const body = await request.json();
    const { status } = body; // e.g. 'reviewed', 'dismissed', 'pending'

    await queryRun('UPDATE misconduct_reports SET status = ? WHERE id = ?', [status, id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  try {
    await queryRun('DELETE FROM misconduct_reports WHERE id = ?', [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
