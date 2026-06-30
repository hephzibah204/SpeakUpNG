const fs = require('fs');
const path = require('path');

function refactorFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  const isHtml = file.endsWith('.html');
  const supabasePath = isHtml ? './js/supabase-client.js' : './supabase-client.js';
  const fingerprintPath = isHtml ? './js/device-fingerprint.js' : './device-fingerprint.js';

  // 1. Remove supabase import
  content = content.replace(
    /import \{\s*supabase,\s*getAnonId,\s*TIER_LABELS,\s*TIER_COLORS,\s*renderStars,\s*showToast,\s*fmt\s*\} from '[\.\/]+(js\/)?supabase-client\.js';/g,
    `import { getAnonId, TIER_LABELS, TIER_COLORS, renderStars, showToast, fmt } from '${supabasePath}';`
  );

  // Replace device fingerprint import path
  content = content.replace(
    /import \{\s*getDeviceHash\s*\} from '[\.\/]+(js\/)?device-fingerprint\.js';/g,
    `import { getDeviceHash } from '${fingerprintPath}';`
  );

  // 2. Rewrite loadStats
  content = content.replace(
    /async function loadStats\(\) \{[\s\S]*?\n\}/,
    `async function loadStats() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    document.getElementById('stat-ratings').textContent = fmt(data.ratings);
    document.getElementById('stat-officials').textContent = fmt(data.officials);
  } catch (err) {
    showToast('Unable to load stats. Check your server connection.', 'error');
  }
}`
  );

  // 3. Rewrite loadOfficials
  content = content.replace(
    /async function loadOfficials\(\) \{[\s\S]*?applyFilters\(\);\n\}/,
    `async function loadOfficials() {
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
    document.getElementById('officials-grid').innerHTML = \`
      <div class="empty">
        Error loading officials.<br>
        <span style="color:var(--muted);font-size:.82rem;">
          \${error.message || 'Check your connection.'}
        </span>
      </div>\`;
    showToast('Error loading officials.', 'error');
  }
}`
  );

  // 4. Rewrite loadPoliticiansPreview
  content = content.replace(
    /async function loadPoliticiansPreview\(\) \{[\s\S]*?mount\.innerHTML = html;\n\}/,
    `async function loadPoliticiansPreview() {
  const mount = document.getElementById('politicians-preview');
  if (!mount) return;
  mount.innerHTML = '<div class="loading" style="grid-column:1/-1"><div class="spinner"></div></div>';
  
  try {
    const res = await fetch('/api/politicians?limit=6&sort=rating_score');
    if (!res.ok) throw new Error('API error');
    const { politicians } = await res.json();
    const data = politicians || [];
    
    if (!data.length) {
      mount.innerHTML = '<div class="empty" style="grid-column:1/-1">No politicians found.</div>';
      return;
    }
    
    let html = '';
    for (const p of data) {
      const stateLabel = p.states ? \` • \${p.states.name}\` : '';
      const sc = scoreColor(p.rating_score || 0);
      const img = p.photo_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(p.full_name)}&background=random\`;
      
      html += \`
        <a href="/politicians" class="pol-card" style="text-decoration:none;color:inherit;">
          <div class="pol-avatar"><img src="\${img}" alt="\${p.full_name}" loading="lazy"></div>
          <div>
            <div class="pol-name">\${p.full_name}</div>
            <div class="pol-meta">\${p.role || p.tier}\${stateLabel}</div>
            <div style="margin-top:.4rem;display:flex;align-items:center;gap:.4rem;">
              \${renderStars(p.rating_score, 5)}
              <span style="color:\${sc};font-weight:700;font-size:.8rem">\${Number(p.rating_score||0).toFixed(1)}</span>
            </div>
          </div>
        </a>\`;
    }
    mount.innerHTML = html;
  } catch (err) {
    mount.innerHTML = '<div class="empty" style="grid-column:1/-1">Error loading politicians.</div>';
  }
}`
  );

  // 5. Rewrite getRatingsAggregates
  content = content.replace(
    /async function getRatingsAggregates\(\) \{[\s\S]*?return map;\n\}/,
    `async function getRatingsAggregates() {
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
}`
  );

  // 6. Rewrite submitRating
  content = content.replace(
    /let \{ error \} = await supabase\.from\('ratings'\)\.insert\(payload\);/g,
    `const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
   let error = null; if (!res.ok) error = await res.json();`
  ).replace(
    /\(\{ error \} = await supabase\.from\('ratings'\)\.insert\(fallback\)\);/g,
    `{ const res = await fetch('/api/ratings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(fallback) }); if (!res.ok) error = await res.json(); }`
  );

  // 7. Rewrite submitReport
  content = content.replace(
    /const \{ error \} = await supabase\.from\('reports'\)\.insert\(\{[\s\S]*?\}\);/g,
    `const res = await fetch('/api/reports', {
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
  const error = res.ok ? null : await res.json();`
  );

  // 8. Rewrite loadBestRatedSections
  content = content.replace(
    /const \{ data, error \} = await supabase[\s\S]*?\.limit\(6\);/g,
    `const res = await fetch('/api/officials?sort=rating_avg_desc&limit=6');
   const { officials: data } = res.ok ? await res.json() : { officials: [] };
   const error = res.ok ? null : new Error('API error');`
  );
  content = content.replace(
    /const \{ data: agencyRows, error: agencyError \} = await supabase[\s\S]*?\.limit\(6\);/g,
    `const aRes = await fetch('/api/officials?tier=federal_agency&sort=rating_avg_desc&limit=6');
   const { officials: agencyRows } = aRes.ok ? await aRes.json() : { officials: [] };
   const agencyError = aRes.ok ? null : new Error('API error');`
  );
  content = content.replace(
    /const \{ data: defenseRows, error: defenseError \} = await supabase[\s\S]*?\.limit\(6\);/g,
    `const dRes = await fetch('/api/officials?tier=military_security&sort=rating_avg_desc&limit=6');
   const { officials: defenseRows } = dRes.ok ? await dRes.json() : { officials: [] };
   const defenseError = dRes.ok ? null : new Error('API error');`
  );

  // 9. Rewrite loadFeaturedLeaders
  content = content.replace(
    /async function loadFeaturedLeaders\(\) \{[\s\S]*?mount\.innerHTML = `<div class="empty">Unable to load featured ratings\.<br><span style="color:var\(--muted\);font-size:\.82rem;">\$\{error\?\.message \|\| ''\}<\/span><\/div>`;\n  \}\n\}/,
    `async function loadFeaturedLeaders() {
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
      const state = o.states?.name ? \` · \${o.states.name}\` : '';
      const imgStyle = 'width:100%;height:100%;object-fit:cover;';
      const avatar = o.photo_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(o.full_name)}&background=random\`;
      return \`
        <div class="featured-card">
          <div class="featured-head">
            <div class="featured-avatar">
              <img src="\${avatar}" alt="\${o.full_name}" loading="lazy" style="\${imgStyle}">
            </div>
            <div>
              <div class="featured-name">\${o.full_name}</div>
              <div class="featured-role">\${o.role}</div>
            </div>
          </div>
          <div class="featured-metrics">
            <span>\${renderStars(rating, 5)}</span>
            <strong>\${rating ? rating.toFixed(1) : '—'}</strong>
            <span style="color:var(--muted);">(\${fmt(o.rating_count)} ratings)</span>
          </div>
          <div style="margin-top:.55rem;font-size:.74rem;color:var(--muted);">\${tier}\${state}</div>
        </div>
      \`;
    }).join('');
  } catch (error) {
    mount.innerHTML = \`<div class="empty">Unable to load featured ratings.<br><span style="color:var(--muted);font-size:.82rem;">\${error?.message || ''}</span></div>\`;
  }
}`
  );

  fs.writeFileSync(file, content);
  console.log(file + ' refactored!');
}

const file1 = path.join(__dirname, 'speakupng-next', 'public', 'js', 'legacy-index.js');
const file2 = path.join(__dirname, 'speakupng-next', 'public', 'index.html');

refactorFile(file1);
refactorFile(file2);
