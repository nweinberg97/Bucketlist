import { useState } from 'react';
import type { Goal, Privacy, Status } from '../types';
import { helperCount, useStore } from '../store/store';
import { useUI } from '../store/ui';
import { GoalImage } from '../components/GoalCard';
import { FundingBar, PrivacyBadge } from '../components/ui';
import { Icon } from '../components/Icon';
import { PRIVACY, money } from '../lib/util';

const COLUMNS: { status: Status; title: string; sub: string }[] = [
  { status: 'want', title: 'Want to do', sub: "Haven't started. Yet." },
  { status: 'progress', title: 'In progress', sub: 'Actively making it happen.' },
  { status: 'done', title: 'Done', sub: 'You did these.' },
];

const NEXT_PRIVACY: Record<Privacy, Privacy> = { public: 'network', network: 'private', private: 'public' };

export function MyList() {
  const { state, me } = useStore();
  const { open } = useUI();
  const [tab, setTab] = useState<Status>('progress');
  const mine = Object.values(state.goals)
    .filter((g) => g.ownerId === me.id)
    .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt));
  const by = (s: Status) => mine.filter((g) => g.status === s);
  const helping = mine.reduce((s, g) => s + helperCount(state, g), 0);

  return (
    <div className="animate-fade">
      <section className="horizon-soft">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-6 px-4 pt-10 pb-10 md:px-8 md:pt-14">
          <div>
            <p className="eyebrow">{me.name}'s bucketlist</p>
            <h1 className="display mt-2 text-[44px] font-semibold sm:text-[60px]">There's room for more.</h1>
            <p className="mt-3 text-[16px] text-[var(--color-ink-3)]">
              <b className="text-[var(--color-night)]">{by('want').length + by('progress').length}</b> to go · <b className="text-[var(--color-night)]">{by('done').length}</b> done ·{' '}
              <b className="text-[var(--color-night)]">{helping}</b> people helping you
            </p>
          </div>
          <button className="btn btn-help btn-lg" onClick={() => open({ type: 'composer' })} data-add-goal>
            <Icon name="plus" size={19} strokeWidth={2.4} /> Add a goal
          </button>
        </div>
      </section>

      {/* mobile tabs */}
      <div className="sticky top-[68px] z-20 border-b border-[var(--color-line)] bg-[var(--color-cloud)]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <div className="grid grid-cols-3 gap-1 rounded-full bg-[var(--color-mist)] p-1">
          {COLUMNS.map((c) => (
            <button key={c.status} onClick={() => setTab(c.status)} className={`h-9 rounded-full text-[13px] font-semibold transition ${tab === c.status ? 'bg-white shadow-[var(--shadow-soft)]' : 'text-[var(--color-ink-3)]'}`}>
              {c.title} <span className="text-[var(--color-ink-4)]">{by(c.status).length}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto grid max-w-[1440px] gap-6 px-4 py-8 md:px-8 lg:grid-cols-3 lg:py-10">
        {COLUMNS.map((c) => (
          <section key={c.status} className={`${tab === c.status ? 'block' : 'hidden'} lg:block`} data-column={c.status}>
            <div className="mb-4 hidden items-baseline justify-between lg:flex">
              <h2 className="display text-2xl font-semibold">
                {c.title} <span className="text-[var(--color-ink-4)]">{by(c.status).length}</span>
              </h2>
              <span className="text-[13px] text-[var(--color-ink-3)]">{c.sub}</span>
            </div>
            <div className={`space-y-3 rounded-[var(--radius-xl2)] p-2 ${c.status === 'done' ? 'bg-[var(--color-sun-wash)]/70' : 'bg-[var(--color-mist)]/70'}`}>
              {by(c.status).map((g) => (
                <ListCard key={g.id} goal={g} />
              ))}
              {by(c.status).length === 0 && (
                <div className="px-4 py-10 text-center text-[14px] text-[var(--color-ink-3)]">
                  {c.status === 'want' ? 'Nothing on the someday pile. What have you always talked about doing?' : c.status === 'progress' ? 'Pick something from “Want to do” and start.' : 'Your first “You did it.” goes here.'}
                </div>
              )}
              {c.status === 'want' && (
                <button onClick={() => open({ type: 'composer' })} className="flex w-full items-center justify-center gap-2 rounded-[18px] border-2 border-dashed border-[var(--color-line)] py-4 text-[14px] font-semibold text-[var(--color-ink-3)] transition hover:border-[var(--color-ocean)] hover:text-[var(--color-ocean)]">
                  <Icon name="plus" size={17} /> What's next?
                </button>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function ListCard({ goal }: { goal: Goal }) {
  const { state, dispatch } = useStore();
  const { go, open, toast } = useUI();
  const helping = helperCount(state, goal);
  const pending =
    state.sponsorOffers.filter((o) => o.goalId === goal.id && o.status === 'pending').length + state.promotions.filter((p) => p.goalId === goal.id && p.status === 'pending').length;

  const move = (s: Status) => {
    dispatch({ type: 'goal/status', id: goal.id, status: s });
    if (s === 'done') open({ type: 'celebrate', goalId: goal.id });
    else toast(s === 'progress' ? `Started: ${goal.title}` : 'Moved back to Want to do');
  };

  return (
    <article className="group overflow-hidden rounded-[18px] bg-white shadow-[var(--shadow-soft)] ring-1 ring-[var(--color-line)] transition hover:shadow-[var(--shadow-lift)]" data-list-goal={goal.id}>
      <button className="flex w-full gap-3.5 p-3.5 text-left" onClick={() => go({ name: 'goal', id: goal.id })}>
        <GoalImage goal={goal} className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold leading-snug">
            {goal.emoji} {goal.title}
          </span>
          <span className="mt-1 block text-[12.5px] text-[var(--color-ink-3)]">
            {goal.category}
            {goal.targetDate && goal.status !== 'done' ? ` · by ${new Date(goal.targetDate + '-01T12:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}` : ''}
            {helping > 0 ? ` · ${helping} helping` : ''}
          </span>
          {goal.status === 'done' && goal.outcome && <span className="quote mt-1 line-clamp-2 block text-[15px] text-[var(--color-ink-2)]">“{goal.outcome}”</span>}
          {goal.steps && goal.steps.total > 1 && goal.status !== 'done' && (
            <span className="mt-2 flex items-center gap-2 text-[12px] text-[var(--color-ink-3)]">
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--color-mist)]">
                <span className="block h-full rounded-full bg-[var(--color-ocean)]" style={{ width: `${(goal.steps.done / goal.steps.total) * 100}%` }} />
              </span>
              {goal.steps.done}/{goal.steps.total}
            </span>
          )}
        </span>
      </button>

      {goal.funding?.enabled && goal.status !== 'done' && (
        <div className="space-y-1.5 px-3.5 pb-1">
          <FundingBar raised={goal.funding.raised} target={goal.funding.target} size="sm" />
          <p className="text-[12px] text-[var(--color-ink-3)]">
            {money(goal.funding.raised)} of {money(goal.funding.target)}
          </p>
        </div>
      )}

      <div className="flex items-center gap-1.5 border-t border-[var(--color-line)] px-3 py-2.5">
        <button
          onClick={() => {
            const next = NEXT_PRIVACY[goal.privacy];
            dispatch({ type: 'goal/update', id: goal.id, patch: { privacy: next } });
            toast(`${PRIVACY[next].label}: ${PRIVACY[next].help}`);
          }}
          title="Change who can see this"
          className="rounded-full ring-1 ring-[var(--color-line)] transition hover:ring-[var(--color-ocean)]"
          data-privacy-toggle
        >
          <PrivacyBadge privacy={goal.privacy} />
        </button>
        {pending > 0 && <span className="pill bg-[var(--color-sun)] text-[var(--color-night)]">{pending} waiting</span>}
        <span className="ml-auto flex gap-1">
          {goal.status === 'want' && (
            <button className="btn btn-quiet btn-sm !h-8 !px-3 !text-[13px]" onClick={() => move('progress')}>
              Start
            </button>
          )}
          {goal.status !== 'done' ? (
            <button className="btn btn-sm !h-8 !px-3 !text-[13px] bg-[var(--color-sun-wash)] text-[#7a5600] hover:bg-[var(--color-sun)]" onClick={() => move('done')} data-mark-done>
              <Icon name="check" size={14} strokeWidth={2.6} /> Done
            </button>
          ) : (
            <button className="btn btn-ghost btn-sm !h-8 !px-3 !text-[13px]" onClick={() => move('progress')}>
              Undo
            </button>
          )}
          <button className="btn btn-ghost btn-sm !h-8 !w-8 !px-0" aria-label="Edit goal" onClick={() => open({ type: 'composer', goalId: goal.id })}>
            <Icon name="edit" size={15} />
          </button>
        </span>
      </div>
    </article>
  );
}
