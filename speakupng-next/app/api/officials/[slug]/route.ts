import { NextResponse } from 'next/server';
import { queryAll, queryFirst } from '@/lib/db';

export async function GET(request: Request, context: any) {
  const params = await context.params;
  const slug = decodeURIComponent(params.slug || '');

  if (!slug) {
    return NextResponse.json({ error: 'Missing official ID' }, { status: 400 });
  }

  try {
    // Support both old format "name--uuid" and new clean format "name-slug"
    const parts = slug.split('--');
    const possibleId = parts.length > 1 ? parts[parts.length - 1] : null;
    const nameSlug = parts[0];

    const namePattern = '%' + nameSlug.replace(/-/g, '%') + '%';

    let official;

    const baseQuery = `
      SELECT o.*, 
        r.accountability_avg, r.service_avg, r.transparency_avg, r.responsiveness_avg, 
        r.power_avg, r.security_avg, r.economic_stability_avg, r.education_avg, r.healthcare_avg
      FROM officials o
      LEFT JOIN official_rating_agg r ON o.id = r.official_id
    `;

    // First try exact ID match (old URLs with --uuid)
    if (possibleId) {
      official = await queryFirst(
        `${baseQuery} WHERE o.id = ?`,
        [possibleId]
      );
    }

    // Then try exact slug as ID
    if (!official) {
      official = await queryFirst(
        `${baseQuery} WHERE o.id = ?`,
        [slug]
      );
    }

    // Then try matching by name pattern (new clean URLs)
    if (!official) {
      official = await queryFirst(
        `${baseQuery} WHERE LOWER(o.full_name) LIKE LOWER(?) AND o.status = 'active'`,
        [namePattern]
      );
    }

    if (!official) {
      return NextResponse.json({ error: 'Official not found' }, { status: 404 });
    }

    // Fetch enriched profile details
    const career = await queryAll(
      `SELECT * FROM official_career_history WHERE official_id = ? ORDER BY start_year DESC`,
      [official.id]
    );

    const education = await queryAll(
      `SELECT * FROM official_education WHERE official_id = ? ORDER BY year DESC`,
      [official.id]
    );

    const achievements = await queryAll(
      `SELECT * FROM official_achievements WHERE official_id = ? ORDER BY year DESC`,
      [official.id]
    );

    return NextResponse.json({
      official,
      career,
      education,
      achievements
    });
  } catch (error) {
    console.error('Error fetching official:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
