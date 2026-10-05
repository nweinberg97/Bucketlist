import type { AppState, Goal, Person } from '../types';
import { distanceKm, fundedPct, type LocationFilter } from './util';

/**
 * Lightweight, explainable search + matching. No model, no backend —
 * a synonym map, simple stemming and weighted fields. Good enough to feel smart in a demo.
 */

const SYNONYMS: Record<string, string[]> = {
  surf: ['surfing', 'surfer', 'waves', 'tofino', 'wetsuit'],
  run: ['running', 'marathon', 'half marathon', 'race', '10k'],
  marathon: ['running', 'race', 'half marathon', 'ironman'],
  japan: ['tokyo', 'kyoto', 'osaka', 'onsen', 'japanese'],
  dj: ['djing', 'turntables', 'mixing', 'records'],
  pottery: ['ceramics', 'clay', 'wheel', 'kiln'],
  sup: ['paddleboard', 'paddleboarding', 'stand-up'],
  paddleboard: ['sup', 'stand-up paddleboarding', 'paddleboarding'],
  film: ['filmmaking', 'movie', 'short film', 'camera'],
  music: ['guitar', 'ep', 'open mic', 'dj', 'band', 'songwriting'],
  hike: ['hiking', 'trail', 'backpacking'],
  paint: ['painting', 'mural', 'art'],
  mural: ['painting', 'wall', 'art'],
  photo: ['photography', 'camera', 'photo book', 'zine'],
  photography: ['photo', 'camera', 'photo book'],
  food: ['cooking', 'restaurants', 'pasta', 'sushi', 'dinner'],
  cook: ['cooking', 'pasta', 'food', 'dinner'],
  aurora: ['northern lights'],
  lights: ['aurora', 'northern lights'],
  garden: ['gardening', 'community garden', 'soil'],
  comedy: ['stand-up', 'open mic'],
  spanish: ['language', 'conversation'],
};

export const SUGGESTED_SEARCHES = ['surfing', 'pottery', 'marathon', 'Japan', 'DJ', 'paddleboard', 'mural'];

const stem = (w: string) => w.toLowerCase().replace(/[^a-z0-9\- ]/g, '').replace(/(ing|ers|er|s)$/, '');

export function expandQuery(q: string): string[] {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  const out = new Set<string>();
  for (const w of words) {
    out.add(w);
    const s = stem(w);
    if (s.length >= 2) out.add(s);
    for (const [k, vals] of Object.entries(SYNONYMS)) {
      if (k === w || k === s || stem(k) === s) vals.forEach((v) => out.add(v));
    }
  }
  return [...out];
}

export function scoreGoal(goal: Goal, owner: Person, terms: string[]): number {
  if (!terms.length) return 1;
  const title = goal.title.toLowerCase();
  const story = goal.story.toLowerCase();
  const tags = goal.tags.join(' ').toLowerCase();
  const meta = `${goal.category} ${goal.hood} ${owner.name} ${goal.needs.join(' ')}`.toLowerCase();
  let score = 0;
  terms.forEach((t, i) => {
    const w = i === 0 ? 1.4 : 1; // the literal query outranks synonyms
    if (title.includes(t)) score += 6 * w;
    if (tags.includes(t)) score += 4 * w;
    if (story.includes(t)) score += 2 * w;
    if (meta.includes(t)) score += 1 * w;
  });
  return score;
}

export type SortKey = 'near' | 'popular' | 'recent';

export interface Filters {
  q: string;
  category: string | null;
  location: LocationFilter;
  funding: boolean;
  sponsor: boolean;
  network: boolean;
  status: 'all' | 'active' | 'done';
  sort: SortKey;
}

export const DEFAULT_FILTERS: Filters = {
  q: '',
  category: null,
  location: 'Anywhere',
  funding: false,
  sponsor: false,
  network: false,
  status: 'active',
  sort: 'near',
};

export function popularity(state: AppState, g: Goal) {
  const helpers = g.baseHelpers + state.intros.filter((i) => i.goalId === g.id).length;
  const backers = g.funding ? g.funding.baseBackers + g.funding.backers.length : 0;
  return helpers * 2 + backers + g.shares * 3 + fundedPct(g) / 20;
}

