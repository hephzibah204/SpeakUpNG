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
}

async function generateBioForOfficial(official: Profile) {
  const prompt = `
Generate detailed biographical, educational, and career history for the following Nigerian public official:
Name: ${official.full_name}
Role: ${official.role} ${official.state ? `of ${official.state} State` : ''}

Respond ONLY with a valid JSON object in the following format (do not include markdown code block formatting or any other text):
{
  "state_of_origin": "State name or N/A",
  "dob": "YYYY-MM-DD or N/A",
  "education": [
    {
      "institution": "University/School Name",
      "degree": "B.Sc / M.Sc / WASSCE etc.",
      "year_graduated": 2005 // Integer or null
    }
  ],
  "career": [
    {
      "organization": "Company or Government Body",
      "role": "Position Title",
      "start_year": 2008, // Integer or null
      "end_year": 2015 // Integer or null (null if current/ongoing)
    }
  ],
  "achievements": [
    {
      "title": "Key achievement title",
      "description": "Short description of the achievement and impact",
      "year": 2018 // Integer or null
    }
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
    console.error(`Failed to generate AI biography for ${official.full_name}:`, error);
    return null;
  }
}

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY is not configured in .env.local');
    process.exit(1);
  }

  console.log('🚀 Starting AI-Driven Biography Enrichment for key officials...');

  try {
    // Fetch key officials (President, Governors, Ministers)
    const officials = await sql.query<Profile>(`
      SELECT id, full_name, role, state 
      FROM officials 
      WHERE tier = 'state_executive' 
         OR tier = 'federal_executive'
         OR LOWER(role) LIKE '%governor%'
         OR LOWER(role) LIKE '%minister%'
         OR LOWER(role) LIKE '%president%'
      LIMIT 15
    `);

    console.log(`Found ${officials.rows.length} key officials to enrich.`);

    for (let i = 0; i < officials.rows.length; i++) {
      const official = officials.rows[i];
      console.log(`[${i + 1}/${officials.rows.length}] Enriching ${official.full_name}...`);

      const bioData = await generateBioForOfficial(official);
      if (!bioData) continue;

      // 1. Update Official's basic info (if we have columns for state_of_origin or dob, or update the bio description)
      // Let's prepend the birth date and origin to their bio if they exist.
      let extraBioText = '';
      if (bioData.state_of_origin && bioData.state_of_origin !== 'N/A') {
        extraBioText += `State of Origin: ${bioData.state_of_origin}. `;
      }
      if (bioData.dob && bioData.dob !== 'N/A') {
        extraBioText += `Born: ${bioData.dob}. `;
      }

      await sql.query(`
        UPDATE officials 
        SET bio = COALESCE(bio, '') || ' ' || $1
        WHERE id = $2
      `, [extraBioText.trim(), official.id]);

      // 2. Insert Education
      if (bioData.education) {
        for (const edu of bioData.education) {
          const eduId = `edu-${official.id}-${Math.random().toString(36).substr(2, 9)}`;
          await sql.query(`
            INSERT INTO official_education (id, official_id, institution, degree, year_graduated)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
          `, [eduId, official.id, edu.institution, edu.degree, edu.year_graduated]);
        }
      }

      // 3. Insert Career
      if (bioData.career) {
        for (const car of bioData.career) {
          const carId = `car-${official.id}-${Math.random().toString(36).substr(2, 9)}`;
          await sql.query(`
            INSERT INTO official_career_history (id, official_id, organization, role, start_year, end_year)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT DO NOTHING
          `, [carId, official.id, car.organization, car.role, car.start_year, car.end_year]);
        }
      }

      // 4. Insert Achievements
      if (bioData.achievements) {
        for (const ach of bioData.achievements) {
          const achId = `ach-${official.id}-${Math.random().toString(36).substr(2, 9)}`;
          await sql.query(`
            INSERT INTO official_achievements (id, official_id, title, description, year)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT DO NOTHING
          `, [achId, official.id, ach.title, ach.description, ach.year]);
        }
      }
    }

    console.log('✅ Biography Enrichment Completed Successfully.');
  } catch (error) {
    console.error('❌ Biography enrichment process failed:', error);
  } finally {
    await sql.end();
  }
}

main();
