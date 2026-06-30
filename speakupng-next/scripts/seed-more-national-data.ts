import { createPool } from '@vercel/postgres';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const sql = createPool({
  connectionString: process.env.POSTGRES_URL || process.env.evote_POSTGRES_URL,
});

async function main() {
  console.log('Expanding civic datasets with comprehensive national data...');
  try {
    // 1. Seed All 36 States + FCT
    console.log('Seeding all 36 states...');
    const states = [
      { id: 'state-001', name: 'Abia', code: 'AB', region: 'South-East' },
      { id: 'state-002', name: 'Adamawa', code: 'AD', region: 'North-East' },
      { id: 'state-003', name: 'Akwa Ibom', code: 'AK', region: 'South-South' },
      { id: 'state-004', name: 'Anambra', code: 'AN', region: 'South-East' },
      { id: 'state-005', name: 'Bauchi', code: 'BA', region: 'North-East' },
      { id: 'state-006', name: 'Bayelsa', code: 'BY', region: 'South-South' },
      { id: 'state-007', name: 'Benue', code: 'BE', region: 'North-Central' },
      { id: 'state-008', name: 'Borno', code: 'BO', region: 'North-East' },
      { id: 'state-009', name: 'Cross River', code: 'CR', region: 'South-South' },
      { id: 'state-010', name: 'Delta', code: 'DE', region: 'South-South' },
      { id: 'state-011', name: 'Ebonyi', code: 'EB', region: 'South-East' },
      { id: 'state-012', name: 'Edo', code: 'ED', region: 'South-South' },
      { id: 'state-013', name: 'Ekiti', code: 'EK', region: 'South-West' },
      { id: 'state-014', name: 'Enugu', code: 'EN', region: 'South-East' },
      { id: 'state-015', name: 'FCT', code: 'FC', region: 'North-Central' },
      { id: 'state-016', name: 'Gombe', code: 'GO', region: 'North-East' },
      { id: 'state-017', name: 'Imo', code: 'IM', region: 'South-East' },
      { id: 'state-018', name: 'Jigawa', code: 'JI', region: 'North-West' },
      { id: 'state-019', name: 'Kaduna', code: 'KD', region: 'North-West' },
      { id: 'state-020', name: 'Kano', code: 'KN', region: 'North-West' },
      { id: 'state-021', name: 'Katsina', code: 'KT', region: 'North-West' },
      { id: 'state-022', name: 'Kebbi', code: 'KE', region: 'North-West' },
      { id: 'state-023', name: 'Kogi', code: 'KO', region: 'North-Central' },
      { id: 'state-024', name: 'Kwara', code: 'KW', region: 'North-Central' },
      { id: 'state-025', name: 'Lagos', code: 'LA', region: 'South-West' },
      { id: 'state-026', name: 'Nasarawa', code: 'NA', region: 'North-Central' },
      { id: 'state-027', name: 'Niger', code: 'NI', region: 'North-Central' },
      { id: 'state-028', name: 'Ogun', code: 'OG', region: 'South-West' },
      { id: 'state-029', name: 'Ondo', code: 'ON', region: 'South-West' },
      { id: 'state-030', name: 'Osun', code: 'OS', region: 'South-West' },
      { id: 'state-031', name: 'Oyo', code: 'OY', region: 'South-West' },
      { id: 'state-032', name: 'Plateau', code: 'PL', region: 'North-Central' },
      { id: 'state-033', name: 'Rivers', code: 'RV', region: 'South-South' },
      { id: 'state-034', name: 'Sokoto', code: 'SO', region: 'North-West' },
      { id: 'state-035', name: 'Taraba', code: 'TA', region: 'North-East' },
      { id: 'state-036', name: 'Yobe', code: 'YO', region: 'North-East' },
      { id: 'state-037', name: 'Zamfara', code: 'ZA', region: 'North-West' }
    ];

    for (const state of states) {
      await sql.query(`
        INSERT INTO states (id, name, code, region)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (name) DO UPDATE SET
          code = EXCLUDED.code,
          region = EXCLUDED.region
      `, [state.id, state.name, state.code, state.region]);
    }

    // 2. Seed State-Level Budget Allocations (2024)
    console.log('Seeding state budget allocations...');
    const stateBudgets = [
      {
        id: 'bud-lag-edu-2024',
        year: 2024,
        entity_type: 'state',
        entity_name: 'Lagos State',
        sector: 'Education',
        amount_allocated: 251000000000, // 251 Billion NGN
        amount_released: 180000000000,
        description: 'Lagos State budgetary allocation for school rehabilitations, teacher training, and secondary education.'
      },
      {
        id: 'bud-lag-health-2024',
        year: 2024,
        entity_type: 'state',
        entity_name: 'Lagos State',
        sector: 'Health',
        amount_allocated: 156000000000,
        amount_released: 110000000000,
        description: 'Lagos State health budget for upgrades of General Hospitals and primary health centers.'
      },
      {
        id: 'bud-riv-infra-2024',
        year: 2024,
        entity_type: 'state',
        entity_name: 'Rivers State',
        sector: 'Infrastructure',
        amount_allocated: 320000000000, // 320 Billion NGN
        amount_released: 210000000000,
        description: 'Rivers State budget for flyovers, dualization of roads, and coastal highway connections.'
      }
    ];

    for (const bud of stateBudgets) {
      await sql.query(`
        INSERT INTO budget_allocations (id, year, entity_type, entity_name, sector, amount_allocated, amount_released, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (id) DO UPDATE SET
          amount_allocated = EXCLUDED.amount_allocated,
          amount_released = EXCLUDED.amount_released,
          description = EXCLUDED.description
      `, [bud.id, bud.year, bud.entity_type, bud.entity_name, bud.sector, bud.amount_allocated, bud.amount_released, bud.description]);
    }

    // 3. Seed Prominent National Bills
    console.log('Seeding national legislative bills...');
    const bills = [
      {
        id: 'bill-elect-2022',
        title: 'Electoral Act (Amendment) Bill 2022',
        status: 'assented',
        category: 'Elections',
        full_text: 'An Act to regulate the conduct of Federal, State and Area Council elections and for related matters.',
        date_introduced: '2021-06-15'
      },
      {
        id: 'bill-student-loan-2024',
        title: 'Access to Higher Education (Repeal and Re-enactment) Bill 2024',
        status: 'assented',
        category: 'Education',
        full_text: 'An Act to provide interest-free loans to Nigerians seeking higher education in vocational and tertiary institutions.',
        date_introduced: '2024-03-12'
      }
    ];

    for (const bill of bills) {
      await sql.query(`
        INSERT INTO bills (id, title, status, category, full_text, date_introduced)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          category = EXCLUDED.category,
          full_text = EXCLUDED.full_text,
          date_introduced = EXCLUDED.date_introduced
      `, [bill.id, bill.title, bill.status, bill.category, bill.full_text, bill.date_introduced]);
    }

    console.log('✅ Expanded national datasets seeded successfully.');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await sql.end();
  }
}

main();
