
import { getAnonId, TIER_LABELS, TIER_COLORS, renderStars, showToast, fmt } from './supabase-client.js';
import { getDeviceHash } from './device-fingerprint.js';

// ── STATE ──
const S = {
  officials: [], filtered: [], page: 1, perPage: 25,
  tier: '', search: '', state: '', sort: 'rating_count', type: 'all',
  currentOfficial: null,
  mainStar: 0, catStars: {}, anonOn: true, reportAnonOn: true, alreadyRated: false,
};
const STAR_LABELS = ['','Very Poor','Poor','Average','Good','Excellent'];
const anonId = getAnonId();
const CATEGORY_KEYS = ['accountability','service','transparency','responsiveness','power','security','economic_stability','education','healthcare'];
const CATEGORY_LABELS_DEFAULT = {
  accountability: 'Accountability',
  service: 'Service Delivery',
  transparency: 'Transparency',
  responsiveness: 'Responsiveness',
  power: 'Power',
  security: 'Security',
  economic_stability: 'Economic Stability',
  education: 'Education',
  healthcare: 'Healthcare',
};
const CATEGORY_LABELS_POWER = {
  accountability: 'Billing Fairness',
  service: 'Fault Resolution',
  transparency: 'Communication Transparency',
  responsiveness: 'Outage Response',
  power: 'Supply Reliability',
  security: 'Grid Security',
  economic_stability: 'Tariff Affordability',
  education: 'Customer Communication',
  healthcare: 'Safety Compliance',
};
const CATEGORY_PROFILES = {
  general: { labels: CATEGORY_LABELS_DEFAULT, visible: CATEGORY_KEYS },
  president: {
    labels: {
      ...CATEGORY_LABELS_DEFAULT,
      economic_stability: 'Economy / Inflation',
      service: 'Jobs / Employment',
      security: 'Security',
      power: 'Power',
      responsiveness: 'Foreign Policy',
      accountability: 'Governance Delivery',
    },
    visible: ['accountability','transparency','economic_stability','service','security','power','responsiveness'],
  },
  governor: {
    labels: {
      ...CATEGORY_LABELS_DEFAULT,
      power: 'Roads',
      education: 'Education',
      healthcare: 'Health',
      security: 'Security',
      service: 'Waste Management',
      responsiveness: 'Transport',
    },
    visible: ['accountability','transparency','power','education','healthcare','security','service','responsiveness'],
  },
  local: {
    labels: {
      ...CATEGORY_LABELS_DEFAULT,
      service: 'Sanitation',
      power: 'Roads',
      economic_stability: 'Markets',
      healthcare: 'Primary Health',
      responsiveness: 'Water',
    },
    visible: ['accountability','transparency','service','power','economic_stability','healthcare','responsiveness'],
  },
  dept_generic: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Mandate Delivery', responsiveness:'Stakeholder Responsiveness', economic_stability:'Budget Efficiency' },
    visible: ['accountability','service','transparency','responsiveness','economic_stability'],
  },
  power: { labels: CATEGORY_LABELS_POWER, visible: ['accountability','service','transparency','responsiveness','power','security','economic_stability'] },
  education_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Learning Delivery', education:'Learning Outcomes', economic_stability:'Funding Sustainability', responsiveness:'Stakeholder Engagement' },
    visible: ['accountability','service','transparency','responsiveness','education','economic_stability'],
  },
  health_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Care Quality', healthcare:'Public Health Outcomes', responsiveness:'Emergency Response' },
    visible: ['accountability','service','transparency','responsiveness','healthcare','security'],
  },
  economy_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Policy Execution', economic_stability:'Macro Stability', power:'Business Climate' },
    visible: ['accountability','service','transparency','responsiveness','economic_stability','power'],
  },
  security_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Operational Delivery', security:'Public Safety Outcomes', responsiveness:'Incident Response' },
    visible: ['accountability','service','transparency','responsiveness','security'],
  },
  infrastructure_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Project Delivery', power:'Infrastructure Quality', economic_stability:'Value for Money' },
    visible: ['accountability','service','transparency','responsiveness','power','economic_stability'],
  },
  agriculture_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Farmer Support', economic_stability:'Food Price Stability', security:'Food Security' },
    visible: ['accountability','service','transparency','responsiveness','economic_stability','security'],
  },
  transport_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service:'Transport Service Reliability', power:'Network Quality', security:'Travel Safety' },
    visible: ['accountability','service','transparency','responsiveness','power','security'],
  },
};
const AGENCY_TIERS = new Set(['federal_agency', 'state_agency']);
let ratedOfficialsCache = null;
let ratingsAggCache = null;
const FEATURED_LEADER_FULL_NAMES = [
  'Bola Ahmed Tinubu',
  'Seyi Makinde',
  'Babajide Sanwo-Olu',
  'Nyesom Wike',
  'Dapo Abiodun',
  'Alex Otti',
  'Godswill Akpabio',
  'Wale Edun',
];
const FEATURED_DEFENSE_ROLE_MATCH = '%minister%defen%';

