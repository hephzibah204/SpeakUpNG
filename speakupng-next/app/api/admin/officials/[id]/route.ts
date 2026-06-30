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
      role,
      tier,
      state,
      party,
      office_start,
      photo_url,
      website,
      profile_bio,
      bio,
      status,
    } = body;

    if (!full_name || !role || !tier) {
      return NextResponse.json({ error: 'Full name, role, and tier are required' }, { status: 400 });
    }

    await queryRun(`
      UPDATE officials
      SET full_name = ?, common_name = ?, role = ?, tier = ?, state = ?, party = ?, office_start = ?, photo_url = ?, website = ?, profile_bio = ?, bio = ?, status = ?
      WHERE id = ?
    `, [
      full_name,
      common_name || null,
      role,
      tier,
      state || null,
      party || null,
      office_start || null,
      photo_url || null,
      website || null,
      profile_bio || null,
      bio || null,
      status || 'active',
      id,
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error updating official:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: any) {
  const params = await context.params;
  const id = params.id as string;

  try {
    // We can either hard delete or set status to inactive. Let's do soft delete.
    await queryRun(`UPDATE officials SET status = 'inactive' WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting official:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
