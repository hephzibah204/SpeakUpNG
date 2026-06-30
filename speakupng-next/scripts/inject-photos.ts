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

const PHOTO_MAPPING: Record<string, string> = {
  // Politicians
  "Peter Gregory Obi": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Peter_Obi_2023.jpg",
  "Kayode Fayemi": "https://upload.wikimedia.org/wikipedia/commons/a/ad/Dr._Kayode_Fayemi.jpg",

  // Governors & Ministers
  "Seyi Makinde": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Governor_Seyi_Makinde.jpg",
  "Ademola Adeleke": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Ademola_Adeleke.jpg",
  "Abba Kabir Yusuf": "https://upload.wikimedia.org/wikipedia/commons/5/53/Abba_Kabir_Yusuf.jpg",
  "Bala Mohammed": "https://upload.wikimedia.org/wikipedia/commons/6/69/Bala_Mohammed.jpg",
  "Simon Lalong": "https://upload.wikimedia.org/wikipedia/commons/7/77/Simon_Lalong.jpg",
  "Bello Matawalle": "https://upload.wikimedia.org/wikipedia/commons/1/1a/Bello_Matawalle.jpg",
  "Aishatu Dahiru": "https://upload.wikimedia.org/wikipedia/commons/4/4f/Aishatu_Dahiru_Ahmed.jpg",
  "Uju Kennedy-Ohanenye": "https://upload.wikimedia.org/wikipedia/commons/2/23/Uju_Kennedy-Ohanenye.png",
  "Ekperikpe Ekpo": "https://upload.wikimedia.org/wikipedia/commons/3/30/Ekperikpe_Ekpo.png",
  "Lola Ade-John": "https://upload.wikimedia.org/wikipedia/commons/7/72/Lola_Ade-John.png",
  "Abubakar Momoh": "https://upload.wikimedia.org/wikipedia/commons/f/ff/Abubakar_Momoh.png",
  "Nentawe Yilwatda": "https://upload.wikimedia.org/wikipedia/commons/e/e6/Nentawe_Yilwatda.png"
};

async function main() {
  const { queryRun } = await import('../lib/db');
  try {
    console.log('Starting photo injection...');
    
    // Update Politicians
    for (const [name, url] of Object.entries(PHOTO_MAPPING)) {
      const polResult = await queryRun(
        `UPDATE politicians SET photo_url = ? WHERE full_name = ?`,
        [url, name]
      );
      if (polResult.changes > 0) {
        console.log(`Updated politician ${name} with photo.`);
      }

      const offResult = await queryRun(
        `UPDATE officials SET photo_url = ? WHERE full_name = ?`,
        [url, name]
      );
      if (offResult.changes > 0) {
        console.log(`Updated official ${name} with photo.`);
      }
    }

    console.log('Photo injection completed successfully.');
  } catch (err) {
    console.error('Error injecting photos:', err);
  }
}

main();