function invalidateRatedOfficialsCache() {
  ratedOfficialsCache = null;
}

function invalidateRatingsAggCache() {
  ratingsAggCache = null;
}

async function getRatingsAggregates() {
  if (ratingsAggCache instanceof Map) return ratingsAggCache;
  
  const map = new Map();
  try {
    const res = await fetch('/api/ratings?limit=10000');
    if (!res.ok) throw new Error('API error');
    const { ratings } = await res.json();
    
    for (const row of ratings || []) {
      const id = row?.official_id;
      if (!id) continue;
      const overall = Number(row?.overall || 0);
      const prev = map.get(id) || { count: 0, sum: 0, avg: 0 };
      prev.count += 1;
      prev.sum += overall;
      map.set(id, prev);
    }
    for (const agg of map.values()) {
      agg.avg = agg.count ? (agg.sum / agg.count) : 0;
    }
    ratingsAggCache = map;
  } catch (err) {
    console.error(err);
  }
  return map;
}

async function enrichOfficialsWithAggregates(list) {
  const aggMap = await getRatingsAggregates();
  for (const o of list || []) {
    const agg = aggMap.get(o.id);
    if (!agg) continue;
    o.rating_count = agg.count || 0;
    o.rating_avg = agg.avg || 0;
  }
}

function isPowerSectorOfficial(o) {
  const hay = `${o?.full_name || ''} ${o?.common_name || ''} ${o?.role || ''} ${o?.website || ''}`.toLowerCase();
  return /electricity|disco|distribution company|transmission company of nigeria|nerc|nbet|rea|nemsa|niso|ikeja electric|eko electricity|ibedc|aedc|phed|kaedco|kedco|yedc|eedc|jos electric|benin electricity/.test(hay);
}

function detectDepartmentSector(role) {
  if (/education|school|university|polytechnic|teaching/.test(role)) return 'education';
  if (/health|medical|hospital|phc|nphcda|nafdac|aids/.test(role)) return 'health';
  if (/finance|budget|econom|revenue|tax|customs|trade|industry|investment|fiscal|cbn|firs|sec/.test(role)) return 'economy';
  if (/interior|defen[cs]e|police|security|intelligence|immigration|nscdc|ndlea|military/.test(role)) return 'security';
  if (/works|housing|infrastructure|urban|water resources|environment/.test(role)) return 'infrastructure';
  if (/agric|livestock|food/.test(role)) return 'agriculture';
  if (/transport|aviation|marine|maritime|rail|ports|waterways/.test(role)) return 'transport';
  return '';
}

function detectCategoryProfile(o) {
  const role = `${o?.role || ''}`.toLowerCase();
  const tier = `${o?.tier || ''}`.toLowerCase();

  if (isPowerSectorOfficial(o)) return 'power';
  if (/president|vice president/.test(role)) return 'president';
  if (tier === 'state_executive' && /governor|deputy governor/.test(role)) return 'governor';
  if (tier === 'local_government') return 'local';

  const isDepartmentOffice = /minister|commissioner|director general|\bdg\b|managing director|\bmd\b|ceo|executive secretary|chairman|comptroller-general|inspector general|administrator/.test(role)
    || tier.includes('agency');
  if (isDepartmentOffice) {
    const sector = detectDepartmentSector(role);
    if (sector) return `${sector}_dept`;
    return 'dept_generic';
  }

  return 'general';
}

function getCategoryProfile(o) {
  return CATEGORY_PROFILES[detectCategoryProfile(o)] || CATEGORY_PROFILES.general;
}

function getCategoryValues(o) {
  return {
    accountability: Number(o.accountability_avg || 0),
    service: Number(o.service_avg || 0),
    transparency: Number(o.transparency_avg || 0),
    responsiveness: Number(o.responsiveness_avg || 0),
    power: Number(o.power_avg || 0),
    security: Number(o.security_avg || 0),
    economic_stability: Number(o.economic_stability_avg || 0),
    education: Number(o.education_avg || 0),
    healthcare: Number(o.healthcare_avg || 0),
  };
}

