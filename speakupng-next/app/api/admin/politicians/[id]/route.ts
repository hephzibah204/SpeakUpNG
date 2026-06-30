import { NextResponse } from 'next/server';
import { queryRun } from '@/lib/db';

export async function PUT(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  try {
    const body = await request.json();
    const {
      full_name,
      common_name,
      party,
      aspiration_title,
      photo_url,
      profile_bio,
      bio,
      status,
    } = body;

    if (!full_name || !party) {
      return NextResponse.json({ error: 'Full name and party are required' }, { status: 400 });
    }

    await queryRun(`
      UPDATE politicians
      SET full_name = ?, common_name = ?, party = ?, aspiration_title = ?, photo_url = ?, profile_bio = ?, bio = ?, status = ?
      WHERE id = ?
    `, [
      full_name,
      common_name || null,
      party,
      aspiration_title || null,
      photo_url || null,
      profile_bio || null,
      bio || null,
      status || 'active',
      id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating politician:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  try {
    await queryRun(`UPDATE politicians SET status = 'inactive' WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting politician:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
