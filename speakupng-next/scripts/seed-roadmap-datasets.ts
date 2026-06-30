import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding new roadmap datasets...');
  try {
    // 1. Seed Political Parties
    console.log('Seeding political parties...');
    const parties = [
      {
        id: 'party-apc',
        name: 'All Progressives Congress',
        acronym: 'APC',
        headquarters: '40 Blantyre Street, Wuse II, Abuja',
        manifesto_summary: 'Focuses on agricultural reforms, infrastructure expansion, social investment programs, and national security.',
        founded_year: 2013
      },
      {
        id: 'party-pdp',
        name: 'People\'s Democratic Party',
        acronym: 'PDP',
        headquarters: 'Wadata Plaza, Wuse Zone 5, Abuja',
        manifesto_summary: 'Advocates for economic deregulation, private sector-led growth, devolution of power, and judicial independence.',
        founded_year: 1998
      },
      {
        id: 'party-lp',
        name: 'Labour Party',
        acronym: 'LP',
        headquarters: '29 Oke Agbe Street, Garki, Abuja',
        manifesto_summary: 'Focuses on shifting Nigeria from consumption to production, youth empowerment, labor rights, and public healthcare.',
        founded_year: 2002
      },
      {
        id: 'party-nnpp',
        name: 'New Nigeria People\'s Party',
        acronym: 'NNPP',
        headquarters: 'Abuja, FCT',
        manifesto_summary: 'Focuses on grassroots development, educational reform, and restructuring public institutions.',
        founded_year: 2001
      }
    ];

    for (const party of parties) {
      await sql.query(`
        INSERT INTO political_parties (id, name, acronym, headquarters, manifesto_summary, founded_year)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          acronym = EXCLUDED.acronym,
          headquarters = EXCLUDED.headquarters,
          manifesto_summary = EXCLUDED.manifesto_summary,
          founded_year = EXCLUDED.founded_year
      `, [party.id, party.name, party.acronym, party.headquarters, party.manifesto_summary, party.founded_year]);
    }

    // 2. Seed Civic Learning Modules & Quizzes
    console.log('Seeding civic learning modules & quizzes...');
    const modules = [
      {
        id: 'mod-const',
        title: 'Understanding the Nigerian Constitution',
        category: 'Constitution',
        xp_reward: 50,
        content_markdown: `# The Constitution of the Federal Republic of Nigeria

The Constitution is the supreme law of the land. Any other law that is inconsistent with the provisions of the Constitution is void to the extent of the inconsistency.

## Key Highlights:
1. **Chapter II: Fundamental Objectives and Directive Principles of State Policy**: Outlines the duties of the government to its citizens (e.g., security, welfare, education). Note that these are largely non-justiciable (you cannot sue the government in court to enforce them).
2. **Chapter IV: Fundamental Human Rights**: Protects your right to life, dignity, personal liberty, fair hearing, private life, freedom of thought, expression, assembly, and movement.
`
      },
      {
        id: 'mod-elect',
        title: 'How the Electoral Act Protects Your Vote',
        category: 'Elections',
        xp_reward: 60,
        content_markdown: `# The Electoral Act 2022

The Electoral Act 2022 introduced major technological reforms to make Nigerian elections more transparent.

## Major Innovations:
1. **BVAS (Bimodal Voter Accreditation System)**: A device used to verify voters using both fingerprints and facial recognition. This prevents double voting and ghost voters.
2. **IReV (INEC Result Viewing Portal)**: An online portal where polling unit results (Form EC8A) are uploaded directly on election day for public viewing.
`
      }
    ];

    for (const mod of modules) {
      await sql.query(`
        INSERT INTO civic_learning_modules (id, title, content_markdown, category, xp_reward)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          content_markdown = EXCLUDED.content_markdown,
          category = EXCLUDED.category,
          xp_reward = EXCLUDED.xp_reward
      `, [mod.id, mod.title, mod.content_markdown, mod.category, mod.xp_reward]);
    }

    const quizzes = [
      {
        id: 'q-const-1',
        module_id: 'mod-const',
        question: 'Which chapter of the Nigerian Constitution contains Fundamental Human Rights?',
        options: ['Chapter I', 'Chapter II', 'Chapter IV', 'Chapter V'],
        correct_option_index: 2
      },
      {
        id: 'q-elect-1',
        module_id: 'mod-elect',
        question: 'What is the primary function of the BVAS device?',
        options: ['To print ballot papers', 'To accredit voters using biometrics', 'To count physical votes', 'To broadcast campaign news'],
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

    // 3. Seed Budget Allocations
    console.log('Seeding budget allocations...');
    const budgets = [
      {
        id: 'bud-fed-edu-2024',
        year: 2024,
        entity_type: 'federal',
        entity_name: 'Federal Government',
        sector: 'Education',
        amount_allocated: 1540000000000, // 1.54 Trillion NGN
        amount_released: 850000000000,
        description: 'Federal budget allocation for primary, secondary, and tertiary education institutions and grants.'
      },
      {
        id: 'bud-fed-health-2024',
        year: 2024,
        entity_type: 'federal',
        entity_name: 'Federal Government',
        sector: 'Health',
        amount_allocated: 1250000000000, // 1.25 Trillion NGN
        amount_released: 710000000000,
        description: 'Federal budget allocation for healthcare infrastructure, disease control, and primary healthcare centers.'
      }
    ];

    for (const bud of budgets) {
      await sql.query(`
        INSERT INTO budget_allocations (id, year, entity_type, entity_name, sector, amount_allocated, amount_released, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          year = EXCLUDED.year,
          entity_type = EXCLUDED.entity_type,
          entity_name = EXCLUDED.entity_name,
          sector = EXCLUDED.sector,
          amount_allocated = EXCLUDED.amount_allocated,
          amount_released = EXCLUDED.amount_released,
          description = EXCLUDED.description
      `, [bud.id, bud.year, bud.entity_type, bud.entity_name, bud.sector, bud.amount_allocated, bud.amount_released, bud.description]);
    }

    console.log('✅ All new roadmap datasets seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