function applyCategoryLabelsForOfficial(o) {
  const profile = getCategoryProfile(o);
  const labels = profile.labels || CATEGORY_LABELS_DEFAULT;
  const visible = profile.visible || CATEGORY_KEYS;
  document.querySelectorAll('.cat-stars').forEach((row) => {
    const wrap = row.parentElement;
    const labelEl = row.previousElementSibling;
    if (labelEl && labelEl.classList.contains('cat-label')) {
      labelEl.textContent = labels[row.dataset.cat] || CATEGORY_LABELS_DEFAULT[row.dataset.cat] || row.dataset.cat;
    }
    const active = visible.includes(row.dataset.cat);
    if (wrap) wrap.style.display = active ? '' : 'none';
    if (!active) {
      row.querySelectorAll('.cat-star').forEach((cs) => cs.classList.remove('on'));
      delete S.catStars[row.dataset.cat];
    }
  });
}

function getStoredRatings() {
  try {
    return JSON.parse(localStorage.getItem('nr_rated_officials') || '{}') || {};
  } catch {
    return {};
  }
}

function getStoredRating(id) {
  return getStoredRatings()[id] || null;
}

function saveStoredRating(id, payload) {
  const ratings = getStoredRatings();
  ratings[id] = payload;
  localStorage.setItem('nr_rated_officials', JSON.stringify(ratings));
}

// ── LOAD ──
async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    document.getElementById('stat-ratings').textContent = fmt(data.ratings);
    document.getElementById('stat-officials').textContent = fmt(data.officials);
  } catch (err) {
    showToast('Unable to load stats. Check your server connection.', 'error');
  }
}

async function loadOfficials() {
  document.getElementById('officials-grid').innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading officials...</div>';
  const url = new URL('/api/officials', window.location.origin);
  if (S.tier) url.searchParams.set('tier', S.tier);
  if (S.state) url.searchParams.set('state', S.state);
  url.searchParams.set('limit', '3000');
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('API error');
    const { officials } = await res.json();
    S.officials = officials || [];
    try {
      await enrichOfficialsWithAggregates(S.officials);
    } catch {}
    applyFilters();
  } catch(error) {
    document.getElementById('officials-grid').innerHTML = `
      <div class="empty">
        Error loading officials.<br>
        <span style="color:var(--muted);font-size:.82rem;">
          ${error.message || 'Check your connection.'}
        </span>
      </div>`;
    showToast('Error loading officials.', 'error');
  }
}

async function loadPoliticiansPreview() {
  const mount = document.getElementById('politicians-preview');
  const empty = document.getElementById('politicians-preview-empty');
  if (!mount) return;
  mount.innerHTML = '<div class="loading"><div class="spinner"></div><br>Loading politicians...</div>';
  if (empty) empty.style.display = 'none';

  try {
    const res = await fetch('/api/politicians?limit=9');
    if (!res.ok) throw new Error('API error');
    const { politicians: rows } = await res.json();
    if (!rows.length) {
      mount.innerHTML = '';
      if (empty) empty.style.display = '';
      return;
    }

    const esc = (s) => String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const initials = (name) => {
      const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
      return parts.slice(0, 2).map((p) => p[0]).join('').toUpperCase();
    };
    const slugify = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60);

    mount.innerHTML = rows.map((p) => {
      const nm = p.common_name || p.full_name;
      const slug = slugify(nm);
      const href = '/politician/' + slug + '--' + encodeURIComponent(p.id);
      return `
        <div class="pol-card card-hover">
          <div class="pol-avatar">${p.photo_url ? `<img alt="${esc(nm)}" src="${esc(p.photo_url)}">` : esc(initials(nm))}</div>
          <div style="min-width:0;flex:1;">
            <div class="pol-name">${esc(nm)}</div>
            <div class="pol-meta">${esc(p.aspiration_title || 'Politician')} · <span class="pol-pill">${esc(p.party || '')}</span></div>
            <div style="display:flex;gap:.6rem;flex-wrap:wrap;margin-top:.65rem;">
              <a class="btn btn-green btn-sm" href="${href}">View Profile</a>
              <a class="btn btn-ghost btn-sm" href="/politicians">More</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (e) {
    const msg = String(e?.message || '').toLowerCase();
    if (msg.includes('relation') && msg.includes('politicians')) {
      mount.innerHTML = '<div class="empty">Politicians feature is not enabled yet. Apply the `non_office_politicians.sql` migration.</div>';
      return;
    }
    mount.innerHTML = `<div class="empty">Unable to load politicians right now. <span style="color:var(--muted);font-size:.82rem;">${String(e?.message || '')}</span></div>`;
  }
}

async function loadFeaturedLeaders() {
  const mount = document.getElementById('featured-leaders');
  if (!mount) return;
  try {
    const res = await fetch('/api/officials?sort=rating_avg_desc&limit=6');
    if (!res.ok) throw new Error('API error');
    const { officials: leaders } = await res.json();
    
    if (!leaders || !leaders.length) {
      mount.innerHTML = '<div class="empty">Featured leaders are not available yet.</div>';
      return;
    }
    
    mount.innerHTML = leaders.map((o) => {
      const rating = Number(o.rating_avg || 0);
      const tier = TIER_LABELS[o.tier] || o.tier;
      const state = o.states?.name ? ` · ${o.states.name}` : '';
      const imgStyle = 'width:100%;height:100%;object-fit:cover;';
      const avatar = o.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(o.full_name)}&background=random`;
      return `
        <div class="featured-card">
          <div class="featured-head">
            <div class="featured-avatar">
              <img src="${avatar}" alt="${o.full_name}" loading="lazy" style="${imgStyle}">
            </div>
            <div>
              <div class="featured-name">${o.full_name}</div>
              <div class="featured-role">${o.role}</div>
            </div>
          </div>
          <div class="featured-metrics">
            <span>${renderStars(rating, 5)}</span>
            <strong>${rating ? rating.toFixed(1) : '—'}</strong>
            <span style="color:var(--muted);">(${fmt(o.rating_count)} ratings)</span>
          </div>
          <div style="margin-top:.55rem;font-size:.74rem;color:var(--muted);">${tier}${state}</div>
        </div>
      `;
    }).join('');
  } catch (error) {
    mount.innerHTML = `<div class="empty">Unable to load featured ratings.<br><span style="color:var(--muted);font-size:.82rem;">${error?.message || ''}</span></div>`;
  }
}

