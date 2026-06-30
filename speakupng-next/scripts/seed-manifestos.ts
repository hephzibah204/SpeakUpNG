import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function getPoliticianId(name: string): Promise<string | null> {
  const res = await sql.query('SELECT id FROM politicians WHERE full_name ILIKE $1 LIMIT 1', [`%${name}%`]);
  return res.rows.length > 0 ? res.rows[0].id : null;
}

async function getOfficialId(name: string): Promise<string | null> {
  const res = await sql.query('SELECT id FROM officials WHERE full_name ILIKE $1 LIMIT 1', [`%${name}%`]);
  return res.rows.length > 0 ? res.rows[0].id : null;
}

async function main() {
  console.log('Seeding analyzed campaign manifestos...');
  try {
    const obiId = await getPoliticianId('Obi');
    const tinubuId = await getOfficialId('Tinubu');
    const atikuId = await getPoliticianId('Atiku');

    console.log(`Resolved IDs - Obi: ${obiId}, Tinubu: ${tinubuId}, Atiku: ${atikuId}`);

    const manifestos = [];

    if (obiId) {
      manifestos.push({
        id: 'man-obi',
        politician_id: obiId,
        official_id: null,
        title: 'Our Pact with Nigeria: Shifting from Consumption to Production',
        summary: 'Peter Obi\'s manifesto focuses heavily on structural economic reforms, cutting the cost of governance, moving Nigeria from a consumption-based to a production-oriented economy, and investing in human capital.',
        cost_feasibility: {
          rating: 'Medium',
          score: 72,
          notes: 'Requires substantial restructuring of government overheads and removing oil subsidies. Highly dependent on curbing corruption and blocking leakages.'
        },
        sdg_alignment: [
          { goal: 8, title: 'Decent Work & Economic Growth', details: 'Focus on small and medium scale enterprises (SMEs) and industrial hubs.' },
          { goal: 4, title: 'Quality Education', details: 'Prioritizes education funding and vocational training.' },
          { goal: 16, title: 'Peace, Justice & Strong Institutions', details: 'Institutional reforms and anti-corruption measures.' }
        ],
        milestones: [
          { title: 'Remove Petrol Subsidy', timeline: 'Month 1', status: 'completed' },
          { title: 'Merge redundant government agencies', timeline: 'Year 1', status: 'ongoing' },
          { title: 'Establish N500 Billion Venture Capital Fund for youth', timeline: 'Year 2', status: 'ongoing' }
        ]
      });
    }

    if (tinubuId) {
      manifestos.push({
        id: 'man-tinubu',
        politician_id: null,
        official_id: tinubuId,
        title: 'Renewed Hope 2023: Action Plan for a Better Nigeria',
        summary: 'Bola Ahmed Tinubu\'s manifesto outlines plans for national security, economic growth via infrastructure expansion, digital economy promotion, agricultural hubs, and social investment programs.',
        cost_feasibility: {
          rating: 'Low-Medium',
          score: 58,
          notes: 'Heavy capital expenditure on infrastructure and student loans requires high deficit financing. Implementation feasibility is moderate but carries inflation risks.'
        },
        sdg_alignment: [
          { goal: 9, title: 'Industry, Innovation & Infrastructure', details: 'Massive highway construction and railway expansions.' },
          { goal: 1, title: 'No Poverty', details: 'Expanding social safety nets and cash transfer programs.' },
          { goal: 8, title: 'Decent Work & Economic Growth', details: 'Job creation through digital economy and agricultural hubs.' }
        ],
        milestones: [
          { title: 'Unify exchange rates', timeline: 'Month 3', status: 'completed' },
          { title: 'Launch Student Loan Scheme', timeline: 'Year 1', status: 'completed' },
          { title: 'Construct Lagos-Calabar Coastal Highway', timeline: 'Multi-year', status: 'ongoing' }
        ]
      });
    }

    if (atikuId) {
      manifestos.push({
        id: 'man-atiku',
        politician_id: atikuId,
        official_id: null,
        title: 'My Covenant with Nigerians',
        summary: 'Atiku Abubakar\'s manifesto emphasizes private sector-led economic growth, extensive privatization of state-owned enterprises (including NNPC and refineries), devolution of power to states, and national unity.',
        cost_feasibility: {
          rating: 'High',
          score: 80,
          notes: 'Relying heavily on private sector investment and privatization reduces direct government cost, making it highly feasible financially.'
        },
        sdg_alignment: [
          { goal: 17, title: 'Partnerships for the Goals', details: 'Private-public partnerships (PPPs) for infrastructure development.' },
          { goal: 8, title: 'Decent Work & Economic Growth', details: 'Spurring private sector job creation.' },
          { goal: 10, title: 'Reduced Inequalities', details: 'Restructuring and devolution of powers to states.' }
        ],
        milestones: [
          { title: 'Privatize state-owned refineries', timeline: 'Month 6', status: 'pending' },
          { title: 'Establish N10 Billion economic stimulus fund', timeline: 'Year 1', status: 'pending' },
          { title: 'Devolve policing powers to states', timeline: 'Year 2', status: 'pending' }
        ]
      });
    }

    for (const m of manifestos) {
      await sql.query(`
        INSERT INTO official_manifestos (id, politician_id, official_id, title, summary, cost_feasibility, sdg_alignment, milestones)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          summary = EXCLUDED.summary,
          cost_feasibility = EXCLUDED.cost_feasibility,
          sdg_alignment = EXCLUDED.sdg_alignment,
          milestones = EXCLUDED.milestones
      `, [
        m.id,
        m.politician_id,
        m.official_id,
        m.title,
        m.summary,
        JSON.stringify(m.cost_feasibility),
        JSON.stringify(m.sdg_alignment),
        JSON.stringify(m.milestones)
      ]);
    }

    console.log('✅ Manifestos seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
