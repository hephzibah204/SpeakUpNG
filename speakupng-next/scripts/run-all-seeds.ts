import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const scriptsToRun = [
  'seed-rich-biographies.ts',
  'seed-more-data.ts',
  'seed-more-national-data.ts',
  'seed-expanded-datasets.ts',
  'seed-roadmap-datasets.ts',
  'seed-promises-projects-incidents.ts',
  'seed-all-governors-projects.ts',
  'seed-projects-data.ts',
  'seed-coalitions.ts',
  'seed-manifestos.ts',
  'seed-factcheck.ts',
  'seed-factchecks.ts',
  'seed-dna-scores.ts',
  'seed-performance.ts',
  'seed-actual-courses.ts',
  'seed-electoral-act-course.ts',
  'seed-more-quizzes.ts'
];

console.log('🚀 Starting Master Seed Sequence...');

for (const script of scriptsToRun) {
  const scriptPath = path.join(__dirname, script);
  if (fs.existsSync(scriptPath)) {
    console.log(`\n======================================================`);
    console.log(`⏳ Running: ${script}`);
    console.log(`======================================================`);
    try {
      execSync(`npx tsx "${scriptPath}"`, { stdio: 'inherit', cwd: path.join(__dirname, '..') });
      console.log(`✅ Finished: ${script}`);
    } catch (err: any) {
      console.error(`❌ Error running ${script}:`, err.message);
      // We continue even if one fails
    }
  } else {
    console.warn(`⚠️ Script not found: ${script}`);
  }
}

console.log('\n🎉 Master Seed Sequence Completed!');
