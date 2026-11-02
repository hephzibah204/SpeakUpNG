'use client';

import React from 'react';

export interface PartyFlagProps {
  party?: string;
  partyCode?: string;
  className?: string;
  showCode?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/** Normalize party codes and full party names */
export function normalizeParty(partyInput?: string, partyCodeInput?: string): string {
  const code = (partyCodeInput || '').trim().toUpperCase();
  if (code) {
    if (code.includes('APC')) return 'APC';
    if (code.includes('PDP')) return 'PDP';
    if (code.includes('LP')) return 'LP';
    if (code.includes('NNPP')) return 'NNPP';
    if (code.includes('ADC')) return 'ADC';
    if (code.includes('SDP')) return 'SDP';
    if (code.includes('APGA')) return 'APGA';
    if (code.includes('AAC')) return 'AAC';
    if (code.includes('PRP')) return 'PRP';
    if (code.includes('YPP')) return 'YPP';
    if (code.includes('NDC')) return 'NDC';
    if (code.includes('APM')) return 'APM';
    if (code.includes('YP')) return 'YP';
    if (code.includes('ACC')) return 'ACC';
    return code;
  }

  const p = (partyInput || '').toLowerCase();
  if (p.includes('all progressives congress') || p.includes('apc')) return 'APC';
  if (p.includes('peoples democratic') || p.includes('pdp')) return 'PDP';
  if (p.includes('labour party') || p.includes('lp')) return 'LP';
  if (p.includes('new nigeria') || p.includes('nnpp')) return 'NNPP';
  if (p.includes('african democratic') || p.includes('adc')) return 'ADC';
  if (p.includes('social democratic') || p.includes('sdp')) return 'SDP';
  if (p.includes('all progressives grand') || p.includes('apga')) return 'APGA';
  if (p.includes('african action') || p.includes('aac')) return 'AAC';
  if (p.includes('peoples redemption') || p.includes('prp')) return 'PRP';
  if (p.includes('young progressives') || p.includes('ypp')) return 'YPP';
  if (p.includes('nigeria democratic') || p.includes('ndc')) return 'NDC';
  if (p.includes('allied peoples') || p.includes('apm')) return 'APM';
  if (p.includes('youth party') || p.includes('yp')) return 'YP';
  if (p.includes('accord')) return 'ACC';
  return 'OTHER';
}

/** Get official primary color for party */
export function getPartyColorHex(party?: string, partyCode?: string): string {
  const code = normalizeParty(party, partyCode);
  switch (code) {
    case 'APC': return '#008751'; // Green & Sky Blue
    case 'PDP': return '#008751'; // Green & Red
    case 'LP': return '#f39c12';  // Orange / Yellow
    case 'NNPP': return '#c0392b'; // Red
    case 'ADC': return '#e67e22'; // Orange
    case 'SDP': return '#27ae60'; // Forest Green
    case 'APGA': return '#f1c40f'; // Gold / Green
    case 'AAC': return '#e65100'; // Orange / Black
    case 'PRP': return '#b71540'; // Crimson
    case 'YPP': return '#16a085'; // Teal
    case 'NDC': return '#6c5ce7'; // Purple
    case 'APM': return '#2980b9'; // Blue
    case 'YP': return '#0c2461';  // Navy
    default: return '#008751';
  }
}

/**
 * Authentic Nigerian Party Flag SVG
 * Features accurate party colors and official party symbols (broom, umbrella, family, handshake, horse, etc.)
 */
export function PartyFlagSvg({ partyCode, className = 'w-6 h-4' }: { partyCode: string; className?: string }) {
  const code = partyCode.toUpperCase();

  switch (code) {
    case 'APC':
      // APC: Green, White, Sky Blue vertical stripes with red emblem band & Broom symbol
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="All Progressives Congress (APC)">
          <rect width="12" height="24" fill="#008751" />
          <rect x="12" width="12" height="24" fill="#ffffff" />
          <rect x="24" width="12" height="24" fill="#0077c8" />
          {/* Center Red shield with stylized Broom */}
          <circle cx="18" cy="12" r="5.5" fill="#d63031" />
          <path d="M16 16 L18 8 L20 16 Z" fill="#ffffff" />
          <path d="M18 10 L18 15" stroke="#f1c40f" strokeWidth="1" strokeLinecap="round" />
          <circle cx="18" cy="9" r="0.8" fill="#f1c40f" />
        </svg>
      );

    case 'PDP':
      // PDP: Green, White, Red horizontal stripes with the Umbrella symbol
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Peoples Democratic Party (PDP)">
          <rect width="36" height="8" fill="#008751" />
          <rect y="8" width="36" height="8" fill="#ffffff" />
          <rect y="16" width="36" height="8" fill="#d63031" />
          {/* Umbrella symbol in white band */}
          <path d="M13 13 C13 9 23 9 23 13 Z" fill="#008751" stroke="#2d3436" strokeWidth="0.5" />
          <path d="M13 13 C13 11 18 11 18 13 Z" fill="#d63031" />
          <line x1="18" y1="9" x2="18" y2="15" stroke="#2d3436" strokeWidth="0.8" />
          <path d="M18 15 C18 16.2 16.8 16.2 16.8 15" fill="none" stroke="#2d3436" strokeWidth="0.8" />
        </svg>
      );

