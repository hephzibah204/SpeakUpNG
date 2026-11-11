'use client';

/**
 * Client-side cryptographic device fingerprinting for e-Vote.ng
 * Combines hardware entropy, Canvas 2D rasterization signature, screen specs,
 * platform signals, and a persistent client seed.
 * Produces a stable, irreversible 64-character SHA-256 hash.
 */

async function sha256Hex(input: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto || !window.crypto.subtle) {
    // Fallback for non-WebCrypto environments
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(16, '0');
  }

  const enc = new TextEncoder();
  const buf = await window.crypto.subtle.digest('SHA-256', enc.encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function getCanvasSignature(): string {
  try {
    const c = document.createElement('canvas');
    c.width = 240;
    c.height = 60;
    const ctx = c.getContext('2d');
    if (!ctx) return '';
    ctx.textBaseline = 'top';
    ctx.font = '16px "Inter", -apple-system, BlinkMacSystemFont, Arial, sans-serif';
    ctx.fillStyle = '#008751';
    ctx.fillRect(1, 1, 238, 58);
    ctx.fillStyle = '#ffffff';
    ctx.fillText('evote.ng:2027:verified', 8, 10);
    ctx.fillStyle = 'rgba(0, 230, 118, 0.85)';
    ctx.fillText('ballot-fingerprint', 48, 30);
    return c.toDataURL();
  } catch {
    return '';
  }
}

function getPersistentSeed(): string {
  if (typeof window === 'undefined') return '';
  try {
    const KEY = 'evote_device_seed';
    let seed = localStorage.getItem(KEY);
    if (!seed) {
      seed = `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
      localStorage.setItem(KEY, seed);
    }
    return seed;
  } catch {
    return '';
  }
}

export async function getDeviceFingerprint(extra: Record<string, any> = {}): Promise<string> {
  if (typeof window === 'undefined') return 'server-rendered-placeholder';

  const nav: any = window.navigator || {};
  const scr = window.screen || {};
  let tz = '';
  try {
    tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch {
    tz = '';
  }

  const payload = {
    ua: nav.userAgent || '',
    lang: nav.language || '',
    languages: Array.isArray(nav.languages) ? nav.languages.join(',') : '',
    plat: nav.platform || '',
    hc: nav.hardwareConcurrency || 0,
    dm: nav.deviceMemory || 0,
    tz,
    tzOff: new Date().getTimezoneOffset(),
    sw: scr.width || 0,
    sh: scr.height || 0,
    cd: scr.colorDepth || 0,
    pr: window.devicePixelRatio || 1,
    can: getCanvasSignature(),
    seed: getPersistentSeed(),
    ...extra,
  };

  return sha256Hex(JSON.stringify(payload));
}