async function getRatedOfficialsData() {
  if (Array.isArray(ratedOfficialsCache)) return ratedOfficialsCache;
  const res = await fetch('/api/officials?limit=500&sort=rating_avg_desc');
  if (!res.ok) throw new Error('API error');
  const { officials } = await res.json();
  ratedOfficialsCache = officials || [];
  return ratedOfficialsCache;
}

function renderBestRatedList(mountId, rows, emptyText) {
  const mount = document.getElementById(mountId);
  if (!mount) return;
  if (!rows.length) {
    mount.innerHTML = `<div class="empty">${emptyText}</div>`;
    return;
  }
  mount.innerHTML = rows.map((o) => {
    const rating = Number(o.rating_avg || 0);
    const tier = TIER_LABELS[o.tier] || o.tier;
    const state = o.states?.name ? ` · ${o.states.name}` : '';
    return `
      <div class="best-rated-item">
        <div style="min-width:0;">
          <a href="${officialPath(o)}">${o.full_name}</a>
          <div class="best-rated-meta">${o.role}</div>
          <div class="best-rated-meta">${tier}${state}</div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          <div style="font-family:Syne,sans-serif;font-weight:800;">${rating.toFixed(1)}</div>
          <div class="best-rated-meta">${fmt(o.rating_count)} ratings</div>
        </div>
      </div>`;
  }).join('');
}

async function loadBestRatedSections() {
  try {
    const aggMap = await getRatingsAggregates();
    const entries = [...aggMap.entries()]
      .map(([id, agg]) => ({ id, rating_count: agg.count || 0, rating_avg: agg.avg || 0 }))
      .sort((a, b) => {
        const byScore = Number(b.rating_avg || 0) - Number(a.rating_avg || 0);
        if (byScore !== 0) return byScore;
        return Number(b.rating_count || 0) - Number(a.rating_count || 0);
      });

    const minCount = 3;
    const strict = entries.filter((o) => Number(o.rating_count || 0) >= minCount);
    const base = strict.length ? strict : entries;

    // Just fetch them in bulk and map them
    const res = await fetch('/api/officials?limit=150');
    if (!res.ok) throw new Error('API error');
    const { officials: officialsData } = await res.json();
    const byId = new Map((officialsData || []).map((o) => [o.id, o]));
    const rankedRows = base
      .map((r) => {
        const o = byId.get(r.id);
        if (!o) return null;
        return { ...o, rating_count: r.rating_count, rating_avg: r.rating_avg };
      })
      .filter(Boolean);

    const officials = rankedRows.filter((o) => !AGENCY_TIERS.has(String(o.tier || '').toLowerCase())).slice(0, 5);
    const agencies = rankedRows.filter((o) => isAgencyBody(o)).slice(0, 5);

    renderBestRatedList('best-rated-officials', officials, 'No rated officials yet.');
    renderBestRatedList('best-rated-agencies', agencies, 'No rated agencies yet.');
  } catch (error) {
    const msg = error?.message || 'Unable to load ranked results.';
    renderBestRatedList('best-rated-officials', [], `Error loading officials: ${msg}`);
    renderBestRatedList('best-rated-agencies', [], `Error loading agencies: ${msg}`);
  }
}

