import { NextResponse } from 'next/server';
import { queryFirst } from '@/lib/db';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const slug = decodeURIComponent(params.slug || '');

  if (!slug) {
    return NextResponse.json({ error: 'Missing politician ID' }, { status: 400 });
  }

  try {
    // Support both formats: "slug-name--uuid" and clean "name-slug"
    const parts = slug.split('--');
    const possibleId = parts.length > 1 ? parts[parts.length - 1] : null;
    const nameSlug = parts[0];

    const namePattern = '%' + nameSlug.replace(/-/g, '%') + '%';

    let politician;

    const baseQuery = `
      SELECT p.*, 
        r.accountability_avg, r.service_avg, r.transparency_avg, r.responsiveness_avg, 
        r.power_avg, r.security_avg, r.economic_stability_avg, r.education_avg, r.healthcare_avg
      FROM politicians p
      LEFT JOIN politician_rating_agg r ON p.id = r.politician_id
    `;

    // 1. Try matching by exact ID after '--'
    if (possibleId) {
      politician = await queryFirst(
        `${baseQuery} WHERE p.id = ?`,
        [possibleId]
      );
    }

    // 2. Try matching by exact slug as ID
    if (!politician) {
      politician = await queryFirst(
        `${baseQuery} WHERE p.id = ?`,
        [slug]
      );
    }

    // 3. Try matching loosely by name pattern
    if (!politician) {
      politician = await queryFirst(
        `${baseQuery} WHERE LOWER(p.full_name) LIKE LOWER(?) OR LOWER(p.common_name) LIKE LOWER(?)`,
        [namePattern, namePattern]
      );
    }

    if (!politician) {
      return NextResponse.json({ error: 'Politician not found' }, { status: 404 });
    }

    return NextResponse.json({ politician });
  } catch (error) {
    console.error('Error fetching politician:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
