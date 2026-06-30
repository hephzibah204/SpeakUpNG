import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding detailed Electoral Act 2022 course module...');
  try {
    const electoralActModule = {
      id: 'mod-electoral-act',
      title: 'The Electoral Act 2022: Guarding Your Vote',
      category: 'Elections',
      xp_reward: 75,
      content_markdown: `# The Electoral Act 2022: Guarding Your Vote

Signed into law in February 2022, the Electoral Act replaced the 2010 Act, introducing revolutionary changes designed to enhance transparency, security, and fairness in Nigerian elections.

## 1. Technological Innovations (Section 47)
The Act legally empowers INEC to use electronic devices for voter accreditation and result transmission.
- **BVAS (Bimodal Voter Accreditation System)**: Authenticates voters using fingerprints and facial recognition. This prevents multiple voting and impersonation.
- **IReV (INEC Result Viewing Portal)**: Mandates the electronic transmission of polling unit results (Form EC8A) directly to a public viewing portal on election day.

## 2. Early Funding for INEC (Section 3)
To prevent delays in logistics and planning, the Act requires that all election funding be released to INEC at least **one year** before the date of a general election.

## 3. Review of Results Under Duress (Section 65)
The Act empowers INEC to review and reverse election declarations made by returning officers under duress, threat, or force (combatting "gun-point" declarations).

## 4. Strict Timelines for Primaries (Section 29)
Political parties must submit their list of candidates to INEC at least **180 days** before the date of the general election, allowing enough time for judicial challenges before the main vote.

## 5. Campaign Finance Limits (Section 88)
The Act sets clear spending limits for candidates:
- **Presidential**: Maximum of N5 Billion.
- **Gubernatorial**: Maximum of N1 Billion.
- **Senate**: Maximum of N100 Million.
- **House of Representatives**: Maximum of N70 Million.
`
    };

    await sql.query(`
      INSERT INTO civic_learning_modules (id, title, content_markdown, category, xp_reward)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content_markdown = EXCLUDED.content_markdown,
        category = EXCLUDED.category,
        xp_reward = EXCLUDED.xp_reward
    `, [
      electoralActModule.id,
      electoralActModule.title,
      electoralActModule.content_markdown,
      electoralActModule.category,
      electoralActModule.xp_reward
    ]);

    const quizzes = [
      {
        id: 'q-elect-act-1',
        module_id: 'mod-electoral-act',
        question: 'Under Section 3 of the Electoral Act 2022, when must INEC receive its election funding?',
        options: [
          '3 months before the election',
          'At least 1 year before the election',
          'On the morning of the election',
          '6 months before the election'
        ],
        correct_option_index: 1
      },
      {
        id: 'q-elect-act-2',
        module_id: 'mod-electoral-act',
        question: 'Which section of the Electoral Act 2022 legalizes the use of the BVAS device for biometric accreditation?',
        options: ['Section 3', 'Section 29', 'Section 47', 'Section 88'],
        correct_option_index: 2
      },
      {
        id: 'q-elect-act-3',
        module_id: 'mod-electoral-act',
        question: 'What is the maximum campaign spending limit for a Gubernatorial (Governor) candidate under Section 88?',
        options: ['N5 Billion', 'N1 Billion', 'N500 Million', 'N100 Million'],
        correct_option_index: 1
      }
    ];

    for (const q of quizzes) {
      await sql.query(`
        INSERT INTO civic_quizzes (id, module_id, question, options, correct_option_index)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          question = EXCLUDED.question,
          options = EXCLUDED.options,
          correct_option_index = EXCLUDED.correct_option_index
      `, [q.id, q.module_id, q.question, JSON.stringify(q.options), q.correct_option_index]);
    }

    console.log('✅ Electoral Act 2022 course and quizzes seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