function applyFilters() {
  let list = [...S.officials];
  const q = S.search.toLowerCase();
  if (q) {
    list = list.filter((o) => {
      const name = String(o?.full_name || '').toLowerCase();
      const common = String(o?.common_name || '').toLowerCase();
      const role = String(o?.role || '').toLowerCase();
      const state = String(o?.states?.name || '').toLowerCase();
      const domain = domainFromUrl(String(o?.website || '')) || '';
      const hay = `${name} ${common} ${role} ${state} ${domain}`.trim();
      return hay.includes(q);
    });
  }
  if (S.state) list = list.filter(o => (o.states?.name||'') === S.state);
  const type = String(S.type || 'all');
  if (type === 'agencies') list = list.filter((o) => isAgencyBody(o));
  else if (type === 'agency_heads') list = list.filter((o) => isAgencyHead(o));
  else if (type === 'officials') list = list.filter(o => !String(o?.tier || '').includes('agency'));

  if (S.sort === 'rating_avg_desc') list.sort((a,b) => (b.rating_avg||0) - (a.rating_avg||0));
  else if (S.sort === 'rating_avg_asc') list.sort((a,b) => (a.rating_avg||0) - (b.rating_avg||0));
  else if (S.sort === 'name') list.sort((a,b) => a.full_name.localeCompare(b.full_name));
  else list.sort((a,b) => (b.rating_count||0) - (a.rating_count||0));

  S.filtered = list;
  S.page = 1;
  renderOfficials();
}

function avatarImgStyle(tier) {
  return String(tier || '').includes('agency')
    ? 'width:100%;height:100%;border-radius:50%;object-fit:contain;background:#fff;padding:4px;'
    : 'width:100%;height:100%;border-radius:50%;object-fit:cover;';
}

function agencyLike(o) {
  return String(o?.tier || '').includes('agency');
}

const AGENCY_HEAD_ROLE_RE = /minister|commissioner|director general|\bdg\b|managing director|\bmd\b|ceo|executive secretary|chairman|comptroller-?general|inspector general|administrator|head/i;
const AGENCY_ORG_NAME_RE = /agency|authority|commission|corporation|company|plc|ltd|limited|board|service|department|ministry|bureau|office|council|secretariat|bank|electricity|distribution|transmission|power|disco|discos|nnpc|nafdac/i;
function isAgencyBodyName(name) {
  const s = String(name || '').trim();
  if (!s) return false;
  const lower = s.toLowerCase();
  if (AGENCY_ORG_NAME_RE.test(lower)) return true;
  if (/^[A-Z0-9]{2,12}$/.test(s)) return true;
  return false;
}
function isAgencyHead(o) {
  if (!agencyLike(o)) return false;
  if (AGENCY_HEAD_ROLE_RE.test(String(o?.role || ''))) return true;
  return !isAgencyBodyName(o?.full_name);
}
function isAgencyBody(o) {
  return agencyLike(o) && isAgencyBodyName(o?.full_name) && !AGENCY_HEAD_ROLE_RE.test(String(o?.role || ''));
}

function domainFromUrl(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
}

function generatedAvatarUrl(o) {
  if (agencyLike(o)) {
    const domain = domainFromUrl(o.website);
    if (domain) return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  }
  const name = encodeURIComponent(o.full_name || o.common_name || 'Official');
  return `https://ui-avatars.com/api/?name=${name}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg`;
}

function avatarSrc(o) {
  return o.photo_url || generatedAvatarUrl(o);
}

