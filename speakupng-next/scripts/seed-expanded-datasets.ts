import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function getOfficialId(name: string): Promise<string | null> {
  const res = await sql.query('SELECT id FROM officials WHERE full_name ILIKE $1 LIMIT 1', [`%${name}%`]);
  return res.rows.length > 0 ? res.rows[0].id : null;
}

async function main() {
  console.log('Seeding expanded datasets (Bills, Budgets, and Political Parties)...');
  try {
    // Clear existing parties first to avoid unique key conflicts on name/acronym
    await sql.query('DELETE FROM political_parties');

    // 1. Expand Political Parties Details
    const parties = [
      { id: 'apc', name: 'All Progressives Congress', acronym: 'APC', logo_url: '/images/parties/apc.png', founded_year: 2013, headquarters: 'Abuja' },
      { id: 'pdp', name: 'Peoples Democratic Party', acronym: 'PDP', logo_url: '/images/parties/pdp.png', founded_year: 1998, headquarters: 'Abuja' },
      { id: 'lp', name: 'Labour Party', acronym: 'LP', logo_url: '/images/parties/lp.png', founded_year: 2002, headquarters: 'Abuja' },
      { id: 'nnpp', name: 'New Nigeria Peoples Party', acronym: 'NNPP', logo_url: '/images/parties/nnpp.png', founded_year: 2001, headquarters: 'Abuja' },
      { id: 'apga', name: 'All Progressives Grand Alliance', acronym: 'APGA', logo_url: '/images/parties/apga.png', founded_year: 2003, headquarters: 'Awka' }
    ];

    for (const p of parties) {
      await sql.query(`
        INSERT INTO political_parties (id, name, acronym, logo_url, headquarters, founded_year)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          headquarters = EXCLUDED.headquarters
      `, [p.id, p.name, p.acronym, p.logo_url, p.headquarters, p.founded_year]);
    }
    console.log('✓ Seeding Political Parties Complete.');

    // Resolve sponsor IDs
    const makindeId = await getOfficialId('Seyi Makinde');

    // 2. Expand Legislative Bills
    const bills = [
      { id: randomUUID(), title: 'Electoral Act (Amendment) Bill 2026', status: 'second_reading', sponsor_id: null, full_text: 'A bill to mandate real-time electronic transmission of polling unit results directly to a public viewing portal to improve transparency.', category: 'Electoral Reform', date_introduced: '2026-02-15' },
      { id: randomUUID(), title: 'Digital Economy & Startup Funding Act', status: 'passed_senate', sponsor_id: null, full_text: 'An act to provide fiscal incentives, tax holidays, and matching funds for verified technology startups operating in Nigeria.', category: 'Technology', date_introduced: '2025-10-12' },
      { id: randomUUID(), title: 'National Security Coordination Bill 2025', status: 'first_reading', sponsor_id: null, full_text: 'A bill to streamline intelligence sharing between military, police, and regional security groups (Amotekun, Ebube Agu) to combat banditry.', category: 'Security', date_introduced: '2025-08-01' },
      { id: randomUUID(), title: 'Gender Equality in Public Office Bill', status: 'second_reading', sponsor_id: null, full_text: 'A bill seeking to allocate a minimum of 35% representation for women in all federal and state ministerial appointments.', category: 'Social Reform', date_introduced: '2025-05-10' },
      { id: randomUUID(), title: 'Minimum Wage Implementation Enforcement Bill', status: 'assented', sponsor_id: makindeId, full_text: 'An act to impose heavy penalties and withhold federal allocations from states and private companies failing to pay the new minimum wage.', category: 'Labour & Welfare', date_introduced: '2024-11-20' }
    ];

    for (const b of bills) {
      await sql.query(`
        INSERT INTO bills (id, title, status, sponsor_id, full_text, category, date_introduced)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [b.id, b.title, b.status, b.sponsor_id, b.full_text, b.category, b.date_introduced]);
    }
    console.log('✓ Seeding Legislative Bills Complete.');

    // 3. Expand Budget Allocations
    const budgets = [
      { id: randomUUID(), entity_name: 'Federal Government', entity_type: 'federal', sector: 'Education', year: 2024, amount_allocated: 2180000000000, amount_released: 1800000000000, description: 'Primary and secondary education rehabilitation, university funding grants, and vocational training allocations.' },
      { id: randomUUID(), entity_name: 'Federal Government', entity_type: 'federal', sector: 'Health', year: 2024, amount_allocated: 1330000000000, amount_released: 950000000000, description: 'Primary healthcare centers upgrade, national health insurance scheme subsidies, and infectious disease control.' },
      { id: randomUUID(), entity_name: 'Federal Government', entity_type: 'federal', sector: 'Defence', year: 2024, amount_allocated: 3250000000000, amount_released: 3100000000000, description: 'Procurement of military hardware, logistics, border security enhancements, and counter-terrorism funding.' },
      { id: randomUUID(), entity_name: 'Federal Government', entity_type: 'federal', sector: 'Infrastructure', year: 2024, amount_allocated: 1020000000000, amount_released: 850000000000, description: 'Construction and rehabilitation of federal trunk roads and social housing initiatives.' }
    ];

    for (const b of budgets) {
      await sql.query(`
        INSERT INTO budget_allocations (id, entity_name, entity_type, sector, year, amount_allocated, amount_released, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO NOTHING
      `, [b.id, b.entity_name, b.entity_type, b.sector, b.year, b.amount_allocated, b.amount_released, b.description]);
    }
    console.log('✓ Seeding Budget Allocations Complete.');

    console.log('✅ Expanded datasets seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
