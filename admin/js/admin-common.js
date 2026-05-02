// admin-common.js — shared by all admin pages
import { supabase } from '../../js/supabase-client.js';
export { supabase };
export { showToast, fmt, TIER_LABELS, TIER_COLORS, scoreColor } from '../../js/supabase-client.js';

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
  const pages = [
    { id:'dashboard',   icon:'📊', label:'Dashboard',    href:'/admin/dashboard' },
    { id:'officials',   icon:'👤', label:'Officials',     href:'/admin/officials' },
    { id:'mandate',     icon:'📌', label:'Mandate',       href:'/admin/mandate' },
    { id:'profiles',    icon:'🧾', label:'Profiles',      href:'/admin/profiles' },
    { id:'ratings',     icon:'⭐', label:'Ratings',       href:'/admin/ratings' },
    { id:'reports',     icon:'🚨', label:'Reports',       href:'/admin/reports' },
    { id:'polls',       icon:'🗳️', label:'Polls',         href:'/admin/polls' },
    { id:'alerts',      icon:'🔔', label:'AI Alerts',     href:'/admin/alerts' },
    { id:'ai-manager',  icon:'🤖', label:'AI Manager',    href:'/admin/ai-manager' },
  ];
  return `
  <div class="sidebar">
    <div class="sidebar-logo">
      🇳🇬 evote.ng
      <small>Admin Dashboard</small>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section">Main</div>
      ${pages.slice(0,7).map(p => `
        <a href="${p.href}" class="sidebar-link ${p.id===activePage?'active':''}">
          <span class="sidebar-icon">${p.icon}</span>${p.label}
        </a>`).join('')}
      <div class="sidebar-section" style="margin-top:.8rem;">AI Tools</div>
      ${pages.slice(7).map(p => `
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
  </div>`;
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
