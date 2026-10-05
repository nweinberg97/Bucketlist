import type { Goal } from '../types';
import { GoalArt } from './GoalArt';
import { Avatar, FundingBar, PrivacyBadge } from './ui';
import { Icon } from './Icon';
import { helperCount, myOffersFor, useStore } from '../store/store';
import { useUI } from '../store/ui';
import { backerCount, categoryEmoji, hash, money, placeLabel, timeAgo } from '../lib/util';

const ASPECTS = ['aspect-[4/5]', 'aspect-[1/1]', 'aspect-[5/4]', 'aspect-[4/5]', 'aspect-[3/4]'];

export function GoalImage({ goal, className = '' }: { goal: Goal; className?: string }) {
  if (goal.image) return <img src={goal.image} alt="" className={`object-cover ${className}`} loading="lazy" />;
  return <GoalArt scene={goal.scene} className={className} />;
}

/** Contextual primary action — the goal decides what kind of help it most needs. */
export function useGoalActions(goal: Goal) {
  const { state, me } = useStore();
  const { open } = useUI();
  const mine = goal.ownerId === me.id;
  const offers = myOffersFor(state, goal.id);
  const isBiz = me.kind === 'business';
  const canFund = !!goal.funding?.enabled && goal.status !== 'done';
  const canSponsor = !!goal.sponsorship?.open && goal.status !== 'done';
  const canAct = !mine && goal.status !== 'done' && goal.privacy !== 'private';
  const primary: 'help' | 'fund' | 'sponsor' | null = !canAct ? null : isBiz && canSponsor ? 'sponsor' : canFund && !isBiz ? 'fund' : 'help';
  return {
    mine,
    offers,
    isBiz,
    canFund,
    canSponsor,
    canAct,
    primary,
    help: () => open({ type: 'help', goalId: goal.id }),
    fund: () => open({ type: 'fund', goalId: goal.id }),
    sponsor: () => open({ type: 'sponsor', goalId: goal.id }),
    promote: () => open({ type: 'promote', goalId: goal.id }),
  };
}

function Signal({ goal }: { goal: Goal }) {
  const { state } = useStore();
  if (goal.status === 'done') {
    return goal.outcome ? (
      <div className="flex items-start gap-2 rounded-2xl bg-[var(--color-sun-wash)] px-3 py-2.5 text-[13.5px] text-[var(--color-ink-2)]">
        <span className="mt-0.5 text-[var(--color-sun-deep)]">
          <Icon name="check" size={15} strokeWidth={2.8} />
        </span>
        <span>{goal.outcome}</span>
      </div>
    ) : null;
  }
  if (goal.funding?.enabled) {
    return (
      <div className="space-y-2">
        <FundingBar raised={goal.funding.raised} target={goal.funding.target} size="sm" />
        <div className="flex items-baseline justify-between text-[13px]">
          <span className="font-semibold">
            {money(goal.funding.raised)} <span className="font-normal text-[var(--color-ink-3)]">of {money(goal.funding.target)}</span>
          </span>
          <span className="text-[var(--color-ink-3)]">{backerCount(goal)} backing</span>
        </div>
      </div>
    );
  }
  const helping = helperCount(state, goal);
  return (
    <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--color-ink-3)]">
      {goal.steps && goal.steps.total > 1 && (
        <span className="pill bg-[var(--color-sky-wash)] text-[var(--color-ocean-deep)]">
          {goal.steps.done} / {goal.steps.total} {goal.steps.label}
        </span>
      )}
      {goal.sponsorship?.open && <span className="pill bg-[var(--color-sun-wash)] text-[#8a6200]">Looking for a sponsor</span>}
      {helping > 0 ? (
        <span className="inline-flex items-center gap-1.5">
          <Icon name="hand" size={14} /> {helping} {helping === 1 ? 'person' : 'people'} helping
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <Icon name="sparkle" size={14} /> Be the first to help
        </span>
      )}
    </div>
  );
}

