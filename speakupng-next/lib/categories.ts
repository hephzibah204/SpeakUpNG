export const CATEGORY_LABELS_DEFAULT: Record<string, string> = {
  accountability: 'Accountability & Integrity',
  service: 'Service Delivery',
  transparency: 'Transparency',
  responsiveness: 'Public Responsiveness',
  power: 'Power & Influence',
  security: 'Security & Safety',
  economic_stability: 'Economic Stability',
  education: 'Education',
  healthcare: 'Healthcare',
};

export const CATEGORY_LABELS_POWER: Record<string, string> = {
  ...CATEGORY_LABELS_DEFAULT,
  power: 'Grid Stability',
  service: 'Power Distribution',
  economic_stability: 'Tariff Fairness',
  security: 'Infrastructure Protection',
};

export const CATEGORY_PROFILES: Record<string, { labels: Record<string, string>, visible: string[] }> = {
  general: { labels: CATEGORY_LABELS_DEFAULT, visible: Object.keys(CATEGORY_LABELS_DEFAULT) },
  president: {
    labels: CATEGORY_LABELS_DEFAULT,
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'security', 'economic_stability', 'education', 'healthcare'],
  },
  governor: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'State Infrastructure' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'security', 'economic_stability', 'education', 'healthcare'],
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
    visible: ['accountability', 'transparency', 'service', 'power', 'economic_stability', 'healthcare', 'responsiveness'],
  },
  dept_generic: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Mandate Delivery', responsiveness: 'Stakeholder Responsiveness', economic_stability: 'Budget Efficiency' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'economic_stability'],
  },
  power: { labels: CATEGORY_LABELS_POWER, visible: ['accountability', 'service', 'transparency', 'responsiveness', 'power', 'security', 'economic_stability'] },
  education_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Learning Delivery', education: 'Learning Outcomes', economic_stability: 'Funding Sustainability', responsiveness: 'Stakeholder Engagement' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'education', 'economic_stability'],
  },
  health_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Care Quality', healthcare: 'Public Health Outcomes', responsiveness: 'Emergency Response' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'healthcare', 'security'],
  },
  economy_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Policy Execution', economic_stability: 'Macro Stability', power: 'Business Climate' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'economic_stability', 'power'],
  },
  security_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Operational Delivery', security: 'Public Safety Outcomes', responsiveness: 'Incident Response' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'security'],
  },
  infrastructure_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Project Delivery', power: 'Infrastructure Quality', economic_stability: 'Value for Money' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'power', 'economic_stability'],
  },
  agriculture_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Farmer Support', economic_stability: 'Food Price Stability', security: 'Food Security' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'economic_stability', 'security'],
  },
  transport_dept: {
    labels: { ...CATEGORY_LABELS_DEFAULT, service: 'Transport Service Reliability', power: 'Network Quality', security: 'Travel Safety' },
    visible: ['accountability', 'service', 'transparency', 'responsiveness', 'power', 'security'],
  },
};

export function isPowerSectorOfficial(o: any) {
  const hay = `${o?.full_name || ''} ${o?.common_name || ''} ${o?.role || ''} ${o?.website || ''}`.toLowerCase();
  return /electricity|disco|distribution company|transmission company of nigeria|nerc|nbet|rea|nemsa|niso|ikeja electric|eko electricity|ibedc|aedc|phed|kaedco|kedco|yedc|eedc|jos electric|benin electricity/.test(hay);
}

export function detectDepartmentSector(role: string) {
  if (/education|school|university|polytechnic|teaching/.test(role)) return 'education';
  if (/health|medical|hospital|phc|nphcda|nafdac|aids/.test(role)) return 'health';
  if (/finance|budget|econom|revenue|tax|customs|trade|industry|investment|fiscal|cbn|firs|sec/.test(role)) return 'economy';
  if (/interior|defen[cs]e|police|security|intelligence|immigration|nscdc|ndlea|military/.test(role)) return 'security';
  if (/works|housing|infrastructure|urban|water resources|environment/.test(role)) return 'infrastructure';
  if (/agric|livestock|food/.test(role)) return 'agriculture';
  if (/transport|aviation|marine|maritime|rail|ports|waterways/.test(role)) return 'transport';
  return '';
}

export function detectCategoryProfile(o: any) {
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

export function getCategoryProfileForOfficial(o: any) {
  const key = detectCategoryProfile(o);
  return CATEGORY_PROFILES[key] || CATEGORY_PROFILES.general;
}

export const POLITICIAN_CATEGORY_PROFILE = {
  labels: {
    accountability: 'Integrity & Trust',
    service: 'Track Record',
    transparency: 'Policy Transparency',
    responsiveness: 'Public Engagement',
    power: 'Leadership Capacity',
    economic_stability: 'Economic Plan',
    education: 'Education Plan',
    healthcare: 'Healthcare Plan',
  },
  visible: ['accountability', 'service', 'transparency', 'responsiveness', 'power', 'economic_stability', 'education', 'healthcare'],
};