function slugifyOfficialName(name) {
  return String(name || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function supportsPrettyRoutes() {
  const host = String(window.location.hostname || '').toLowerCase();
  if (window.location.protocol === 'file:') return false;
  if (host === 'localhost' || host === '127.0.0.1') return false;
  return true;
}

function officialPath(o) {
  if (!supportsPrettyRoutes()) return `/official.html?id=${encodeURIComponent(o.id)}`;
  const common = String(o?.common_name || '').trim();
  const useCommon = agencyLike(o) && common && /^[A-Za-z0-9]{2,12}$/.test(common);
  const slug = slugifyOfficialName(useCommon ? common : (o.full_name || o.common_name || 'official')) || 'official';
  return `/official/${slug}`;
}

function renderOfficials() {
  const grid = document.getElementById('officials-grid');
  const { page, perPage, filtered } = S;
  const total = filtered.length;
  const start = (page-1)*perPage, end = start+perPage;
  const slice = filtered.slice(start, end);

  document.getElementById('results-count').textContent = `${fmt(total)} profile${total!==1?'s':''}`;

  if (!slice.length) { grid.innerHTML = '<div class="empty">No officials found. Try a different search.</div>'; renderPagination(0); return; }

  grid.innerHTML = slice.map((o,i) => {
    const initials = o.full_name.split(' ').slice(0,2).map(w=>w[0]).join('');
    const color = TIER_COLORS[o.tier] || '#888';
    const tier = TIER_LABELS[o.tier] || o.tier;
    const rating = parseFloat(o.rating_avg)||0;
    const profile = getCategoryProfile(o);
    const values = getCategoryValues(o);
    const rows = (profile.visible || CATEGORY_KEYS).map((key) => {
      const pct = Math.round(((values[key] || 0) / 5) * 100);
      return `<div class="perf-row"><span class="perf-label">${profile.labels[key] || CATEGORY_LABELS_DEFAULT[key] || key}</span><div class="perf-track"><div class="perf-fill" style="width:${pct}%"></div></div><span class="perf-pct">${pct}%</span></div>`;
    }).join('');
    return `
    <div class="official-card card-hover fade-up fade-up-${Math.min(i+1,5)}" onclick="window.location.href='${officialPath(o)}'" style="cursor:pointer;">
      <div class="card-head">
        <div class="avatar" style="background:${color}22;color:${color};">
          <img src="${avatarSrc(o)}" alt="${o.full_name}" loading="lazy" style="${avatarImgStyle(o.tier)}" onerror="this.src='https://ui-avatars.com/api/?name=${encodeURIComponent((o.full_name||'Official'))}&size=256&background=0B5D43&color=ffffff&rounded=true&bold=true&format=svg'">
        </div>
        <div style="flex:1;min-width:0;">
          <div class="card-name">${o.full_name}</div>
          <div class="card-role">${o.role}</div>
          <span class="tier-badge" style="color:${color};border-color:${color}44;background:${color}11;">${tier}</span>
        </div>
      </div>
      <div class="stars-row">
        <div class="stars">${renderStarsHTML(rating)}</div>
        <span class="rating-num">${rating ? rating.toFixed(1) : '—'}</span>
        <span class="rating-count">(${fmt(o.rating_count)} ratings)</span>
      </div>
      <div class="perf-bars">${rows}</div>
      ${o.report_count > 0 ? `<div style="font-size:.72rem;color:#e57368;margin-bottom:.6rem;">⚠ ${o.report_count} misconduct report${o.report_count>1?'s':''}</div>` : ''}
      <div class="card-footer">
        <button class="btn-rate" onclick="event.stopPropagation();openRateModal('${o.id}')">⭐ Rate</button>
        <button class="btn-report" onclick="event.stopPropagation();openReportModal('${o.id}')">🚨 Report</button>
        <a href="${officialPath(o)}" onclick="event.stopPropagation()" style="flex:1;background:rgba(255,255,255,.06);color:var(--white);border-radius:6px;font-size:.78rem;font-weight:500;padding:.4rem;text-align:center;text-decoration:none;transition:background .2s;" onmouseover="this.style.background='rgba(255,255,255,.12)'" onmouseout="this.style.background='rgba(255,255,255,.06)'">👁 Profile</a>
      </div>
    </div>`;
  }).join('');
  renderPagination(total);
}

function renderStarsHTML(r) {
  return [1,2,3,4,5].map(i => {
    const cls = r >= i ? 'on' : r >= i-.5 ? 'half' : '';
    return `<span class="star ${cls}">★</span>`;
  }).join('');
}

function renderPagination(total) {
  const pages = Math.ceil(total / S.perPage);
  const el = document.getElementById('pagination');
  if (pages <= 1) { el.innerHTML=''; return; }
  
  const current = S.page;
  const range = [];
  const delta = 2;

  range.push(1);
  for (let i = Math.max(2, current - delta); i <= Math.min(pages - 1, current + delta); i++) {
    range.push(i);
  }
  if (pages > 1) {
    range.push(pages);
  }

  const getRangeLabel = (p) => {
    const start = (p - 1) * S.perPage + 1;
    const end = Math.min(p * S.perPage, total);
    return `${start}-${end}`;
  };

  let html = '';
  html += `<button class="tab" ${current === 1 ? 'disabled' : ''} onclick="${current > 1 ? `goPage(${current - 1})` : ''}">&larr; Prev</button>`;

  let l;
  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        html += `<button class="tab" onclick="goPage(${l + 1})">${getRangeLabel(l + 1)}</button>`;
      } else if (i - l > 2) {
        html += `<span style="padding: 0 .4rem; display: flex; align-items: center; color: var(--muted);">...</span>`;
      }
    }
    html += `<button class="tab ${i === current ? 'active' : ''}" onclick="goPage(${i})">${getRangeLabel(i)}</button>`;
    l = i;
  }

  html += `<button class="tab" ${current === pages ? 'disabled' : ''} onclick="${current < pages ? `goPage(${current + 1})` : ''}">Next &rarr;</button>`;

  el.innerHTML = html;
}

