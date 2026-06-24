export interface RatingSubmission {
  official_id?: string;
  politician_id?: string;
  overall: number;
  accountability?: number;
  service?: number;
  transparency?: number;
  responsiveness?: number;
  power?: number;
  security?: number;
  economic_stability?: number;
  education?: number;
  healthcare?: number;
  reviewer_state?: string;
  review_text?: string;
  device_hash: string;
}

export function generateDeviceHash(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  const hash = `${timestamp}-${random}`;
  return hash;
}

export function getStoredDeviceHash(): string {
  if (typeof window === 'undefined') return '';
  let hash = localStorage.getItem('evote_device_hash');
  if (!hash) {
    hash = generateDeviceHash();
    localStorage.setItem('evote_device_hash', hash);
  }
  return hash;
}

export interface RatingCategory {
  key: string;
  label: string;
  description: string;
}

export const RATING_CATEGORIES: RatingCategory[] = [
  { key: 'accountability', label: 'Accountability', description: 'Keeps promises and takes responsibility' },
  { key: 'service', label: 'Service Delivery', description: 'Quality of public services provided' },
  { key: 'transparency', label: 'Transparency', description: 'Open about decisions and spending' },
  { key: 'responsiveness', label: 'Responsiveness', description: 'Responds to citizen concerns' },
  { key: 'power', label: 'Power & Influence', description: 'Effectiveness in using authority' },
  { key: 'security', label: 'Security', description: 'Maintains public safety and order' },
  { key: 'economic_stability', label: 'Economic Mgmt', description: 'Economic and fiscal management' },
  { key: 'education', label: 'Education', description: 'Support for education' },
  { key: 'healthcare', label: 'Healthcare', description: 'Healthcare access and quality' },
];

export function calculateOverall(categories: Record<string, number>): number {
  const values = Object.values(categories);
  if (values.length === 0) return 0;
  const sum = values.reduce((a, b) => a + b, 0);
  return Math.round((sum / values.length) * 10) / 10;
}
