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
  console.log('Seeding expanded Promises, Projects, and Election Incidents...');
  try {
    const tinubuId = await getOfficialId('Tinubu');
    const sanwoOluId = await getOfficialId('Sanwo-Olu');
    const makindeId = await getOfficialId('Seyi Makinde');
    const ottiId = await getOfficialId('Alex Otti');
    const zulumId = await getOfficialId('Babagana Zulum');

    // 1. Clear existing matching records to avoid duplicates in seed runs
    await sql.query("DELETE FROM election_incidents");

    // 2. Seed Election Incidents
    const incidents = [
      {
        id: randomUUID(),
        category: 'delayed_officials',
        description: 'INEC ad-hoc staff and voting materials did not arrive at PU 012 as of 11:30 AM. Over 300 registered voters are waiting in the sun.',
        state: 'Lagos',
        lga: 'Ikeja',
        polling_unit: 'PU 012, Alade Market, Ikeja',
        status: 'verified',
        reporter_name: 'Segun Johnson'
      },
      {
        id: randomUUID(),
        category: 'card_reader_failure',
        description: 'The BVAS device has failed to authenticate biometrics for more than half of the queue. The presiding officer has requested a backup device.',
        state: 'Oyo',
        lga: 'Ibadan North',
        polling_unit: 'PU 004, Ward 2, Bodija',
        status: 'verified',
        reporter_name: 'Chioma Obi'
      },
      {
        id: randomUUID(),
        category: 'vote_buying',
        description: 'Party agents observed sharing small envelopes with cash behind the primary school fence to voters who showed proof of their vote.',
        state: 'Kano',
        lga: 'Nassarawa',
        polling_unit: 'PU 035, Nassarawa Ward',
        status: 'escalated',
        reporter_name: 'Mustapha Gani'
      },
      {
        id: randomUUID(),
        category: 'ballot_snatching',
        description: 'Armed thugs disrupted the counting process, snatching the ballot box for the presidential vote. Police are on the scene.',
        state: 'Rivers',
        lga: 'Obio-Akpor',
        polling_unit: 'PU 008, Ward 4',
        status: 'escalated',
        reporter_name: 'Precious Hart'
      }
    ];

    for (const inc of incidents) {
      await sql.query(`
        INSERT INTO election_incidents (id, category, description, state, lga, polling_unit, status, reporter_name)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [inc.id, inc.category, inc.description, inc.state, inc.lga, inc.polling_unit, inc.status, inc.reporter_name]);
    }
    console.log('✓ Seeding Election Incidents Complete.');

    // 3. Seed expanded Official Promises
    const promises = [];

    if (tinubuId) {
      promises.push({
        id: randomUUID(),
        official_id: tinubuId,
        promise_title: 'Naira Stabilization & FX Unified Band',
        promise_detail: 'To achieve a stable, market-driven exchange rate by unifying foreign exchange windows and encouraging repatriation of diaspora funds.',
        promise_category: 'Economy',
        status: 'in_progress',
        progress_percent: 45
      });
    }

    if (sanwoOluId) {
      promises.push({
        id: randomUUID(),
        official_id: sanwoOluId,
        promise_title: 'Fourth Mainland Bridge Completion',
        promise_detail: 'To complete construction of the Fourth Mainland Bridge to ease traffic congestion in Lagos east corridors.',
        promise_category: 'Infrastructure',
        status: 'in_progress',
        progress_percent: 60
      });
    }

    if (makindeId) {
      promises.push({
        id: randomUUID(),
        official_id: makindeId,
        promise_title: 'Universal Free Basic Education Extension',
        promise_detail: 'To extend zero-fee basic schooling, abolish PTA levying, and disburse textbooks to all public schools in Oyo State.',
        promise_category: 'Education',
        status: 'fulfilled',
        progress_percent: 100
      });
    }

    for (const p of promises) {
      await sql.query(`
        INSERT INTO official_promises (id, official_id, promise_title, promise_detail, promise_category, status, progress_percent)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [p.id, p.official_id, p.promise_title, p.promise_detail, p.promise_category, p.status, p.progress_percent]);
    }
    console.log('✓ Seeding Expanded Official Promises Complete.');

    // 4. Seed expanded Official Projects
    const projects = [];

    if (makindeId) {
      projects.push({
        id: randomUUID(),
        official_id: makindeId,
        title: 'Ibadan Circular Road Phase 1',
        description: 'Construction of a 32km expansion corridor to bypass heavy municipal logistics and transit vehicles.',
        status: 'ongoing',
        budget: 'N67.5 Billion',
        date_delivered: null
      });
    }

    if (ottiId) {
      projects.push({
        id: randomUUID(),
        official_id: ottiId,
        title: 'Aba Road Rehabilitation (Port Harcourt Road)',
        description: 'Complete reconstruction of Aba city-center main access highway with modern drainage grids.',
        status: 'completed',
        budget: 'N24.2 Billion',
        date_delivered: '2025-10-18'
      });
    }

    if (zulumId) {
      projects.push({
        id: randomUUID(),
        official_id: zulumId,
        title: 'Maiduguri Mega School Reconstruction',
        description: 'Rebuilding of destroyed public primary and junior secondary institutions with solar grids and smart learning systems.',
        status: 'completed',
        budget: 'N8.5 Billion',
        date_delivered: '2024-05-12'
      });
    }

    for (const proj of projects) {
      await sql.query(`
        INSERT INTO official_projects (id, official_id, title, description, status, budget, date_delivered)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [proj.id, proj.official_id, proj.title, proj.description, proj.status, proj.budget, proj.date_delivered]);
    }
    console.log('✓ Seeding Expanded Official Projects Complete.');

    console.log('✅ All promises, projects, and incidents seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
