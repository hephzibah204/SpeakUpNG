import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

// Setup Gemini model
const model = google('gemini-1.5-flash');

interface Profile {
  id: string;
  full_name: string;
  role: string;
  state?: string;
  party?: string;
}

async function generateDataForProfile(profile: Profile, type: 'official' | 'politician') {
  const prompt = `
Generate a list of 2 realistic campaign promises and 2 delivered projects for the following Nigerian ${type}:
Name: ${profile.full_name}
Role/Details: ${profile.role} ${profile.state ? `of ${profile.state} State` : ''} ${profile.party ? `(${profile.party} party)` : ''}

Respond ONLY with a valid JSON object in the following format (do not include markdown code block formatting or any other text):
{
  "promises": [
    {
      "title": "Short title of campaign promise",
      "detail": "Detailed description of what was promised",
      "category": "Economy/Education/Infrastructure/Security/Healthcare",
      "status": "fulfilled", // Must be one of: pending, in_progress, fulfilled, broken, disputed
      "progress_percent": 100 // Integer between 0 and 100
    },
    ...
  ],
  "projects": [
    {
      "title": "Short title of delivered project",
      "description": "Detailed description of the project and its impact",
      "status": "completed", // Must be one of: completed, ongoing, abandoned
      "budget": "e.g. N5 Billion or N/A",
      "date_delivered": "e.g. May 2024 or N/A"
    },
    ...
  ]
}
`;

  try {
    const response = await generateText({
      model: model,
      prompt: prompt,
      temperature: 0.1,
    });

    const cleanJson = response.text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error(`Failed to generate AI data for ${profile.full_name}:`, error);
    return null;
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not configured in .env.local');
    process.exit(1);
  }

  console.log('🚀 Starting AI-Driven Promises & Projects Seeding for all Governors and Aspirants...');

  try {
    // 1. Fetch all Governors
    const governors = await sql.query<Profile>(`
      SELECT id, full_name, role, state 
      FROM officials 
      WHERE tier = 'state_executive' OR LOWER(role) LIKE '%governor%'
    `);

    // 2. Fetch all Politicians (Aspirants)
    const aspirants = await sql.query<Profile>(`
      SELECT id, full_name, aspiration_title as role, party 
      FROM politicians
    `);

    const allProfiles = [
      ...governors.rows.map(g => ({ ...g, type: 'official' as const })),
      ...aspirants.rows.map(a => ({ ...a, type: 'politician' as const })),
    ];

    console.log(`Found ${governors.rows.length} governors and ${aspirants.rows.length} aspirants in database.`);

    for (let i = 0; i < allProfiles.length; i++) {
      const profile = allProfiles[i];
      console.log(`[${i + 1}/${allProfiles.length}] Generating data for ${profile.full_name}...`);

      const data = await generateDataForProfile(profile, profile.type);
      if (!data) continue;

      // Insert Promises
      if (data.promises) {
        for (let pIdx = 0; pIdx < data.promises.length; pIdx++) {
          const p = data.promises[pIdx];
          const pId = `ai-prom-${profile.id}-${pIdx}`;
          await sql.query(`
            INSERT INTO official_promises (id, official_id, politician_id, promise_title, promise_detail, promise_category, status, progress_percent)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            ON CONFLICT (id) DO UPDATE SET
              promise_title = EXCLUDED.promise_title,
              promise_detail = EXCLUDED.promise_detail,
              promise_category = EXCLUDED.promise_category,
              status = EXCLUDED.status,
              progress_percent = EXCLUDED.progress_percent
          `, [
            pId,
            profile.type === 'official' ? profile.id : null,
            profile.type === 'politician' ? profile.id : null,
            p.title,
            p.detail,
            p.category,
            p.status,
            p.progress_percent
          ]);
        }
      }

      // Insert Projects
      if (data.projects) {
        for (let projIdx = 0; projIdx < data.projects.length; projIdx++) {
          const proj = data.projects[projIdx];
          const projId = `ai-proj-${profile.id}-${projIdx}`;
          await sql.query(`
            INSERT INTO official_projects (id, official_id, title, description, status, budget, date_delivered)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (id) DO UPDATE SET
              title = EXCLUDED.title,
              description = EXCLUDED.description,
              status = EXCLUDED.status,
              budget = EXCLUDED.budget,
              date_delivered = EXCLUDED.date_delivered
          `, [
            projId,
            profile.type === 'official' ? profile.id : null,
            proj.title,
            proj.description,
            proj.status,
            proj.budget,
            proj.date_delivered
          ]);
        }
      }
    }

    console.log('✅ AI-Driven Seeding Completed Successfully.');
  } catch (error) {
    console.error('❌ AI Seeding process failed:', error);
  } finally {
    await sql.end();
  }
}

main();