export function GoalCard({ goal, variant = 'feed', reason }: { goal: Goal; variant?: 'feed' | 'compact'; reason?: string }) {
  const { state, me } = useStore();
  const { go } = useUI();
  const owner = state.people[goal.ownerId];
  const a = useGoalActions(goal);
  const aspect = variant === 'compact' ? 'aspect-[5/4]' : ASPECTS[hash(goal.id) % ASPECTS.length];
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    fn();
  };

  return (
    <article
      className={`group card cursor-pointer overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${variant === 'compact' ? 'w-[300px] shrink-0 sm:w-[320px]' : ''}`}
      onClick={() => go({ name: 'goal', id: goal.id })}
      data-goal={goal.id}
    >
      <div className="relative">
        <GoalImage goal={goal} className={`${aspect} w-full transition-transform duration-700 group-hover:scale-[1.03]`} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <span className="pill bg-white/90 text-[var(--color-night)] backdrop-blur">
            <span aria-hidden="true">{goal.emoji || categoryEmoji(goal.category)}</span> {goal.category}
          </span>
          <span className="flex gap-1.5">
            {goal.status === 'done' && (
              <span className="pill bg-[var(--color-sun)] text-[var(--color-night)]">
                <Icon name="check" size={12} strokeWidth={3} /> Done
              </span>
            )}
            {goal.privacy !== 'public' && <PrivacyBadge privacy={goal.privacy} />}
          </span>
        </div>
        {reason && (
          <div className="absolute inset-x-3 bottom-3">
            <span className="pill bg-[var(--color-night)]/85 text-[var(--color-cloud)] backdrop-blur">
              <Icon name="sparkle" size={12} /> {reason}
            </span>
          </div>
        )}
      </div>

      <div className="space-y-3.5 p-5">
        <h3 className="display text-[22px] font-semibold leading-[1.08]">{goal.title}</h3>

        <button className="flex w-full items-center gap-2.5 text-left" onClick={stop(() => go({ name: 'person', id: owner.id }))}>
          <Avatar person={owner} size={26} />
          <span className="min-w-0 text-[13px] leading-tight">
            <span className="block truncate font-semibold text-[var(--color-night)] hover:underline">{goal.ownerId === me.id ? 'You' : owner.name}</span>
            <span className="block truncate text-[var(--color-ink-3)]">
              {placeLabel(goal, me.hood)}
              {goal.status === 'done' && goal.completedAt ? ` · done ${timeAgo(goal.completedAt)} ago` : ''}
            </span>
          </span>
        </button>

        {goal.status !== 'done' && <p className={`quote text-[18px] leading-snug text-[var(--color-ink-2)] ${variant === 'compact' ? 'line-clamp-2' : 'line-clamp-3'}`}>“{goal.story}”</p>}

        <Signal goal={goal} />

        {a.primary && (
          <div className="flex items-center gap-2 pt-1">
            {a.primary === 'fund' && (
              <button className="btn btn-fund btn-sm flex-1" onClick={stop(a.fund)}>
                <Icon name="coin" size={16} /> {a.offers.backed ? 'Back again' : 'Fund'}
              </button>
            )}
            {a.primary === 'sponsor' && (
              <button className="btn btn-sponsor btn-sm flex-1" onClick={stop(a.sponsor)}>
                <Icon name="store" size={16} /> {a.offers.sponsor ? 'Offer sent' : 'Sponsor'}
              </button>
            )}
            <button className={`btn btn-sm ${a.primary === 'help' ? 'btn-help flex-1' : 'btn-quiet'}`} onClick={stop(a.help)}>
              <Icon name="hand" size={16} /> {a.offers.intro ? 'Offered' : 'I can help'}
            </button>
            <button className="btn btn-promote btn-sm !px-0 w-9" aria-label="Promote this goal" title="Promote" onClick={stop(a.promote)}>
              <Icon name="megaphone" size={16} />
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
