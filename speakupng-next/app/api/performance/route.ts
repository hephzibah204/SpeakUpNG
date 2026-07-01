import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

/**
 * Government Performance is derived strictly from real citizen ratings
 * (officials.*_avg columns, computed from public_ratings) — no fabricated
 * or placeholder scores. Officials with zero ratings are excluded since
 * there is no real data to show for them.
 */
export async function GET() {
  try {
    const officials = await queryAll<any>(`
      SELECT id, full_name, role, state, tier, photo_url,
        accountability_avg, service_avg, transparency_avg, responsiveness_avg,
        power_avg, security_avg, economic_stability_avg, education_avg, healthcare_avg,
        rating_avg, rating_count
      FROM officials
      WHERE rating_count > 0
      ORDER BY rating_avg DESC
    `);

    const performance = officials.map(o => ({
      id: o.id,
      official_name: o.full_name,
      role: o.role,
      state: o.state,
      photo_url: o.photo_url,
      tier: o.tier,
      rating_count: o.rating_count,
      overall_score: o.rating_avg ? Math.round((Number(o.rating_avg) / 5) * 100) : null,
      categories: {
        accountability: o.accountability_avg ? Math.round((Number(o.accountability_avg) / 5) * 100) : null,
        service: o.service_avg ? Math.round((Number(o.service_avg) / 5) * 100) : null,
        transparency: o.transparency_avg ? Math.round((Number(o.transparency_avg) / 5) * 100) : null,
        responsiveness: o.responsiveness_avg ? Math.round((Number(o.responsiveness_avg) / 5) * 100) : null,
        power: o.power_avg ? Math.round((Number(o.power_avg) / 5) * 100) : null,
        security: o.security_avg ? Math.round((Number(o.security_avg) / 5) * 100) : null,
        economic_stability: o.economic_stability_avg ? Math.round((Number(o.economic_stability_avg) / 5) * 100) : null,
        education: o.education_avg ? Math.round((Number(o.education_avg) / 5) * 100) : null,
        healthcare: o.healthcare_avg ? Math.round((Number(o.healthcare_avg) / 5) * 100) : null,
      },
    }));

    return NextResponse.json({ performance });
  } catch (error: any) {
    console.error('Performance API Error:', error);
    return NextResponse.json({ performance: [] });
  }
}