    case 'LP':
      // LP: Green, White, Orange with Papa, Mama, Pikin (Family) symbol
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Labour Party (LP)">
          <rect width="12" height="24" fill="#008751" />
          <rect x="12" width="12" height="24" fill="#ffffff" />
          <rect x="24" width="12" height="24" fill="#f39c12" />
          {/* Family emblem: Father, Child, Mother silhouettes */}
          <circle cx="15.5" cy="10" r="1.3" fill="#2d3436" />
          <path d="M14 15 C14 12 17 12 17 15 Z" fill="#2d3436" />
          <circle cx="20.5" cy="10.5" r="1.2" fill="#2d3436" />
          <path d="M19 15 C19 12.5 22 12.5 22 15 Z" fill="#2d3436" />
          <circle cx="18" cy="12" r="0.9" fill="#008751" />
          <path d="M17 15 C17 13.5 19 13.5 19 15 Z" fill="#008751" />
        </svg>
      );

    case 'NNPP':
      // NNPP: Red, White, Royal Blue with Basket of fruit symbol
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="New Nigeria Peoples Party (NNPP)">
          <rect width="36" height="8" fill="#c0392b" />
          <rect y="8" width="36" height="8" fill="#ffffff" />
          <rect y="16" width="36" height="8" fill="#1e3799" />
          {/* Basket symbol in middle */}
          <path d="M14 10 L22 10 L20 14 L16 14 Z" fill="#f39c12" stroke="#2d3436" strokeWidth="0.5" />
          <circle cx="16" cy="9.5" r="1" fill="#c0392b" />
          <circle cx="18" cy="9.2" r="1.1" fill="#27ae60" />
          <circle cx="20" cy="9.5" r="1" fill="#f1c40f" />
        </svg>
      );

    case 'ADC':
      // ADC: Navy Blue and Vibrant Orange with Handshake symbol
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="African Democratic Congress (ADC)">
          <rect width="18" height="24" fill="#0a3d62" />
          <rect x="18" width="18" height="24" fill="#e67e22" />
          {/* Handshake symbol in center circle */}
          <circle cx="18" cy="12" r="5" fill="#ffffff" />
          <path d="M14.5 12 L17 10 L19 12 L17 14 Z" fill="#0a3d62" />
          <path d="M21.5 12 L19 10 L17 12 L19 14 Z" fill="#e67e22" />
        </svg>
      );

    case 'SDP':
      // SDP: Green and White with Horse symbol
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Social Democratic Party (SDP)">
          <rect width="36" height="24" fill="#008751" />
          <rect x="8" width="20" height="24" fill="#ffffff" />
          {/* Galloping Horse silhouette */}
          <path d="M15 14 L17 11 L20 10 L22 11 L21 14 L19 13 L18 16 Z" fill="#008751" />
          <circle cx="21" cy="9.5" r="1" fill="#008751" />
        </svg>
      );

    case 'APGA':
      // APGA: Green and Yellow with Rooster
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="All Progressives Grand Alliance (APGA)">
          <rect width="18" height="24" fill="#008751" />
          <rect x="18" width="18" height="24" fill="#f1c40f" />
          <circle cx="18" cy="12" r="5" fill="#ffffff" />
          {/* Rooster silhouette */}
          <path d="M17 14 L18 11 L20 11 L19 14 Z" fill="#c0392b" />
          <circle cx="19" cy="10" r="1.2" fill="#c0392b" />
        </svg>
      );

    case 'AAC':
      // AAC: Orange and Black with Star/Fist
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="African Action Congress (AAC)">
          <rect width="36" height="24" fill="#e65100" />
          <polygon points="18,5 20,10 25,10 21,13 23,18 18,15 13,18 15,13 11,10 16,10" fill="#111111" />
        </svg>
      );

    case 'PRP':
      // PRP: Crimson Red with Key symbol
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Peoples Redemption Party (PRP)">
          <rect width="36" height="24" fill="#b71540" />
          {/* Key symbol in gold */}
          <circle cx="15" cy="12" r="3" fill="none" stroke="#f1c40f" strokeWidth="1.5" />
          <line x1="18" y1="12" x2="23" y2="12" stroke="#f1c40f" strokeWidth="1.5" />
          <line x1="21" y1="12" x2="21" y2="14" stroke="#f1c40f" strokeWidth="1.2" />
          <line x1="23" y1="12" x2="23" y2="14" stroke="#f1c40f" strokeWidth="1.2" />
        </svg>
      );

    case 'YPP':
      // YPP: Forest Green and Gold with Leaf
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Young Progressives Party (YPP)">
          <rect width="36" height="12" fill="#1e824c" />
          <rect y="12" width="36" height="12" fill="#f1c40f" />
          <circle cx="18" cy="12" r="5" fill="#ffffff" />
          {/* Sprouting plant */}
          <path d="M18 15 L18 10 C18 9 20 8 20 10 C20 11 18 11 18 11" fill="none" stroke="#1e824c" strokeWidth="1" />
          <path d="M18 12 C18 11 16 10 16 12 C16 13 18 13 18 13" fill="none" stroke="#1e824c" strokeWidth="1" />
        </svg>
      );

    case 'NDC':
      // NDC: Royal Purple and Gold with Torch
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Nigeria Democratic Congress (NDC)">
          <rect width="18" height="24" fill="#574b90" />
          <rect x="18" width="18" height="24" fill="#f5cd79" />
          <circle cx="18" cy="12" r="5" fill="#2d3436" />
          {/* Torch flame */}
          <path d="M17 15 L19 15 L18.5 12 L17.5 12 Z" fill="#e67e22" />
          <circle cx="18" cy="10" r="1.5" fill="#f1c40f" />
        </svg>
      );

    case 'APM':
      // APM: Green, White, Blue
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Allied Peoples Movement (APM)">
          <rect width="36" height="8" fill="#008751" />
          <rect y="8" width="36" height="8" fill="#ffffff" />
          <rect y="16" width="36" height="8" fill="#2980b9" />
        </svg>
      );

    case 'YP':
      // Youth Party: Navy & Emerald
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Youth Party (YP)">
          <rect width="18" height="24" fill="#0c2461" />
          <rect x="18" width="18" height="24" fill="#008751" />
          <polygon points="15,12 21,9 21,15" fill="#ffffff" />
        </svg>
      );

    default:
      // Default / Independent / Other: Nigerian Green-White-Green Tricolor
      return (
        <svg viewBox="0 0 36 24" className={`${className} rounded-sm overflow-hidden border border-white/20 shadow-sm flex-shrink-0`} title="Federal Republic of Nigeria">
          <rect width="12" height="24" fill="#008751" />
          <rect x="12" width="12" height="24" fill="#ffffff" />
          <rect x="24" width="12" height="24" fill="#008751" />
        </svg>
      );
  }
}

