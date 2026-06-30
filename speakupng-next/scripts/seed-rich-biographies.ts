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
  console.log('Seeding rich biographical data (education, career, achievements) for key officials...');
  try {
    // Dynamically resolve IDs
    const tinubuId = await getOfficialId('Tinubu');
    const sanwoOluId = await getOfficialId('Sanwo-Olu');
    const makindeId = await getOfficialId('Seyi Makinde');
    const ottiId = await getOfficialId('Alex Otti');
    const abiodunId = await getOfficialId('Dapo Abiodun');
    const wikeId = await getOfficialId('Wike');

    console.log(`Resolved IDs - Tinubu: ${tinubuId}, Sanwo-Olu: ${sanwoOluId}, Makinde: ${makindeId}, Otti: ${ottiId}`);

    const educations = [];
    const careers = [];
    const achievements = [];

    // 1. Tinubu Education & Career
    if (tinubuId) {
      educations.push(
        { id: randomUUID(), official_id: tinubuId, institution: 'Chicago State University', degree: 'Bachelor of Science in Business Administration', year: 1979 }
      );
      careers.push(
        { id: randomUUID(), official_id: tinubuId, organization: 'Mobil Producing Nigeria', role: 'Treasurer', start_year: 1983, end_year: 1992 },
        { id: randomUUID(), official_id: tinubuId, organization: 'Lagos State Government', role: 'Executive Governor', start_year: 1999, end_year: 2007 }
      );
      achievements.push(
        { id: randomUUID(), official_id: tinubuId, title: 'Lagos Internally Generated Revenue (IGR) Reform', description: 'Re-engineered the tax collection system in Lagos, growing state IGR from N600 million monthly in 1999 to over N8 billion monthly by 2007.', year: 2003 }
      );
    }

    // 2. Sanwo-Olu Education & Career
    if (sanwoOluId) {
      educations.push(
        { id: randomUUID(), official_id: sanwoOluId, institution: 'University of Lagos', degree: 'B.Sc in Surveying', year: 1989 },
        { id: randomUUID(), official_id: sanwoOluId, institution: 'University of Lagos', degree: 'MBA in General Management', year: 1998 },
        { id: randomUUID(), official_id: sanwoOluId, institution: 'London Business School', degree: 'Executive Education', year: 2012 }
      );
      achievements.push(
        { id: randomUUID(), official_id: sanwoOluId, title: 'Lagos Light Rail Projects Delivery', description: 'Successfully completed and commissioned the infrastructure for both the Blue Line (Phase 1) and Red Line (Phase 1) rail projects.', year: 2024 }
      );
    }

    // 3. Seyi Makinde Education & Career
    if (makindeId) {
      educations.push(
        { id: randomUUID(), official_id: makindeId, institution: 'University of Lagos', degree: 'B.Sc in Electrical Engineering', year: 1990 },
        { id: randomUUID(), official_id: makindeId, institution: 'Lagos Business School', degree: 'Executive Education', year: 2005 }
      );
      careers.push(
        { id: randomUUID(), official_id: makindeId, organization: 'Makon Group', role: 'Group Managing Director', start_year: 1997, end_year: 2018 }
      );
      achievements.push(
        { id: randomUUID(), official_id: makindeId, title: 'LAUTECH Ownership Resolution', description: 'Successfully resolved the joint ownership dispute of LAUTECH with Osun State, making it solely owned by Oyo State.', year: 2020 }
      );
    }

    // 4. Alex Otti Education & Career
    if (ottiId) {
      educations.push(
        { id: randomUUID(), official_id: ottiId, institution: 'University of Port Harcourt', degree: 'B.Sc in Economics (First Class)', year: 1988 },
        { id: randomUUID(), official_id: ottiId, institution: 'University of Lagos', degree: 'Master of Science in Economics', year: 1990 }
      );
      careers.push(
        { id: randomUUID(), official_id: ottiId, organization: 'Diamond Bank PLC', role: 'Group Managing Director / CEO', start_year: 2011, end_year: 2014 }
      );
    }

    // Seed Educations
    for (const edu of educations) {
      await sql.query(`
        INSERT INTO official_education (id, official_id, institution, degree, year)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          institution = EXCLUDED.institution,
          degree = EXCLUDED.degree,
          year = EXCLUDED.year
      `, [edu.id, edu.official_id, edu.institution, edu.degree, edu.year]);
    }

    // Seed Careers
    for (const car of careers) {
      await sql.query(`
        INSERT INTO official_career_history (id, official_id, organization, role, start_year, end_year)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          organization = EXCLUDED.organization,
          role = EXCLUDED.role,
          start_year = EXCLUDED.start_year,
          end_year = EXCLUDED.end_year
      `, [car.id, car.official_id, car.organization, car.role, car.start_year, car.end_year]);
    }

    // Seed Achievements
    for (const ach of achievements) {
      await sql.query(`
        INSERT INTO official_achievements (id, official_id, title, description, year)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (id) DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          year = EXCLUDED.year
      `, [ach.id, ach.official_id, ach.title, ach.description, ach.year]);
    }

    console.log(`✅ Rich biographies seeded successfully for resolved officials.`);
  } catch (error) {
    console.error('❌ Biography seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
