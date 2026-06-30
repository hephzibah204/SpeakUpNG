// admin-common.js — shared by all admin pages
import { supabase } from '../../js/supabase-client.js';
export { supabase };
export { showToast, fmt, TIER_LABELS, TIER_COLORS, scoreColor, canonicalizeUrl } from '../../js/supabase-client.js';

// ── AUTH GUARD ──
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.replace('/admin/login');
    return new Promise(() => {});
  }
  return session;
}

// ── SIGN OUT ──
export async function signOut() {
  await supabase.auth.signOut();
  window.location.replace('/admin/login');
}

export function wireSignOut(buttonId = 'signout-btn') {
  const btn = document.getElementById(buttonId);
  if (!btn) return;
  btn.addEventListener('click', signOut);
}

// ── SIDEBAR HTML — NOW INCLUDES AI MANAGER + ALERTS ──
export function sidebarHTML(activePage, userEmail) {
  const mainPages = [
    { id:'dashboard',   icon:'📊', label:'Dashboard',    href:'/admin/dashboard' },
    { id:'content',     icon:'📝', label:'Content (CMS)', href:'/admin/content' },
    { id:'officials',   icon:'👤', label:'Officials',     href:'/admin/officials' },
    { id:'governors',   icon:'🏛️', label:'Governors',     href:'/admin/governors' },
    { id:'politicians', icon:'🧑🏾‍⚖️', label:'Politicians',  href:'/admin/politicians' },
    { id:'mandate',     icon:'📌', label:'Mandate',       href:'/admin/mandate' },
    { id:'profiles',    icon:'🧾', label:'Profiles',      href:'/admin/profiles' },
    { id:'ratings',     icon:'⭐', label:'Ratings',       href:'/admin/ratings' },
    { id:'reports',     icon:'🚨', label:'Reports',       href:'/admin/reports' },
    { id:'polls',       icon:'🗳️', label:'Polls',         href:'/admin/polls' },
  ];
  const aiPages = [
    { id:'alerts',      icon:'🔔', label:'AI Alerts',     href:'/admin/alerts' },
    { id:'ai-manager',  icon:'🤖', label:'AI Manager',    href:'/admin/ai-manager' },
    { id:'news-intel',  icon:'📰', label:'News Intel',    href:'/admin/news-intel' },
  ];
  return `
  <button class="mobile-menu-btn" onclick="document.querySelector('.sidebar').classList.toggle('open')">☰</button>
  <div class="sidebar">
    <div class="sidebar-logo">
      🇳🇬 evote.ng
      <small>Admin Dashboard</small>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section">Main</div>
      ${mainPages.map(p => `
        <a href="${p.href}" class="sidebar-link ${p.id===activePage?'active':''}">
          <span class="sidebar-icon">${p.icon}</span>${p.label}
        </a>`).join('')}
      <div class="sidebar-section" style="margin-top:.8rem;">AI Tools</div>
      ${aiPages.map(p => `
        <a href="${p.href}" class="sidebar-link ${p.id===activePage?'active':''}">
          <span class="sidebar-icon">${p.icon}</span>${p.label}
        </a>`).join('')}
      <div class="sidebar-section" style="margin-top:.8rem;">Public Site</div>
      <a href="/" target="_blank" class="sidebar-link">
        <span class="sidebar-icon">🌐</span>View Site
      </a>
    </nav>
    <div class="sidebar-footer">
      <div class="admin-user">📧 ${userEmail||'Admin'}</div>
      <button class="btn-signout" id="signout-btn">Sign Out</button>
    </div>
  </div>
  <div class="mobile-menu-overlay" onclick="document.querySelector('.sidebar').classList.remove('open')"></div>`;
}

// Backward-compatible no-op for pages that still import it.
export function initSidebar() {}

// ── PAGINATION HELPER ──
export function paginate(data, page, perPage) {
  const total = data.length;
  const pages = Math.ceil(total / perPage);
  const slice = data.slice((page-1)*perPage, page*perPage);
  return { slice, total, pages };
}

export function renderPaginationBtns(container, currentPage, totalPages, onGo) {
  if (totalPages <= 1) { container.innerHTML=''; return; }
  container.innerHTML = Array.from({length:totalPages},(_,i)=>i+1)
    .map(p=>`<button class="tab ${p===currentPage?'active':''}" onclick="${onGo}(${p})">${p}</button>`)
    .join('');
}

export async function openRouterChat({ messages, model, temperature, max_tokens }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch('/api/openrouter-chat.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ messages, model, temperature, max_tokens }),
  });

  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && (json.error || json.details)) ? `${json.error || 'Request failed'}${json.details ? `: ${json.details}` : ''}` : `HTTP ${res.status}`);
  return json;
}

export async function adminApiJson(path, { method = 'GET', body } = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');

  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error((json && (json.error || json.details)) ? `${json.error || 'Request failed'}${json.details ? `: ${json.details}` : ''}` : `HTTP ${res.status}`);
  return json;
}
