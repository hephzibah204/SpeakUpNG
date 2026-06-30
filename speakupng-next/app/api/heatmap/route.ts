import { NextResponse } from 'next/server';
import { queryAll } from '@/lib/db';

export async function GET() {
  try {
    // Get all officials joined with their state region
    const officials = await queryAll(`
      SELECT o.id, o.full_name, o.role, o.state, o.rating_avg, o.rating_count, s.region
      FROM officials o
      JOIN states s ON o.state = s.name
      WHERE o.rating_avg > 0
    `);

    // Map region names to zone codes
    const regionToCode: Record<string, string> = {
      'North West': 'nw',
      'North East': 'ne',
      'North Central': 'nc',
      'South West': 'sw',
      'South East': 'se',
      'South South': 'ss'
    };

    // Initialize zones structure
    const zones: Record<string, any> = {
      nw: { name: 'North West', party: 'APC', strength: '65%', states: [], candidates: [] },
      ne: { name: 'North East', party: 'APC', strength: '58%', states: [], candidates: [] },
      nc: { name: 'North Central', party: 'APC', strength: '50%', states: [], candidates: [] },
      sw: { name: 'South West', party: 'APC', strength: '78%', states: [], candidates: [] },
      se: { name: 'South East', party: 'LP', strength: '84%', states: [], candidates: [] },
      ss: { name: 'South South', party: 'PDP', strength: '62%', states: [], candidates: [] }
    };

    // Populate states
    const states = await queryAll('SELECT name, region FROM states');
    states.forEach((st: any) => {
      const code = regionToCode[st.region];
      if (code && !zones[code].states.includes(st.name)) {
        zones[code].states.push(st.name);
      }
    });

    // Populate candidates from DB
    officials.forEach((o: any) => {
      const code = regionToCode[o.region];
      if (code) {
        // Guess party based on role/description or default
        let party = 'APC';
        if (o.role.toLowerCase().includes('pdp') || o.full_name.toLowerCase().includes('makinde')) party = 'PDP';
        else if (o.role.toLowerCase().includes('lp') || o.full_name.toLowerCase().includes('otti')) party = 'LP';
        
        zones[code].candidates.push({
          name: o.full_name,
          party: party,
          rating: Math.round((o.rating_avg / 5.0) * 100)
        });
      }
    });

    // Sort candidates within each zone and limit to top 3
    Object.keys(zones).forEach((key) => {
      zones[key].candidates.sort((a: any, b: any) => b.rating - a.rating);
      zones[key].candidates = zones[key].candidates.slice(0, 3);
      
      // Fallback candidates if empty
      if (zones[key].candidates.length === 0) {
        if (key === 'sw') {
          zones[key].candidates = [
            { name: 'Bola Ahmed Tinubu', party: 'APC', rating: 82 },
            { name: 'Babajide Sanwo-Olu', party: 'APC', rating: 70 }
          ];
        } else if (key === 'se') {
          zones[key].candidates = [
            { name: 'Peter Obi', party: 'LP', rating: 88 },
            { name: 'Alex Otti', party: 'LP', rating: 82 }
          ];
        } else {
          zones[key].candidates = [
            { name: 'Bola Ahmed Tinubu', party: 'APC', rating: 60 },
            { name: 'Atiku Abubakar', party: 'PDP', rating: 55 }
          ];
        }
      }
    });

    return NextResponse.json({ zones });
  } catch (error: any) {
    console.error('Heatmap API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