export function filterGoals(state: AppState, goals: Goal[], f: Filters, viewer: Person) {
  const terms = expandQuery(f.q.trim());
  const rows = goals
    .filter((g) => g.ownerId !== viewer.id)
    .filter((g) => (f.status === 'all' ? true : f.status === 'done' ? g.status === 'done' : g.status !== 'done'))
    .filter((g) => !f.category || g.category === f.category)
    .filter((g) => !f.funding || g.funding?.enabled)
    .filter((g) => !f.sponsor || g.sponsorship?.open)
    .filter((g) => !f.network || viewer.network.includes(g.ownerId))
    .filter((g) => {
      if (f.location === 'Anywhere') return true;
      if (f.location === 'Near me') return (distanceKm(viewer.hood, g.hood) ?? 99) <= 5;
      return g.hood === f.location;
    })
    .map((g) => ({ g, s: scoreGoal(g, state.people[g.ownerId], terms) }))
    .filter((x) => x.s > 0);

  const dist = (g: Goal) => distanceKm(viewer.hood, g.hood) ?? 50;
  rows.sort((a, b) => {
    if (terms.length && a.s !== b.s) return b.s - a.s;
    if (f.sort === 'near') return dist(a.g) - dist(b.g) || popularity(state, b.g) - popularity(state, a.g);
    if (f.sort === 'popular') return popularity(state, b.g) - popularity(state, a.g);
    return b.g.createdAt - a.g.createdAt;
  });
  return rows.map((x) => x.g);
}

/* ---------------- Matching ---------------- */

/** What in the viewer's background overlaps with what this goal needs? Returns a human reason. */
export function matchReason(viewer: Person, goal: Goal): string | null {
  const skills = viewer.skills.map((s) => s.toLowerCase());
  const hit = goal.tags.find((t) => skills.includes(t.toLowerCase()));
  if (!hit) return null;
  const verb: Record<string, string> = {
    surf: 'You surf',
    surfing: 'You surf',
    hiking: 'You hike',
    trail: 'You hike',
    backpacking: 'You backpack',
    photography: 'You shoot photos',
    camera: 'You know cameras',
    paddleboard: 'You paddleboard',
    sup: 'You paddleboard',
    painting: 'You paint',
    paint: 'You sell paint',
    murals: 'You love murals',
    mural: 'You love murals',
    film: 'You know film',
    filmmaking: 'You know film',
    design: 'You design',
    ocean: 'You know the water',
  };
  return verb[hit.toLowerCase()] ?? `You know ${hit}`;
}

export function matchesFor(state: AppState, viewer: Person, goals: Goal[]) {
  return goals
    .filter((g) => g.ownerId !== viewer.id && g.status !== 'done')
    .map((g) => ({ g, reason: matchReason(viewer, g), d: distanceKm(viewer.hood, g.hood) ?? 50 }))
    .filter((x) => x.reason)
    .sort((a, b) => a.d - b.d)
    .map((x) => ({ goal: x.g, reason: x.reason! }));
}

/** People in the viewer's network who could help someone else's goal — "You might know someone". */
export function introSuggestions(state: AppState, viewer: Person, goals: Goal[]) {
  const out: { goal: Goal; friend: Person; reason: string }[] = [];
  for (const g of goals) {
    if (g.ownerId === viewer.id || g.status === 'done') continue;
    if (matchReason(viewer, g)) continue; // already shown as direct help
    for (const fid of viewer.network) {
      const f = state.people[fid];
      if (!f || f.id === g.ownerId) continue;
      const r = matchReason(f, g);
      if (r) {
        out.push({ goal: g, friend: f, reason: f.tagline });
        break;
      }
    }
  }
  return out;
}

/** Potential helpers for a goal page — anyone (not the owner/viewer) whose skills overlap. */
export function potentialHelpers(state: AppState, goal: Goal, viewerId: string) {
  return Object.values(state.people)
    .filter((p) => p.id !== goal.ownerId && p.id !== viewerId)
    .map((p) => ({ p, hit: goal.tags.filter((t) => p.skills.includes(t)).length, d: distanceKm(p.hood, goal.hood) ?? 50 }))
    .filter((x) => x.hit > 0)
    .sort((a, b) => b.hit - a.hit || a.d - b.d)
    .slice(0, 3)
    .map((x) => x.p);
}

export function relatedGoals(goal: Goal, goals: Goal[]) {
  return goals
    .filter((g) => g.id !== goal.id && g.status !== 'done')
    .map((g) => ({ g, s: (g.category === goal.category ? 2 : 0) + g.tags.filter((t) => goal.tags.includes(t)).length * 3 }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.g);
}
