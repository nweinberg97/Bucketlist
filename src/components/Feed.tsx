import type { CSSProperties } from 'react';
import type { Goal, Person } from '../types';
import { helperCount, useStore } from '../store/store';
import { useUI } from '../store/ui';
import { Avatar } from './ui';
import { Icon, type IconName } from './Icon';
import { distanceKm, fundedPct } from '../lib/util';
import type { AppState } from '../types';

/* ------------------------------------------------------------------ */
/* Per-person tint — each list gets its own quiet colour               */
/* ------------------------------------------------------------------ */

/** Subtle tints derived from a person's hue, nudged away from purple so they stay in the ocean/sun family. */
export function tintFor(p: Person) {
  let h = p.hue;
  if (h > 250 && h < 335) h = 228; // keep violets in the sky-blue range
  if (p.kind === 'business') h = 218;
  return {
    bg: `hsl(${h} 82% 96.5%)`,
    line: `hsl(${h} 55% 88%)`,
    ink: `hsl(${h} 58% 32%)`,
    dot: `hsl(${h} 70% 52%)`,
  };
}

/* ------------------------------------------------------------------ */
/* The four ways to help — also the feed's main filter                 */
/* ------------------------------------------------------------------ */

export type Way = 'all' | 'help' | 'fund' | 'sponsor' | 'promote';

export const WAYS: { id: Way; icon: IconName; name: string; line: string; empty: string }[] = [
  { id: 'all', icon: 'compass', name: 'Everything', line: 'Every open goal around you.', empty: 'Nothing open nearby yet.' },
  { id: 'help', icon: 'hand', name: 'Help', line: 'Skills, gear, time or an introduction.', empty: 'No one has asked for a hand nearby.' },
  { id: 'fund', icon: 'coin', name: 'Fund', line: 'Chip in. A contribution, no strings.', empty: 'No goals are raising money nearby.' },
  { id: 'sponsor', icon: 'store', name: 'Sponsor', line: 'Co-create the moment with gear, space or an experience.', empty: 'No goals are open to sponsors nearby.' },
  { id: 'promote', icon: 'megaphone', name: 'Promote', line: 'Share it with your people, with their OK.', empty: 'Nothing to share right now.' },
];

export function matchesWay(g: Goal, way: Way) {
  switch (way) {
    case 'all':
      return true;
    case 'help':
      return g.needs.length > 0;
    case 'fund':
      return !!g.funding?.enabled && fundedPct(g) < 100;
    case 'sponsor':
      return !!g.sponsorship?.open;
    case 'promote':
      return g.privacy === 'public' && g.shares < 6;
  }
}

/** Group goals into people's lists (open goals only), ordered by distance from the viewer. */
export function groupByPerson(state: AppState, goals: Goal[], viewer: Person, keepOrder = false) {
  const map = new Map<string, Goal[]>();
  for (const g of goals) {
    if (g.status === 'done' || g.ownerId === viewer.id) continue;
    if (!map.has(g.ownerId)) map.set(g.ownerId, []);
    map.get(g.ownerId)!.push(g);
  }
  const rows = [...map.entries()].map(([id, gs]) => ({
    person: state.people[id],
    goals: gs.sort((a, b) => (a.status === 'progress' ? 0 : 1) - (b.status === 'progress' ? 0 : 1)),
  }));
  if (!keepOrder) rows.sort((a, b) => (distanceKm(viewer.hood, a.person.hood) ?? 50) - (distanceKm(viewer.hood, b.person.hood) ?? 50));
  return rows;
}

/* ------------------------------------------------------------------ */
/* One person's open bucketlist, as a calm coloured row                */
/* ------------------------------------------------------------------ */

