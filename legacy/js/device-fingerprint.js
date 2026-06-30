export async function sha256Hex(input) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(String(input)));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

function canvasSig() {
  try {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 60;
    const ctx = c.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '16px Arial';
    ctx.fillStyle = '#f60';
    ctx.fillRect(1, 1, 238, 58);
    ctx.fillStyle = '#069';
    ctx.fillText('evote.ng', 8, 10);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('fingerprint', 88, 28);
    return c.toDataURL();
  } catch {
    return '';
  }
}

export async function getDeviceHash(extra = {}) {
  const nav = window.navigator || {};
  const scr = window.screen || {};
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  const data = {
    ua: nav.userAgent || '',
    lang: nav.language || '',
    plat: nav.platform || '',
    hc: nav.hardwareConcurrency || 0,
    dm: nav.deviceMemory || 0,
    tz,
    tzOff: new Date().getTimezoneOffset(),
    sw: scr.width || 0,
    sh: scr.height || 0,
    cd: scr.colorDepth || 0,
    pr: window.devicePixelRatio || 1,
    can: canvasSig(),
    extra,
  };
  return sha256Hex(JSON.stringify(data));
}
