import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

function jsonToCSV(array: any[]) {
  if (!array || array.length === 0) return '';
  const headers = Object.keys(array[0]);
  const csvRows = [headers.join(',')];

  for (const row of array) {
    const values = headers.map(header => {
      const val = row[header];
      const escaped = ('' + (val ?? '')).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dataset = searchParams.get('dataset');
    const format = (searchParams.get('format') || 'json').toLowerCase();

    if (!dataset) {
      return NextResponse.json({ error: 'Missing dataset parameter' }, { status: 400 });
    }

    let data: any[] = [];
    let filename = 'dataset';

    switch (dataset) {
      case 'presidential-polling-2027':
      case '2027 Presidential Polling Data':
        data = await queryAll('SELECT id, candidate_name, party, voter_region, created_at FROM mock_votes_2027 ORDER BY created_at DESC');
        filename = '2027_presidential_polling_data';
        break;
      case 'governorship-candidates-2027':
      case 'State-by-State Governorship Candidates':
        data = await queryAll(`
          SELECT id, election_year, election_type, state, candidate_name, party, party_code, status, source_url, cleared_at, created_at
          FROM election_candidates
          WHERE election_year = 2027 AND election_type = 'governorship'
          ORDER BY state ASC, candidate_name ASC
        `);
        filename = 'state_by_state_governorship_candidates_2027';
        break;
      case 'citizen-project-verifications':
      case 'Citizen Project Verifications':
        data = await queryAll(`
          SELECT id, project_id, status, comment, device_hash, created_at
          FROM project_verifications
          ORDER BY created_at DESC
        `);
        filename = 'citizen_project_verifications';
        break;
      default:
        return NextResponse.json({ error: 'Invalid or unknown dataset parameter' }, { status: 400 });
    }

    if (format === 'csv') {
      const csvData = jsonToCSV(data);
      return new Response(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}.csv"`,
        },
      });
    }

    // Default to JSON
    return NextResponse.json(data, {
      headers: {
        'Content-Disposition': `attachment; filename="${filename}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Download dataset API error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
