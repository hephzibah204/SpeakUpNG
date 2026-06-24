import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

function uuidFromString(input: string): string {
  const hex = Buffer.from(input).toString('hex').padEnd(32, '0').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function loadJsonData<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath}`);
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T[];
}

function generateInsertSQL(table: string, rows: Record<string, any>[]): string {
  if (rows.length === 0) return '';

  const columns = Object.keys(rows[0]);
  const valuesList = rows.map(row => {
    const values = columns.map(col => {
      const val = row[col];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
      if (typeof val === 'boolean') return val ? '1' : '0';
      if (Array.isArray(val) || typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
      return String(val);
    });
    return `(${values.join(', ')})`;
  });

  return `INSERT OR REPLACE INTO ${table} (${columns.join(', ')})\nVALUES\n${valuesList.join(',\n')};\n`;
}

function seedOfficials(): string {
  const officials = [
    {
      id: uuidFromString('bola-ahmed-tinubu'),
      full_name: 'Bola Ahmed Tinubu',
      common_name: 'Tinubu',
      role: 'President',
      tier: 'federal_executive',
      state: 'FCT',
      website: 'https://president.gov.ng',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Bola_Tinubu_2023_%28cropped%29.jpg',
      rating_avg: 4.2,
      rating_count: 1245,
      bio: 'President of Nigeria since 2023. Former Governor of Lagos State.',
      status: 'active',
    },
    {
      id: uuidFromString('seyi-makinde'),
      full_name: 'Seyi Makinde',
      common_name: 'Makinde',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Oyo',
      website: 'https://oyostate.gov.ng',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Seyi_Makinde_2023_%28cropped%29.jpg',
      rating_avg: 4.5,
      rating_count: 892,
      bio: 'Governor of Oyo State. Known for infrastructure development and education reforms.',
      status: 'active',
    },
    {
      id: uuidFromString('babajide-sanwo-olu'),
      full_name: 'Babajide Sanwo-Olu',
      common_name: 'Sanwo-Olu',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Lagos',
      website: 'https://lagosstate.gov.ng',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/Babajide_Sanwo-Olu_2023_%28cropped%29.jpg',
      rating_avg: 4.1,
      rating_count: 2156,
      bio: 'Governor of Lagos State. Focused on infrastructure, transportation, and technology.',
      status: 'active',
    },
    {
      id: uuidFromString('nyesom-wike'),
      full_name: 'Nyesom Wike',
      common_name: 'Wike',
      role: 'Minister of FCT',
      tier: 'federal_executive',
      state: 'FCT',
      website: 'https://fct.gov.ng',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/7/71/Nyesom_Ezenwo_Wike.jpg',
      rating_avg: 3.8,
      rating_count: 1567,
      bio: 'Minister of the Federal Capital Territory. Former Governor of Rivers State.',
      status: 'active',
    },
    {
      id: uuidFromString('dapo-abiodun'),
      full_name: 'Dapo Abiodun',
      common_name: 'Abiodun',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Ogun',
      website: 'https://ogunstate.gov.ng',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/3/3b/Dapo_Abiodun.jpg',
      rating_avg: 4.0,
      rating_count: 678,
      bio: 'Governor of Ogun State. Focused on infrastructure development and industrial growth.',
      status: 'active',
    },
    {
      id: uuidFromString('alex-otti'),
      full_name: 'Alex Otti',
      common_name: 'Otti',
      role: 'Governor',
      tier: 'state_executive',
      state: 'Abia',
      website: 'https://abiastate.gov.ng',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/8/8f/Alex_Otti_2023.jpg',
      rating_avg: 4.3,
      rating_count: 456,
      bio: 'Governor of Abia State. Former banker and technocrat.',
      status: 'active',
    },
    {
      id: uuidFromString('efcc'),
      full_name: 'Economic and Financial Crimes Commission',
      common_name: 'EFCC',
      role: 'Law Enforcement Agency',
      tier: 'federal_agency',
      website: 'https://www.efcc.gov.ng',
      rating_avg: 3.5,
      rating_count: 890,
      bio: 'Federal agency responsible for investigating and prosecuting financial crimes.',
      status: 'active',
    },
    {
      id: uuidFromString('icpc'),
      full_name: 'Independent Corrupt Practices Commission',
      common_name: 'ICPC',
      role: 'Anti-Corruption Agency',
      tier: 'federal_agency',
      website: 'https://icpc.gov.ng',
      rating_avg: 3.2,
      rating_count: 567,
      bio: 'Federal agency responsible for combating corruption in the public service.',
      status: 'active',
    },
    {
      id: uuidFromString('nigerian-police'),
      full_name: 'Nigeria Police Force',
      common_name: 'NPF',
      role: 'National Police Service',
      tier: 'federal_agency',
      website: 'https://www.npf.gov.ng',
      rating_avg: 2.8,
      rating_count: 3245,
      bio: 'Principal law enforcement agency in Nigeria.',
      status: 'active',
    },
    {
      id: uuidFromString('nigerian-railway'),
      full_name: 'Nigerian Railway Corporation',
      common_name: 'NRC',
      role: 'Rail Transport',
      tier: 'federal_agency',
      website: 'https://nrc.gov.ng',
      rating_avg: 3.7,
      rating_count: 345,
      bio: 'Federal agency responsible for railway transportation in Nigeria.',
      status: 'active',
    },
  ];

  return generateInsertSQL('officials', officials);
}

function seedPoliticians(): string {
  const politicians = [
    {
      id: uuidFromString('peter-gregory-obi'),
      full_name: 'Peter Gregory Obi',
      common_name: 'Peter Obi',
      party: 'LP',
      aspiration_title: 'Presidential Aspirant',
      aspiring_for: 'President of Nigeria',
      previous_offices: 'Governor of Anambra State (2006-2014)',
      wiki_title: 'Peter_Obi',
      wiki_url: 'https://en.wikipedia.org/wiki/Peter_Obi',
      bio: 'Prominent Nigerian politician and former Governor of Anambra State. Known for his frugal governance and economic reforms.',
      profile_bio: 'A transformative leader with a vision for inclusive development and good governance.',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Peter_Obi_2023.jpg',
      aliases: JSON.stringify(['Peter Obi', 'Mr Peter Obi', 'H.E. Peter Obi']),
      social_links: JSON.stringify({ twitter: '@peterobi' }),
      source_urls: JSON.stringify(['https://en.wikipedia.org/wiki/Peter_Obi']),
      source_notes: 'Former Anambra State governor',
      priority: 100,
      is_active: true,
    },
    {
      id: uuidFromString('rabiu-musa-kwankwaso'),
      full_name: 'Rabiu Musa Kwankwaso',
      common_name: 'Kwankwaso',
      party: 'NDC',
      aspiration_title: 'Presidential Aspirant',
      aspiring_for: 'President of Nigeria',
      previous_offices: 'Governor of Kano State (1999-2003, 2011-2015)',
      wiki_title: 'Rabiu_Kwankwaso',
      wiki_url: 'https://en.wikipedia.org/wiki/Rabiu_Kwankwaso',
      bio: 'Prominent Nigerian politician and former Governor of Kano State. Founder of the Kwankwasiyya movement.',
      profile_bio: 'A seasoned politician with strong grassroots support in Northern Nigeria.',
      photo_url: 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Rabiu_Kwankwaso_2023.jpg',
      aliases: JSON.stringify(['Rabiu Kwankwaso', 'R. M. Kwankwaso']),
      social_links: JSON.stringify({ twitter: '@kwankwasorm' }),
      source_urls: JSON.stringify(['https://en.wikipedia.org/wiki/Rabiu_Kwankwaso']),
      priority: 90,
      is_active: true,
    },
    {
      id: uuidFromString('atiku-abubakar'),
      full_name: 'Atiku Abubakar',
      common_name: 'Atiku',
      party: 'PDP',
      aspiration_title: 'Presidential Aspirant',
      aspiring_for: 'President of Nigeria',
      previous_offices: 'Vice President of Nigeria (1999-2007)',
      wiki_title: 'Atiku_Abubakar',
      wiki_url: 'https://en.wikipedia.org/wiki/Atiku_Abubakar',
      bio: 'Former Vice President of Nigeria and perennial presidential candidate.',
      profile_bio: 'A seasoned statesman and business leader with decades of political experience.',
      aliases: JSON.stringify(['Atiku Abubakar', 'Atiku', 'Turakin Adamawa']),
      social_links: JSON.stringify({ twitter: '@atiku' }),
      source_urls: JSON.stringify(['https://en.wikipedia.org/wiki/Atiku_Abubakar']),
      priority: 85,
      is_active: true,
    },
    {
      id: uuidFromString('nuhu-ribadu'),
      full_name: 'Nuhu Ribadu',
      common_name: 'Ribadu',
      party: 'APC',
      aspiration_title: 'Political Leader',
      aspiring_for: 'National Security Advisor',
      previous_offices: 'Chairman of EFCC (2003-2007)',
      wiki_title: 'Nuhu_Ribadu',
      wiki_url: 'https://en.wikipedia.org/wiki/Nuhu_Ribadu',
      bio: 'Former Chairman of the Economic and Financial Crimes Commission (EFCC).',
      profile_bio: 'An anti-corruption crusader and legal expert.',
      aliases: JSON.stringify(['Nuhu Ribadu', 'Mallam Ribadu']),
      social_links: JSON.stringify({ twitter: '@nuhuribadu' }),
      source_urls: JSON.stringify(['https://en.wikipedia.org/wiki/Nuhu_Ribadu']),
      priority: 70,
      is_active: true,
    },
  ];

  return generateInsertSQL('politicians', politicians);
}

function seedNewsSources(): string {
  const sources = [
    {
      id: uuidFromString('bbc-news'),
      name: 'BBC News',
      home_url: 'https://www.bbc.com',
      feed_url: 'https://feeds.bbci.co.uk/news/rss.xml',
      ingest_type: 'rss',
      credibility_tier: 'tier1',
      is_active: true,
      max_fetch_kb: 512,
    },
    {
      id: uuidFromString('punch-newspapers'),
      name: 'Punch Newspapers',
      home_url: 'https://punchng.com',
      feed_url: 'https://punchng.com/feed/',
      ingest_type: 'rss',
      credibility_tier: 'tier2',
      is_active: true,
      max_fetch_kb: 1024,
    },
    {
      id: uuidFromString('vanguard'),
      name: 'Vanguard',
      home_url: 'https://www.vanguardngr.com',
      feed_url: 'https://www.vanguardngr.com/feed/',
      ingest_type: 'rss',
      credibility_tier: 'tier2',
      is_active: true,
      max_fetch_kb: 1024,
    },
    {
      id: uuidFromString('the-nation'),
      name: 'The Nation',
      home_url: 'https://thenationonlineng.net',
      feed_url: 'https://thenationonlineng.net/feed/',
      ingest_type: 'rss',
      credibility_tier: 'tier2',
      is_active: true,
      max_fetch_kb: 1024,
    },
  ];

  return generateInsertSQL('news_sources', sources);
}

function seedPublicRatings(): string {
  const ratings = [
    { id: uuidFromString('rating-1'), official_id: uuidFromString('bola-ahmed-tinubu'), overall: 4.2, accountability: 4, service: 4, transparency: 3, responsiveness: 3, power: 5, security: 4, economic_stability: 4, education: 4, healthcare: 4, reviewer_state: 'Lagos', review_text: 'Strong leadership but needs more transparency.', device_hash: 'dev-sample-1' },
    { id: uuidFromString('rating-2'), official_id: uuidFromString('bola-ahmed-tinubu'), overall: 4.0, accountability: 4, service: 4, transparency: 3, responsiveness: 4, power: 5, security: 3, economic_stability: 4, education: 4, healthcare: 4, reviewer_state: 'FCT', review_text: 'Economic reforms are promising but slow.', device_hash: 'dev-sample-2' },
    { id: uuidFromString('rating-3'), official_id: uuidFromString('seyi-makinde'), overall: 4.8, accountability: 5, service: 5, transparency: 4, responsiveness: 5, power: 4, security: 5, economic_stability: 5, education: 5, healthcare: 5, reviewer_state: 'Oyo', review_text: 'Excellent governor! Visible development across the state.', device_hash: 'dev-sample-3' },
    { id: uuidFromString('rating-4'), official_id: uuidFromString('seyi-makinde'), overall: 4.5, accountability: 4, service: 5, transparency: 4, responsiveness: 5, power: 4, security: 5, economic_stability: 4, education: 5, healthcare: 4, reviewer_state: 'Oyo', review_text: 'Best governor Oyo has ever had.', device_hash: 'dev-sample-4' },
    { id: uuidFromString('rating-5'), official_id: uuidFromString('babajide-sanwo-olu'), overall: 4.0, accountability: 4, service: 4, transparency: 3, responsiveness: 3, power: 4, security: 4, economic_stability: 4, education: 4, healthcare: 4, reviewer_state: 'Lagos', review_text: 'Good on infrastructure. Traffic still a problem.', device_hash: 'dev-sample-5' },
    { id: uuidFromString('rating-6'), official_id: uuidFromString('babajide-sanwo-olu'), overall: 4.2, accountability: 4, service: 4, transparency: 4, responsiveness: 4, power: 4, security: 4, economic_stability: 4, education: 5, healthcare: 4, reviewer_state: 'Lagos', review_text: 'The rail project is transformative for Lagos.', device_hash: 'dev-sample-6' },
    { id: uuidFromString('rating-7'), official_id: uuidFromString('nyesom-wike'), overall: 3.5, accountability: 3, service: 4, transparency: 3, responsiveness: 3, power: 5, security: 3, economic_stability: 3, education: 3, healthcare: 4, reviewer_state: 'Rivers', review_text: 'Strong willed but controversial.', device_hash: 'dev-sample-7' },
    { id: uuidFromString('rating-8'), official_id: uuidFromString('efcc'), overall: 3.6, accountability: 3, service: 4, transparency: 3, responsiveness: 3, power: 4, security: 4, economic_stability: 3, education: 3, healthcare: 3, reviewer_state: 'FCT', review_text: 'Doing important work but needs more independence.', device_hash: 'dev-sample-8' },
    { id: uuidFromString('rating-9'), official_id: uuidFromString('nigerian-police'), overall: 2.5, accountability: 2, service: 2, transparency: 2, responsiveness: 2, power: 4, security: 3, economic_stability: 2, education: 2, healthcare: 2, reviewer_state: 'Lagos', review_text: 'Needs major reform. Harassment is common.', device_hash: 'dev-sample-9' },
    { id: uuidFromString('rating-10'), official_id: uuidFromString('alex-otti'), overall: 4.5, accountability: 5, service: 4, transparency: 4, responsiveness: 5, power: 4, security: 5, economic_stability: 4, education: 4, healthcare: 5, reviewer_state: 'Abia', review_text: 'Great start. Visible changes in Abia.', device_hash: 'dev-sample-10' },
  ];

  return generateInsertSQL('public_ratings', ratings);
}

function seedPoliticianRatings(): string {
  const ratings = [
    { id: uuidFromString('pol-rating-1'), politician_id: uuidFromString('peter-gregory-obi'), device_hash: 'dev-sample-1', overall: 4.8, accountability: 5, service: 5, transparency: 5, responsiveness: 4, power: 4, security: 5, economic_stability: 5, education: 5, healthcare: 5, review_text: 'The most credible candidate for Nigeria.' },
    { id: uuidFromString('pol-rating-2'), politician_id: uuidFromString('atiku-abubakar'), device_hash: 'dev-sample-2', overall: 3.5, accountability: 3, service: 4, transparency: 3, responsiveness: 3, power: 5, security: 3, economic_stability: 4, education: 3, healthcare: 3, review_text: 'Experienced but needs to connect with youth.' },
    { id: uuidFromString('pol-rating-3'), politician_id: uuidFromString('peter-gregory-obi'), device_hash: 'dev-sample-3', overall: 4.6, accountability: 5, service: 5, transparency: 4, responsiveness: 5, power: 4, security: 4, economic_stability: 5, education: 5, healthcare: 4, review_text: 'A new kind of Nigerian leader!' },
  ];

  return generateInsertSQL('politician_ratings', ratings);
}

function seedOfficialPromises(): string {
  const promises = [
    { id: uuidFromString('promise-1'), official_id: uuidFromString('bola-ahmed-tinubu'), promise_title: 'Economic Revival', promise_detail: 'Revive the Nigerian economy through fiscal and monetary reforms.', promise_category: 'Economy', promise_date: '2023-05-29', status: 'in_progress', progress_percent: 40 },
    { id: uuidFromString('promise-2'), official_id: uuidFromString('bola-ahmed-tinubu'), promise_title: 'Security Improvement', promise_detail: 'Improve national security and combat insurgency.', promise_category: 'Security', promise_date: '2023-05-29', status: 'in_progress', progress_percent: 35 },
    { id: uuidFromString('promise-3'), official_id: uuidFromString('seyi-makinde'), promise_title: 'Education Reform', promise_detail: 'Improve quality of education in Oyo State.', promise_category: 'Education', promise_date: '2023-05-29', status: 'fulfilled', progress_percent: 100 },
    { id: uuidFromString('promise-4'), official_id: uuidFromString('babajide-sanwo-olu'), promise_title: 'Lagos Rail Mass Transit', promise_detail: 'Complete the Lagos rail mass transit system.', promise_category: 'Infrastructure', promise_date: '2023-01-01', status: 'in_progress', progress_percent: 60 },
    { id: uuidFromString('promise-5'), politician_id: uuidFromString('peter-gregory-obi'), promise_title: 'Production Economy', promise_detail: 'Shift Nigeria from consumption to production economy.', promise_category: 'Economy', promise_date: '2022-09-01', status: 'disputed', progress_percent: 0 },
  ];

  return generateInsertSQL('official_promises', promises);
}

async function main() {
  const args = process.argv.slice(2);
  let filePath = args[0];
  if (!filePath) {
    filePath = path.join(__dirname, '..', 'seed-data.sql');
  }

  console.log('Generating seed data...');
  console.log(`Output file: ${filePath}`);

  const sqlParts: string[] = [
    '-- ============================================',
    '-- Seed data for evote.ng D1 database',
    '-- Generated on ' + new Date().toISOString(),
    '-- ============================================',
    '',
    '-- Officials',
    seedOfficials(),
    '',
    '-- Politicians',
    seedPoliticians(),
    '',
    '-- News Sources',
    seedNewsSources(),
    '',
    '-- Public Ratings',
    seedPublicRatings(),
    '',
    '-- Politician Ratings',
    seedPoliticianRatings(),
    '',
    '-- Official Promises',
    seedOfficialPromises(),
    '',
  ];

  const sql = sqlParts.join('\n');
  fs.writeFileSync(filePath, sql, 'utf-8');
  console.log(`Seed data written to: ${filePath}`);
  console.log(`Total: ${(sql.match(/INSERT OR REPLACE/g) || []).length} INSERT statements`);

  const officialCount = (sql.match(/INSERT OR REPLACE INTO officials/g) || []).length;
  const politicianCount = (sql.match(/INSERT OR REPLACE INTO politicians/g) || []).length;
  const ratingCount = (sql.match(/INSERT OR REPLACE INTO public_ratings/g) || []).length;
  const polRatingCount = (sql.match(/INSERT OR REPLACE INTO politician_ratings/g) || []).length;
  const promiseCount = (sql.match(/INSERT OR REPLACE INTO official_promises/g) || []).length;
  console.log(`\nSummary:`);
  console.log(`  Officials: ${officialCount * 10} rows`);
  console.log(`  Politicians: ${politicianCount * 4} rows`);
  console.log(`  Public Ratings: ${ratingCount * 10} rows`);
  console.log(`  Politician Ratings: ${polRatingCount * 3} rows`);
  console.log(`  Promises: ${promiseCount * 5} rows`);
  console.log(`\nTo apply the seed data:`);
  console.log(`  wrangler d1 execute DB --file=${filePath}`);
}

main().catch(console.error);
