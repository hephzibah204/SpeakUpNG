// ============================================================
// supabase-client.js
// Shared across all public + admin pages
// Replace the two values below with your Supabase project details
// ============================================================

const SUPABASE_URL = 'https://dyrsygrjsxqfszglqrez.supabase.co';       // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = 'sb_publishable_wKGjAwnpc2sOwjSAf6Zl6Q_bi3PegsD'; // from Project Settings > API

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ─────────────────────────────────────────
// Anonymous identity (persisted in localStorage)
// Every browser gets a UUID — used for one-vote-per-official enforcement
// No personal data is ever stored
// ─────────────────────────────────────────
export function getAnonId() {
  let id = localStorage.getItem('nr_anon_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('nr_anon_id', id);
  }
  return id;
}

// ─────────────────────────────────────────
// Tier labels
// ─────────────────────────────────────────
export const TIER_LABELS = {
  federal_executive:   'Federal Executive',
  federal_legislature: 'National Assembly',
  federal_judiciary:   'Federal Judiciary',
  state_executive:     'State Executive',
  state_legislature:   'State Assembly',
  local_government:    'Local Government',
  federal_agency:      'Federal Agency',
  state_agency:        'State Agency',
  military_security:   'Military & Security',
};

export const TIER_COLORS = {
  federal_executive:   '#00b368',
  federal_legislature: '#e8a020',
  federal_judiciary:   '#7c6af7',
  state_executive:     '#3ab4f2',
  state_legislature:   '#e87720',
  local_government:    '#aaa',
  federal_agency:      '#e84040',
  state_agency:        '#c0a040',
  military_security:   '#708090',
};

// ─────────────────────────────────────────
// Star renderer helper
// ─────────────────────────────────────────
export function renderStars(rating, max = 5) {
  rating = parseFloat(rating) || 0;
  return Array.from({ length: max }, (_, i) => {
    const filled = rating >= i + 1;
    const half   = !filled && rating >= i + 0.5;
    return `<span style="color:${filled || half ? '#e8a020' : '#3a3f36'};opacity:${half ? .6 : 1}">★</span>`;
  }).join('');
}

// ─────────────────────────────────────────
// Score colour helper
// ─────────────────────────────────────────
export function scoreColor(val) {
  if (val >= 4)  return '#00b368';
  if (val >= 3)  return '#e8a020';
  if (val >= 2)  return '#e87720';
  return '#e84040';
}

// ─────────────────────────────────────────
// Toast
// ─────────────────────────────────────────
export function showToast(msg, type = 'success') {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.style.background = type === 'error' ? '#c0392b' : '#008751';
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3500);
}

// ─────────────────────────────────────────
// Format numbers
// ─────────────────────────────────────────
export function fmt(n) {
  return Number(n || 0).toLocaleString();
}

export function canonicalizeUrl(input) {
  let s = String(input ?? '').trim();
  if (!s) return '';

  s = s
    .replace(/^['"<\[]+/, '')
    .replace(/[\]>'"\)\],\.]+$/, '')
    .replace(/&amp;/gi, '&')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '');

  for (let i = 0; i < 2; i++) {
    try {
      const dec = decodeURIComponent(s);
      if (dec === s) break;
      s = dec;
    } catch {
      break;
    }
  }

  if (/^www\./i.test(s)) s = `https://${s}`;
  if (/^http:\/\/[^/]+/i.test(s)) {
    s = s.replace(/^http:\/\//i, 'https://');
  }

  let u;
  try {
    u = new URL(s, window.location.origin);
  } catch {
    return '';
  }

  if (u.protocol !== 'http:' && u.protocol !== 'https:') return '';
  u.hash = '';
  u.username = '';
  u.password = '';
  u.hostname = u.hostname.toLowerCase();
  if ((u.protocol === 'https:' && u.port === '443') || (u.protocol === 'http:' && u.port === '80')) u.port = '';

  u.pathname = u.pathname
    .replace(/\/+/g, '/')
    .replace(/\s+/g, '%20');
  if (u.pathname !== '/') u.pathname = u.pathname.replace(/\/+$/g, '');

  const drop = new Set([
    'fbclid','gclid','igshid','mc_cid','mc_eid','mkt_tok','yclid','gbraid','wbraid','_ga','_gid','_gl','ref','ref_src','source'
  ]);
  const kept = [];
  u.searchParams.forEach((value, key) => {
    const k = String(key || '').trim();
    if (!k) return;
    const kl = k.toLowerCase();
    if (kl.startsWith('utm_')) return;
    if (drop.has(kl)) return;
    const v = String(value ?? '').trim();
    if (!v) return;
    kept.push([k, v]);
  });
  kept.sort((a, b) => (a[0] === b[0] ? a[1].localeCompare(b[1]) : a[0].localeCompare(b[0])));
  u.search = '';
  for (const [k, v] of kept) u.searchParams.append(k, v);

  return u.toString();
}
