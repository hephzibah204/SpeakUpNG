import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

// Supported datasets and formats
const DATASETS = ['officials', 'ratings_summary', 'promises', 'historical_elections', 'candidates'] as const;
type Dataset = typeof DATASETS[number];

const QUERIES: Record<Dataset, string> = {
  officials: `
    SELECT id, full_name, role, tier, state, party, rating_avg, rating_count,
           accountability_avg, service_avg, transparency_avg, responsiveness_avg,
           power_avg, security_avg, economic_stability_avg, education_avg, healthcare_avg
    FROM officials
    ORDER BY rating_avg DESC NULLS LAST
  `,
  ratings_summary: `
    SELECT r.official_id, o.full_name, o.role, o.state,
           r.accountability, r.service_delivery, r.transparency,
           r.responsiveness, r.power_management, r.security,
           r.economic_stability, r.education, r.healthcare,
           r.created_at
    FROM ratings r
    JOIN officials o ON r.official_id = o.id
    ORDER BY r.created_at DESC
    LIMIT 5000
  `,
  promises: `
    SELECT mp.id, mp.title, mp.description, mp.status, mp.progress_percent,
           mp.source_url, mp.due_date,
           COALESCE(p.full_name, o.full_name) as politician_name,
           mp.created_at
    FROM mandate_promises mp
    LEFT JOIN politicians p ON mp.politician_id = p.id
    LEFT JOIN officials o ON mp.official_id = o.id
    ORDER BY mp.created_at DESC
  `,
  historical_elections: `
    SELECT year, election_type, candidate_name, party, votes, vote_share_percent,
           position, state, source_url
    FROM historical_elections
    ORDER BY year DESC, votes DESC NULLS LAST
  `,
  candidates: `
    SELECT id, full_name, party, position, election_type, election_year,
           state, running_mate, status, source_url, cleared_at
    FROM election_candidates
    ORDER BY election_year DESC, party ASC
  `,
};

function toCSV(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(','),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];
  return lines.join('\n');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataset = (searchParams.get('dataset') || 'officials') as Dataset;
  const format = searchParams.get('format') || 'json';

  if (!DATASETS.includes(dataset)) {
    return NextResponse.json(
      { error: `Invalid dataset. Choose one of: ${DATASETS.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const rows = await queryAll(QUERIES[dataset]);

    if (format === 'csv') {
      const csv = toCSV(rows as Record<string, unknown>[]);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="evoteng-${dataset}-${new Date().toISOString().slice(0, 10)}.csv"`,
          'Cache-Control': 'public, s-maxage=3600',
        },
      });
    }

    return NextResponse.json(
      {
        dataset,
        generated_at: new Date().toISOString(),
        count: rows.length,
        data: rows,
        attribution: 'evote.ng open data — citizen-generated ratings. Not an official government dataset.',
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600',
          'Content-Disposition': `attachment; filename="evoteng-${dataset}-${new Date().toISOString().slice(0, 10)}.json"`,
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
