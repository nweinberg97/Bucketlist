import type { Goal, Person } from '../types';
import { helperCount, useStore } from '../store/store';
import { useUI } from '../store/ui';
import { GoalImage } from './GoalCard';
import { Avatar, AvatarStack, SocialBadges } from './ui';
import { Icon } from './Icon';
import { distanceKm, fundedPct } from '../lib/util';

/**
 * A person's public bucketlist as one social object: who they are, a glimpse of
 * what they're chasing, and every item tappable into its own page (help, fund, sponsor, promote).
 */
export function ListCard({
  owner,
  goals,
  total,
  compact = false,
  matched = false,
}: {
  owner: Person;
  /** goals to show, already ordered — the matching ones when searching */
  goals: Goal[];
  /** all visible active goals on this person's list */
  total: number;
  compact?: boolean;
  /** true when the shown goals are search/filter matches */
  matched?: boolean;
}) {
  const { state, me } = useStore();
  const { go } = useUI();
  const max = compact ? 3 : 5;
  const shown = goals.slice(0, max);
  const more = total - shown.length;
  const done = Object.values(state.goals).filter((g) => g.ownerId === owner.id && g.status === 'done' && g.privacy !== 'private').length;
  const d = distanceKm(me.hood, owner.hood);
  const mutuals = me.network.filter((x) => owner.network.includes(x) && x !== me.id).map((x) => state.people[x]);
  const cover = shown.slice(0, 3);
  const isMe = owner.id === me.id;

  return (
    <article className={`card overflow-hidden ${compact ? 'w-[300px] shrink-0 sm:w-[340px]' : ''}`} data-list={owner.id}>
      {/* cover mosaic — the first three things on their list */}
      <button className="block w-full" onClick={() => go({ name: 'person', id: owner.id })} aria-label={`Open ${owner.name}'s bucketlist`}>
        {cover.length >= 3 ? (
          <div className={`grid grid-cols-[1.6fr_1fr] gap-0.5 ${compact ? 'h-40' : 'h-52'}`}>
            <GoalImage goal={cover[0]} className="row-span-2 h-full" w={600} />
            <GoalImage goal={cover[1]} className="h-full" w={360} />
            <GoalImage goal={cover[2]} className="h-full" w={360} />
          </div>
        ) : cover.length === 2 ? (
          <div className={`grid grid-cols-2 gap-0.5 ${compact ? 'h-40' : 'h-48'}`}>
            <GoalImage goal={cover[0]} className="h-full" w={500} />
            <GoalImage goal={cover[1]} className="h-full" w={500} />
          </div>
        ) : (
          cover[0] && <GoalImage goal={cover[0]} className={compact ? 'h-40' : 'h-48'} w={800} />
        )}
      </button>

      <div className={compact ? 'p-4' : 'p-5'}>
        <button onClick={() => go({ name: 'person', id: owner.id })} className="group flex w-full items-center gap-3 text-left">
          <Avatar person={owner} size={compact ? 38 : 44} />
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="display truncate text-[19px] font-semibold group-hover:underline">{isMe ? 'Your bucketlist' : `${owner.first}'s bucketlist`}</span>
              <SocialBadges person={owner} />
            </span>
            <span className="block truncate text-[13px] text-[var(--color-ink-3)]">
              {owner.hood}
              {d !== null && !isMe ? ` · ${d < 1 ? 'under 1 km' : `${d} km`}` : ''} · {total} to go{done ? ` · ${done} done` : ''}
            </span>
          </span>
        </button>

        {!compact && <p className="quote mt-3 line-clamp-2 text-[16px] leading-snug text-[var(--color-ink-2)]">“{owner.bio}”</p>}

        {matched && <p className="eyebrow mt-4 !text-[10px] !text-[var(--color-ocean)]">On their list</p>}
        <ul className={`${matched ? 'mt-2' : 'mt-4'} divide-y divide-[var(--color-line)] border-y border-[var(--color-line)]`}>
          {shown.map((g) => (
            <li key={g.id}>
              <ListRow goal={g} />
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center justify-between gap-2">
          {mutuals.length > 0 && !isMe ? (
            <span className="flex min-w-0 items-center gap-2 text-[12px] text-[var(--color-ink-3)]">
              <AvatarStack people={mutuals} size={20} max={3} />
              <span className="truncate">You both know {mutuals[0].first}</span>
            </span>
          ) : (
            <span />
          )}
          <button onClick={() => go({ name: 'person', id: owner.id })} className="shrink-0 text-[13px] font-semibold text-[var(--color-ocean)] hover:underline">
            {more > 0 ? `+${more} more on the list` : 'See the full list'}
          </button>
        </div>
      </div>
    </article>
  );
}

function ListRow({ goal }: { goal: Goal }) {
  const { state, me } = useStore();
  const { go } = useUI();
  const helping = helperCount(state, goal);
  const pct = fundedPct(goal);
  const mine = goal.ownerId === me.id;

  let signal: React.ReactNode;
  if (goal.funding?.enabled) {
    signal = (
      <span className="flex items-center gap-1.5">
        <span className="h-1.5 w-12 overflow-hidden rounded-full bg-[var(--color-sand)]">
          <span className="block h-full rounded-full bg-[var(--color-sun)]" style={{ width: `${pct}%` }} />
        </span>
        {pct}% funded
      </span>
    );
  } else if (goal.sponsorship?.open) {
    signal = <span className="font-semibold text-[#8a6200]">Looking for a sponsor</span>;
  } else if (helping > 0) {
    signal = <span>{helping} helping</span>;
  } else {
    signal = <span>{mine ? 'Nobody yet' : 'Be the first to help'}</span>;
  }

  return (
    <button onClick={() => go({ name: 'goal', id: goal.id })} className="group flex w-full items-center gap-3 py-2.5 text-left" data-list-row={goal.id}>
      <GoalImage goal={goal} className="h-11 w-11 shrink-0 rounded-xl" w={160} />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold leading-tight group-hover:text-[var(--color-ocean)]">
          {goal.emoji} {goal.title}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-[var(--color-ink-3)]">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${goal.status === 'progress' ? 'bg-[var(--color-ocean)]' : 'bg-[var(--color-ink-4)]'}`} />
          {goal.status === 'progress' ? 'Doing it' : 'Someday'} · {signal}
        </span>
      </span>
      <Icon name="arrowRight" size={16} className="shrink-0 text-[var(--color-ink-4)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-ocean)]" />
    </button>
  );
}
