import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export const revalidate = 0; // Disable cache for live stats

export async function GET() {
  try {
    const baselines = await queryAll(`
      SELECT 
        zone_name as name, 
        apc_base as apc, 
        ndc_base as ndc, 
        pdp_base as pdp, 
        electoral_weight as weight 
      FROM prediction_baselines
      ORDER BY electoral_weight DESC
    `);

    if (!baselines || baselines.length === 0) {
      // Return hardcoded fallback if db is empty so it doesn't break
      return NextResponse.json({
        baselines: [
          { name: 'North West', apc: 50, ndc: 35, pdp: 15, weight: 0.24 },
          { name: 'South West', apc: 55, ndc: 35, pdp: 10, weight: 0.19 },
          { name: 'South South', apc: 20, ndc: 55, pdp: 25, weight: 0.15 },
          { name: 'North East', apc: 45, ndc: 20, pdp: 35, weight: 0.14 },
          { name: 'North Central', apc: 40, ndc: 35, pdp: 25, weight: 0.14 },
          { name: 'South East', apc: 10, ndc: 80, pdp: 10, weight: 0.14 }
        ]
      });
    }

    return NextResponse.json({ baselines });
  } catch (err) {
    console.error('Error fetching prediction baselines:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
