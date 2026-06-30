import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding expanded civic quizzes and learning modules...');
  try {
    // Check if the Electoral Act module exists
    const moduleRes = await sql.query("SELECT id FROM civic_learning_modules WHERE title ILIKE '%Electoral%' LIMIT 1");
    let moduleId = moduleRes.rows.length > 0 ? moduleRes.rows[0].id : null;

    if (!moduleId) {
      // Create Electoral Act module if missing
      moduleId = 'mod-electoral-act';
      await sql.query(`
        INSERT INTO civic_learning_modules (id, title, content_markdown, category, xp_reward)
        VALUES ($1, $2, $3, $4, 50)
        ON CONFLICT (id) DO NOTHING
      `, [moduleId, 'Electoral Act 2022 Details', 'Detailed guide on the Electoral Act 2022 regulations and guidelines.', 'legislation']);
    }

    const quizzes = [
      {
        id: randomUUID(),
        module_id: moduleId,
        question: 'Under Section 50(2) of the Electoral Act 2022, what is the commission\'s mandate regarding result transmission?',
        options: JSON.stringify([
          'Strictly manual transmission only',
          'Electronic transmission in a format determined by the commission',
          'Transmission via physical dispatch riders only',
          'No specific mandate is defined'
        ]),
        correct_option_index: 1
      },
      {
        id: randomUUID(),
        module_id: moduleId,
        question: 'What is the statutory deadline for political parties to submit their candidate lists to INEC before elections?',
        options: JSON.stringify([
          '30 days before the election',
          '90 days before the election',
          '180 days before the election',
          '150 days before the election'
        ]),
        correct_option_index: 2
      },
      {
        id: randomUUID(),
        module_id: moduleId,
        question: 'Which device is officially mandated by the Electoral Act 2022 for voter accreditation?',
        options: JSON.stringify([
          'Smart Card Reader',
          'Bimodal Voter Accreditation System (BVAS)',
          'IReV Portal',
          'Fingerprint ink pad'
        ]),
        correct_option_index: 1
      }
    ];

    for (const q of quizzes) {
      await sql.query(`
        INSERT INTO civic_quizzes (id, module_id, question, options, correct_option_index)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO NOTHING
      `, [q.id, q.module_id, q.question, q.options, q.correct_option_index]);
    }

    console.log('✅ Expanded civic quizzes seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