export function PersonRow({ person, goals, max = 6 }: { person: Person; goals: Goal[]; max?: number }) {
  const { me } = useStore();
  const { go } = useUI();
  const t = tintFor(person);
  const d = distanceKm(me.hood, person.hood);
  const shown = goals.slice(0, max);
  const more = goals.length - shown.length;

  return (
    <article className="rounded-[22px] p-4 ring-1 sm:p-5" style={{ background: t.bg, '--tw-ring-color': t.line } as CSSProperties} data-person-row={person.id}>
      <div className="flex gap-3.5 sm:gap-5">
        <button onClick={() => go({ name: 'person', id: person.id })} className="hidden shrink-0 self-start sm:block" aria-label={`${person.first}'s profile`}>
          <Avatar person={person} size={46} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 sm:items-baseline">
            <button onClick={() => go({ name: 'person', id: person.id })} className="sm:hidden" aria-hidden="true" tabIndex={-1}>
              <Avatar person={person} size={30} />
            </button>
            <button onClick={() => go({ name: 'person', id: person.id })} className="display text-[21px] font-semibold hover:underline" style={{ color: t.ink }}>
              {person.kind === 'business' ? person.name : person.first}
            </button>
            <span className="text-[13px] text-[var(--color-ink-3)]">
              {person.hood}
              {d !== null ? ` · ${d < 1 ? 'under 1 km' : `${d} km`}` : ''}
            </span>
          </div>
          <ul className="mt-3 flex min-w-0 flex-wrap gap-2">
            {shown.map((g) => (
              <li key={g.id} className="max-w-full min-w-0">
                <GoalPill goal={g} tint={t} />
              </li>
            ))}
            {more > 0 && (
              <li>
                <button onClick={() => go({ name: 'person', id: person.id })} className="flex h-9 items-center rounded-full px-3 text-[13px] font-semibold hover:underline" style={{ color: t.ink }}>
                  +{more} more
                </button>
              </li>
            )}
          </ul>
        </div>
      </div>
    </article>
  );
}

function GoalPill({ goal, tint }: { goal: Goal; tint: ReturnType<typeof tintFor> }) {
  const { go } = useUI();
  const pct = fundedPct(goal);
  return (
    <button
      onClick={() => go({ name: 'goal', id: goal.id })}
      className="group flex h-9 max-w-full items-center gap-2 rounded-full bg-white/80 pr-3.5 pl-3 text-[14px] font-medium text-[var(--color-night)] ring-1 transition hover:-translate-y-px hover:bg-white hover:shadow-[var(--shadow-soft)]"
      style={{ '--tw-ring-color': tint.line } as CSSProperties}
      data-item={goal.id}
      title={goal.status === 'progress' ? 'Doing it' : 'Someday'}
    >
      <span
        className="h-2 w-2 shrink-0 rounded-full"
        style={goal.status === 'progress' ? { background: tint.dot } : { boxShadow: `inset 0 0 0 1.5px ${tint.dot}` }}
        aria-hidden="true"
      />
      <span className="truncate">
        <span aria-hidden="true">{goal.emoji}</span> {goal.title}
      </span>
      {goal.funding?.enabled && (
        <span className="flex shrink-0 items-center gap-0.5 text-[12px] font-semibold text-[#8a6200]" title={`${pct}% funded`}>
          <Icon name="coin" size={13} />
          {pct}%
        </span>
      )}
      {goal.sponsorship?.open && <Icon name="store" size={14} className="shrink-0 text-[var(--color-ocean-ink)]" aria-label="Open to sponsors" />}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Quiet text rows for the side rail                                   */
/* ------------------------------------------------------------------ */

export function MiniGoal({ goal, line, action }: { goal: Goal; line: React.ReactNode; action?: React.ReactNode }) {
  const { state } = useStore();
  const { go } = useUI();
  const owner = state.people[goal.ownerId];
  const t = tintFor(owner);
  return (
    <div className="flex items-start gap-3 py-3">
      <button onClick={() => go({ name: 'goal', id: goal.id })} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[18px]" style={{ background: t.bg, boxShadow: `inset 0 0 0 1px ${t.line}` }} aria-hidden="true" tabIndex={-1}>
        {goal.emoji}
      </button>
      <div className="min-w-0 flex-1">
        <button onClick={() => go({ name: 'goal', id: goal.id })} className="block text-left text-[14.5px] font-semibold leading-snug hover:text-[var(--color-ocean)]">
          {goal.title}
        </button>
        <div className="mt-0.5 text-[12.5px] leading-snug text-[var(--color-ink-3)]">{line}</div>
        {action && <div className="mt-2">{action}</div>}
      </div>
    </div>
  );
}

export function helpingLine(state: AppState, g: Goal) {
  const n = helperCount(state, g);
  return n > 0 ? `${n} helping` : 'Be the first to help';
}
