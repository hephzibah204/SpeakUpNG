import * as fs from 'fs';
import * as path from 'path';

// Load environment variables manually
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      const key = match[1];
      let value = (match[2] || '').trim();
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
      process.env[key] = value;
    }
  }
}

async function main() {
  const { queryAll } = await import('../lib/db');
  try {
    const pols = await queryAll(`SELECT * FROM politicians WHERE full_name LIKE '%Peter%' OR full_name LIKE '%Obi%'`);
    console.log('Politicians matching Peter/Obi:');
    console.log(JSON.stringify(pols, null, 2));

    const offs = await queryAll(`SELECT * FROM officials WHERE full_name LIKE '%Peter%' OR full_name LIKE '%Obi%'`);
    console.log('Officials matching Peter/Obi:');
    console.log(JSON.stringify(offs, null, 2));
  } catch (err) {
    console.error(err);
  }
}

main();