window.goPage = (p) => { S.page=p; renderOfficials(); window.scrollTo({top:document.getElementById('officials-section').offsetTop-70,behavior:'smooth'}); };

// ── TIER TABS ──
document.querySelectorAll('#tier-tabs .tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#tier-tabs .tab').forEach(t=>t.classList.remove('active'));
    btn.classList.add('active');
    S.tier = btn.dataset.tier || '';
    if (!S.tier) S.type = 'all';
    else if (S.tier === 'federal_agency') S.type = 'agencies';
    else S.type = 'all';
    loadOfficials();
  });
});

// ── SEARCH & FILTERS ──
let searchTimer;
document.getElementById('search-input').addEventListener('input', e => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { S.search = e.target.value; applyFilters(); }, 280);
});
document.getElementById('state-filter').addEventListener('change', e => { S.state = e.target.value; applyFilters(); });
document.getElementById('sort-filter').addEventListener('change', e => { S.sort = e.target.value; applyFilters(); });

// ── RATE MODAL ──
window.openRateModal = async (id) => {
  S.currentOfficial = S.officials.find(o=>o.id===id);
  S.mainStar = 0; S.catStars = {}; S.anonOn = true;
  const o = S.currentOfficial;
  applyCategoryLabelsForOfficial(o);
  const initials = o.full_name.split(' ').slice(0,2).map(w=>w[0]).join('');
  const color = TIER_COLORS[o.tier]||'#888';
  document.getElementById('modal-info').innerHTML = `
    <div class="avatar" style="background:${color}22;color:${color};">${o.photo_url?`<img src="${o.photo_url}" style="${avatarImgStyle(o.tier)}">`:`${initials}`}</div>
    <div><div style="font-weight:700;font-family:Syne,sans-serif;">${o.full_name}</div><div style="font-size:.8rem;color:var(--muted);">${o.role}</div></div>`;
  document.querySelectorAll('.star-pick').forEach(s=>s.classList.remove('on'));
  document.querySelectorAll('.cat-star').forEach(s=>s.classList.remove('on'));
  document.getElementById('star-label').textContent='';
  document.getElementById('review-text').value='';
  document.getElementById('reviewer-state').value='';
  document.getElementById('anon-toggle').className='toggle on';
  const btn = document.getElementById('submit-rate-btn');
  btn.disabled=true; btn.textContent='Select a rating to continue';
  const existingRating = getStoredRating(id);
  S.alreadyRated = !!existingRating;
  document.getElementById('already-rated').style.display = existingRating ? 'block' : 'none';
  if (existingRating) { S.mainStar = existingRating.overall; updateMainStars(); }
  document.getElementById('rate-modal').classList.add('open');
};

document.querySelectorAll('.star-pick').forEach(s => {
  s.addEventListener('click', () => { S.mainStar = parseInt(s.dataset.v); updateMainStars(); });
});
function updateMainStars() {
  document.querySelectorAll('.star-pick').forEach(s => s.classList.toggle('on', parseInt(s.dataset.v) <= S.mainStar));
  document.getElementById('star-label').textContent = STAR_LABELS[S.mainStar]||'';
  const btn = document.getElementById('submit-rate-btn');
  btn.disabled = S.alreadyRated;
  btn.textContent = S.alreadyRated ? 'Already rated on this device' : 'Submit Rating';
}

document.querySelectorAll('.cat-stars').forEach(row => {
  row.querySelectorAll('.cat-star').forEach((s,i) => {
    s.addEventListener('click', () => {
      S.catStars[row.dataset.cat] = i+1;
      row.querySelectorAll('.cat-star').forEach((cs,ci) => cs.classList.toggle('on', ci<=i));
    });
  });
});

window.toggleAnon = () => { S.anonOn=!S.anonOn; document.getElementById('anon-toggle').className='toggle'+(S.anonOn?' on':''); };

