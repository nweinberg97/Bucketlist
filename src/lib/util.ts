import type { Category, Goal, Person, Privacy } from '../types';

/** Deterministic PRNG so generative art and layout stay stable between renders. */
export function rng(seed: number) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 100000) / 100000;
  };
}

export function hash(str: string) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export const uid = (p = 'id') => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

export const money = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export function timeAgo(at: number, now = Date.now()) {
  const s = Math.max(1, Math.round((now - at) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.round(d / 7);
  if (w < 9) return `${w}w`;
  return new Date(at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function greeting(d = new Date()) {
  const h = d.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ---------------- Geography ---------------- */

/** Rough neighbourhood centroids on a km grid (Kitsilano = origin). Never exposes addresses. */
export const HOODS: Record<string, [number, number]> = {
  Kitsilano: [0, 0],
  'Point Grey': [-3.1, 0.3],
  Fairview: [2.6, 0.1],
  'Mount Pleasant': [4.3, 0.4],
  'Main Street': [4.6, -1.3],
  Downtown: [3.0, 2.7],
  'West End': [1.9, 3.3],
  Gastown: [4.3, 3.2],
  Strathcona: [5.4, 2.4],
  'Commercial Drive': [6.9, 0.8],
  Grandview: [7.0, 1.7],
  'East Van': [7.6, -0.6],
  'North Vancouver': [4.1, 7.6],
};

export const LOCATION_FILTERS = [
  'Anywhere',
  'Near me',
  'Kitsilano',
  'Mount Pleasant',
  'Downtown',
  'North Vancouver',
] as const;
export type LocationFilter = (typeof LOCATION_FILTERS)[number];

export function distanceKm(a: string, b: string): number | null {
  const pa = HOODS[a];
  const pb = HOODS[b];
  if (!pa || !pb) return null;
  if (a === b) return 0.6 + (hash(a + b) % 9) / 10; // same hood: "under a km or so"
  const d = Math.hypot(pa[0] - pb[0], pa[1] - pb[1]);
  return Math.round(d * 10) / 10;
}

export function placeLabel(goal: { hood: string; city: string }, viewerHood?: string) {
  const d = viewerHood ? distanceKm(viewerHood, goal.hood) : null;
  if (d === null) return `${goal.hood} · ${goal.city}`;
  return `${goal.hood} · ${d < 1 ? 'under 1 km' : `${d} km`}`;
}

/* ---------------- Categories ---------------- */

export const CATEGORIES: { name: Category; emoji: string }[] = [
  { name: 'Adventure', emoji: '🧭' },
  { name: 'Fitness', emoji: '🏃' },
  { name: 'Food', emoji: '🍝' },
  { name: 'Creativity', emoji: '🎨' },
  { name: 'Learning', emoji: '📚' },
  { name: 'Travel', emoji: '✈️' },
  { name: 'Career', emoji: '🛠️' },
  { name: 'Community', emoji: '🌱' },
  { name: 'Relationships', emoji: '💛' },
  { name: 'Just for fun', emoji: '🎈' },
];

export const categoryEmoji = (c: Category) => CATEGORIES.find((x) => x.name === c)?.emoji ?? '✨';

export const PRIVACY: Record<Privacy, { label: string; short: string; help: string }> = {
  public: { label: 'Public', short: 'Anyone', help: 'Anyone on Bucketlist can discover it and offer to help.' },
  network: { label: 'Network', short: 'Your people', help: 'Only people in your network can see it.' },
  private: { label: 'Private', short: 'Just you', help: 'Only you can see it. A note to self.' },
};

/* ---------------- Visibility ---------------- */

export function canSee(goal: Goal, viewer: Person, owner: Person | undefined) {
  if (goal.ownerId === viewer.id) return true;
  if (goal.privacy === 'public') return true;
  if (goal.privacy === 'network') return !!owner && owner.network.includes(viewer.id);
  return false;
}

export function fundedPct(goal: Goal) {
  if (!goal.funding?.enabled || !goal.funding.target) return 0;
  return Math.min(100, Math.round((goal.funding.raised / goal.funding.target) * 100));
}

export function backerCount(goal: Goal) {
  return goal.funding ? goal.funding.baseBackers + goal.funding.backers.length : 0;
}
