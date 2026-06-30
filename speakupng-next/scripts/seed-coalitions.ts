import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding political coalitions and defections...');
  try {
    // Drop table if exists to update constraints/structure cleanly
    await sql.query('DROP TABLE IF EXISTS political_coalitions CASCADE');
    await sql.query(`
      CREATE TABLE political_coalitions (
        id VARCHAR PRIMARY KEY,
        event_type VARCHAR NOT NULL CHECK(event_type IN ('defection','coalition','endorsement','running_mate')),
        politician_name VARCHAR NOT NULL,
        from_party VARCHAR,
        to_party VARCHAR,
        description TEXT,
        source_url TEXT,
        event_date DATE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const events = [
      {
        id: 'ev-1',
        event_type: 'defection',
        politician_name: 'Peter Obi',
        from_party: 'PDP',
        to_party: 'LP',
        description: 'Peter Obi resigned from the Peoples Democratic Party (PDP) and formally defected to the Labour Party, citing structural inconsistencies and an alignment with the aspirations of the Nigerian youth.',
        source_url: 'https://vanguardngr.com',
        event_date: '2022-05-27'
      },
      {
        id: 'ev-2',
        event_type: 'defection',
        politician_name: 'Nyesom Wike',
        from_party: 'PDP',
        to_party: 'APC',
        description: 'Former Rivers State Governor and FCT Minister, Nyesom Wike, accepted a ministerial appointment under the ruling APC government while maintaining his membership in the PDP, representing a de-facto defection/coalition shift.',
        source_url: 'https://punchng.com',
        event_date: '2023-08-21'
      },
      {
        id: 'ev-3',
        event_type: 'coalition',
        politician_name: 'Social Democratic Party (SDP)',
        from_party: 'None',
        to_party: 'Multiple',
        description: 'Several regional factions of the SDP, LP, and PDP announced alliance exploratory committees to prepare a unified coalition front ahead of the upcoming electoral cycles.',
        source_url: 'https://tribuneonlineng.com',
        event_date: '2025-11-10'
      },
      {
        id: 'ev-4',
        event_type: 'defection',
        politician_name: 'Nasir Ahmad El-Rufai',
        from_party: 'APC',
        to_party: 'ADC',
        description: 'Former Governor of Kaduna State, Nasir El-Rufai, held consultative meetings with leading figures of the African Democratic Congress (ADC), sparking widespread defection declarations.',
        source_url: 'https://premiumtimesng.com',
        event_date: '2024-04-15'
      }
    ];

    for (const ev of events) {
      await sql.query(`
        INSERT INTO political_coalitions (id, event_type, politician_name, from_party, to_party, description, source_url, event_date)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          politician_name = EXCLUDED.politician_name,
          event_type = EXCLUDED.event_type,
          from_party = EXCLUDED.from_party,
          to_party = EXCLUDED.to_party,
          description = EXCLUDED.description,
          source_url = EXCLUDED.source_url,
          event_date = EXCLUDED.event_date
      `, [ev.id, ev.event_type, ev.politician_name, ev.from_party, ev.to_party, ev.description, ev.source_url, ev.event_date]);
    }

    console.log('✅ Political coalitions seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