window.submitRating = async () => {
  if (!S.mainStar || !S.currentOfficial) return;
  if (S.alreadyRated) { showToast('This device has already rated this official.','error'); return; }
  const btn = document.getElementById('submit-rate-btn');
  btn.disabled=true; btn.textContent='Submitting...';
  let deviceHash = null;
  try { deviceHash = await getDeviceHash(); } catch {}
  if (!deviceHash) deviceHash = anonId || 'anon-' + Math.random().toString(36).substring(2, 12);
  const payload = {
    official_id: S.currentOfficial.id,
    anon_id: anonId,
    device_hash: deviceHash,
    overall: S.mainStar,
    accountability: S.catStars.accountability||null,
    service: S.catStars.service||null,
    transparency: S.catStars.transparency||null,
    responsiveness: S.catStars.responsiveness||null,
    power: S.catStars.power||null,
    security: S.catStars.security||null,
    economic_stability: S.catStars.economic_stability||null,
    education: S.catStars.education||null,
    healthcare: S.catStars.healthcare||null,
    review_text: document.getElementById('review-text').value.trim()||null,
    reviewer_state: document.getElementById('reviewer-state').value||null,
    is_anonymous: S.anonOn,
  };
  const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
   let error = null; if (!res.ok) error = await res.json();
  if (error && String(error.message||'').toLowerCase().includes('column')) {
    const fallback = { ...payload };
    delete fallback.device_hash;
    delete fallback.power;
    delete fallback.security;
    delete fallback.economic_stability;
    delete fallback.education;
    delete fallback.healthcare;
    { const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallback) }); if (!res.ok) error = await res.json(); }
  }
  if (error) { showToast('This device has already rated this official or an error occurred.','error'); btn.disabled=false; btn.textContent='Submit Rating'; return; }
  saveStoredRating(S.currentOfficial.id, { overall: S.mainStar, created_at: new Date().toISOString() });
  S.alreadyRated = true;
  closeModal('rate-modal');
  showToast(`Rating submitted ${S.anonOn?'anonymously ':''}✓`);
  invalidateRatedOfficialsCache();
  invalidateRatingsAggCache();
  loadOfficials(); loadStats(); loadBestRatedSections(); loadFeaturedLeaders(); loadPoliticiansPreview();
};

// ── REPORT MODAL ──
window.openReportModal = (id) => {
  S.currentOfficial = S.officials.find(o=>o.id===id);
  S.reportAnonOn = true;
  const o = S.currentOfficial;
  const initials = o.full_name.split(' ').slice(0,2).map(w=>w[0]).join('');
  const color = TIER_COLORS[o.tier]||'#888';
  document.getElementById('report-modal-info').innerHTML = `
    <div class="avatar" style="background:${color}22;color:${color};">${o.photo_url?`<img src="${o.photo_url}" style="${avatarImgStyle(o.tier)}">`:`${initials}`}</div>
    <div><div style="font-weight:700;font-family:Syne,sans-serif;">${o.full_name}</div><div style="font-size:.8rem;color:var(--muted);">${o.role}</div></div>`;
  document.querySelectorAll('.report-tag').forEach(t=>t.classList.remove('on'));
  document.getElementById('report-desc').value='';
  document.getElementById('evidence-url').value='';
  document.getElementById('report-anon-toggle').className='toggle on';
  document.getElementById('report-modal').classList.add('open');
};

document.querySelectorAll('.report-tag').forEach(t=>t.addEventListener('click',()=>t.classList.toggle('on')));
window.toggleReportAnon = () => { S.reportAnonOn=!S.reportAnonOn; document.getElementById('report-anon-toggle').className='toggle'+(S.reportAnonOn?' on':''); };

window.submitReport = async () => {
  const cats = [...document.querySelectorAll('.report-tag.on')].map(t=>t.textContent);
  const desc = document.getElementById('report-desc').value.trim();
  if (!cats.length || !desc) { showToast('Please select a category and describe the misconduct.','error'); return; }
  const res = await fetch('/api/reports', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      official_id: S.currentOfficial.id,
      anon_id: anonId,
      categories: cats,
      description: desc,
      evidence_url: document.getElementById('evidence-url').value.trim()||null,
      is_anonymous: S.reportAnonOn
    })
  });
  const error = res.ok ? null : await res.json();
  if (error) { showToast('Error submitting report. Please try again.','error'); return; }
  closeModal('report-modal');
  showToast('Misconduct report submitted ✓');
};

// ── UTILS ──
window.closeModal = (id) => document.getElementById(id).classList.remove('open');

// ── INIT ──
loadStats();
loadBestRatedSections();
loadFeaturedLeaders();
loadPoliticiansPreview();
loadOfficials();

// ── MOBILE NAV ──
(() => {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.getElementById('nav-links') || document.querySelector('.nav-links');
  if (!toggle || !links) return;
  const close = () => {
    links.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  };
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  links.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  document.addEventListener('click', (e) => {
    if (!links.classList.contains('open')) return;
    if (links.contains(e.target) || toggle.contains(e.target)) return;
    close();
  });
})();
