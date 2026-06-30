import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Seeding comprehensive actual course modules for the Civic Learning Centre...');
  try {
    const modules = [
      {
        id: 'mod-branches',
        title: 'The Three Branches of Nigerian Government',
        category: 'Governance',
        xp_reward: 50,
        content_markdown: `# The Three Branches of Nigerian Government

Nigeria operates a federal system of government based on the principle of Separation of Powers. Power is shared among three distinct branches.

## 1. The Legislature (Lawmakers)
Represented by the National Assembly (NASS) at the federal level, consisting of:
- **The Senate**: 109 Senators (3 from each of the 36 states, plus 1 from Abuja).
- **House of Representatives**: 360 members representing federal constituencies.
*Their primary role is to make laws and perform oversight on the executive.*

## 2. The Executive (Execution)
Headed by the **President** at the federal level and **Governors** at the state level.
*Their primary role is to execute laws, manage national security, and administer public services.*

## 3. The Judiciary (Interpretation)
Headed by the **Chief Justice of Nigeria** and the Supreme Court.
*Their primary role is to interpret laws, resolve disputes, and ensure the constitution is upheld.*
`
      },
      {
        id: 'mod-bill-law',
        title: 'How a Bill Becomes Law in Nigeria',
        category: 'Legislation',
        xp_reward: 60,
        content_markdown: `# How a Bill Becomes Law

A bill is a proposed law presented to the National Assembly for consideration. The process involves several rigorous stages.

## The Legislative Journey:
1. **First Reading**: The bill is introduced, and its title is read aloud. No debate occurs at this stage.
2. **Second Reading**: The bill is debated. Lawmakers discuss its merits, costs, and national importance. If passed, it goes to a Committee.
3. **Committee Stage**: Relevant committees examine the bill in detail, hold public hearings, and invite citizen feedback.
4. **Third Reading & Passage**: The final version is voted on. It must be passed by both the Senate and the House of Representatives.
5. **Presidential Assent**: The passed bill is sent to the President. The President has 30 days to sign it into law or veto it. If vetoed, the National Assembly can override it with a two-thirds majority vote.
`
      },
      {
        id: 'mod-voter-rights',
        title: 'Voter Rights & The PVC Process',
        category: 'Elections',
        xp_reward: 50,
        content_markdown: `# Voter Rights & The PVC Process

Your vote is your power. To participate in Nigerian elections, you must obtain a Permanent Voter Card (PVC).

## Key Steps to Vote:
1. **Continuous Voter Registration (CVR)**: Conducted by INEC to register new voters, transfer registration to new locations, or replace lost cards.
2. **Biometric Capture**: INEC captures your fingerprints and facial features using the Bimodal Voter Accreditation System (BVAS) during registration.
3. **PVC Collection**: You must physically collect your PVC from designated INEC local offices or wards. You cannot vote without a physical PVC.
4. **Election Day Rights**: You have the right to be accredited, receive a stamped ballot paper, vote in secret, and stay to witness the vote count at your polling unit.
`
      },
      {
        id: 'mod-local-gov',
        title: 'Local Government: The Third Tier of Government',
        category: 'Local Governance',
        xp_reward: 50,
        content_markdown: `# Local Government Administration

The Local Government Area (LGA) is the closest tier of government to the grassroots. Nigeria has 774 LGAs.

## Key Responsibilities of LGAs:
1. **Markets & Parks**: Maintenance and collection of rates from motor parks and local markets.
2. **Sanitation**: Waste disposal and drainage maintenance.
3. **Primary Education & Health**: Collaboration with state governments to run primary schools and primary health centers.
4. **Community Roads**: Construction and maintenance of local streets and feeder roads (excluding state/federal highways).
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
        id: 'q-branches-1',
        module_id: 'mod-branches',
        question: 'How many Senators make up the Nigerian Senate?',
        options: ['360', '109', '100', '774'],
        correct_option_index: 1
      },
      {
        id: 'q-bill-1',
        module_id: 'mod-bill-law',
        question: 'What majority vote is required by the National Assembly to override a Presidential Veto?',
        options: ['Simple Majority', 'Two-Thirds Majority', 'Three-Quarters Majority', 'Unanimous Vote'],
        correct_option_index: 1
      },
      {
        id: 'q-voter-1',
        module_id: 'mod-voter-rights',
        question: 'Can you vote in a Nigerian election without a physical Permanent Voter Card (PVC)?',
        options: ['Yes, using digital slip', 'Yes, using national ID', 'No, physical PVC is mandatory', 'Yes, if accredited by BVAS alone'],
        correct_option_index: 2
      },
      {
        id: 'q-local-1',
        module_id: 'mod-local-gov',
        question: 'How many Local Government Areas (LGAs) are there in Nigeria?',
        options: ['36', '109', '774', '360'],
        correct_option_index: 2
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

    console.log('✅ All actual course modules and quizzes seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