/**
 * Party Flag Badge component
 * Renders the official flag alongside the party acronym in a clean, high-contrast pill
 */
export default function PartyFlag({
  party,
  partyCode,
  className = '',
  showCode = true,
  size = 'md',
}: PartyFlagProps) {
  const code = normalizeParty(party, partyCode);
  const color = getPartyColorHex(party, partyCode);

  const flagSizes = {
    sm: 'w-5 h-3.5',
    md: 'w-6 h-4',
    lg: 'w-8 h-5',
  };

  const pillPaddings = {
    sm: 'px-1.5 py-0.5 text-[9px] gap-1',
    md: 'px-2 py-0.5 text-[10px] gap-1.5',
    lg: 'px-2.5 py-1 text-xs gap-2',
  };

  return (
    <div
      className={`inline-flex items-center rounded-md bg-[#141714] border border-[#2c312a] font-extrabold uppercase tracking-wider text-white shadow-sm transition-transform hover:scale-105 ${pillPaddings[size]} ${className}`}
      style={{ borderLeftColor: color, borderLeftWidth: '3px' }}
      title={`${party || code} (${code})`}
    >
      <PartyFlagSvg partyCode={code} className={flagSizes[size]} />
      {showCode && (
        <span className="font-display font-black text-zinc-200">
          {code}
        </span>
      )}
    </div>
  );
}
