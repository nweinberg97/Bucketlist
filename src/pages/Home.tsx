import { useMemo, useState } from 'react';
import { useStore, useVisibleGoals } from '../store/store';
import { useUI } from '../store/ui';
import { GoalCard, GoalImage } from '../components/GoalCard';
import { Avatar, SectionHead } from '../components/ui';
import { Icon, type IconName } from '../components/Icon';
import { distanceKm, greeting, money, placeLabel, timeAgo } from '../lib/util';
import { introSuggestions, matchesFor, popularity } from '../lib/search';
import { offerSummary } from '../store/store';

const IDEAS = ['Learn to surf', 'See the Northern Lights', 'Play at an open mic', 'Make pasta from scratch', 'Run a half marathon', 'Learn to DJ'];

export const WAYS: { icon: IconName; name: string; line: string; tone: string }[] = [
  { icon: 'hand', name: 'Help', line: 'Skills, gear, time or an intro.', tone: 'bg-[var(--color-ocean)] text-white' },
  { icon: 'coin', name: 'Fund', line: 'Chip in toward the thing.', tone: 'bg-[var(--color-sun)] text-[var(--color-night)]' },
  { icon: 'store', name: 'Sponsor', line: 'A business clears the obstacle.', tone: 'bg-[var(--color-ocean-ink)] text-white' },
  { icon: 'megaphone', name: 'Promote', line: 'Share it with your people.', tone: 'bg-white text-[var(--color-night)] ring-1 ring-[var(--color-line)]' },
];

export function Home() {
  const { me } = useStore();
  return me.kind === 'business' ? <BusinessHome /> : <PersonHome />;
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="scroll-row -mx-4 px-4 md:-mx-8 md:px-8">{children}</div>;
}

function PersonHome() {
  const { state, me } = useStore();
  const { open, go } = useUI();
  const visible = useVisibleGoals();
  const [draft, setDraft] = useState('');

  const others = visible.filter((g) => g.ownerId !== me.id);
  const active = others.filter((g) => g.status !== 'done');

  const around = useMemo(
    () => {
      const near = active.filter((g) => (distanceKm(me.hood, g.hood) ?? 99) <= 5).sort((a, b) => (distanceKm(me.hood, a.hood) ?? 0) - (distanceKm(me.hood, b.hood) ?? 0));
      // one goal per person first, so the row feels like a neighbourhood, not one profile
      const seen = new Set<string>();
      const firsts = near.filter((g) => (seen.has(g.ownerId) ? false : (seen.add(g.ownerId), true)));
      return [...firsts, ...near.filter((g) => !firsts.includes(g))].slice(0, 8);
    },
    [active, me.hood],
  );
  const matches = useMemo(() => matchesFor(state, me, active).slice(0, 4), [state, me, active]);
  const intros = useMemo(() => introSuggestions(state, me, active).slice(0, 3), [state, me, active]);
  const rallying = useMemo(() => active.filter((g) => g.funding?.enabled || g.sponsorship?.open).sort((a, b) => popularity(state, b) - popularity(state, a)).slice(0, 6), [active, state]);
  const mine = Object.values(state.goals).filter((g) => g.ownerId === me.id);
  const myActive = mine.filter((g) => g.status !== 'done').sort((a, b) => (a.status === 'progress' ? -1 : 1) - (b.status === 'progress' ? -1 : 1)).slice(0, 4);
  const completed = others
    .filter((g) => g.status === 'done' && g.completedAt && me.network.includes(g.ownerId))
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
    .slice(0, 4);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    open({ type: 'composer', title: draft.trim() || undefined });
    setDraft('');
  };

  return (
    <div className="animate-fade">
      {/* ---------------- Hero ---------------- */}
      <section className="horizon-soft">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 pt-10 pb-12 md:px-8 md:pt-16 md:pb-16 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">
              {greeting()}, {me.first}.
            </p>
            <h1 className="display mt-3 text-[44px] font-semibold sm:text-[64px] lg:text-[80px]">
              What do you
              <br />
              want to <span className="relative inline-block">do<svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 100 12" preserveAspectRatio="none" aria-hidden="true"><path d="M2 8 C 30 2, 70 2, 98 7" stroke="#ffc83d" strokeWidth="5" fill="none" strokeLinecap="round" /></svg></span>?
            </h1>
            <form onSubmit={submit} className="mt-8 flex max-w-xl items-center gap-2 rounded-full bg-white p-2 pl-5 shadow-[var(--shadow-lift)] ring-1 ring-[var(--color-line)]">
              <span className="quote text-xl text-[var(--color-ink-3)]">I want to</span>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="learn to surf…"
                className="min-w-0 flex-1 bg-transparent text-[17px] font-medium outline-none placeholder:text-[var(--color-ink-4)]"
                aria-label="What do you want to do?"
              />
              <button className="btn btn-help shrink-0" type="submit">
                <Icon name="plus" size={18} strokeWidth={2.4} />
                <span className="hidden sm:inline">Add it</span>
              </button>
            </form>
            <div className="mt-4 flex flex-wrap gap-2">
              {IDEAS.slice(0, 4).map((i) => (
                <button key={i} className="chip !h-8 !text-[13px]" onClick={() => open({ type: 'composer', title: i })}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--radius-xl2)] bg-white/70 p-5 ring-1 ring-[var(--color-line)] backdrop-blur md:p-6">
            <p className="eyebrow">Your bucket list doesn't have to be done alone</p>
            <p className="display mt-2 text-[22px] font-semibold leading-tight">Four ways people make each other's goals happen.</p>
            <div className="mt-4 grid grid-cols-2 gap-2.5">
              {WAYS.map((w) => (
                <div key={w.name} className="rounded-2xl bg-white p-3.5 ring-1 ring-[var(--color-line)]">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full ${w.tone}`}>
                    <Icon name={w.icon} size={16} />
                  </span>
                  <p className="mt-2.5 font-semibold">{w.name}</p>
                  <p className="text-[13px] leading-snug text-[var(--color-ink-3)]">{w.line}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] space-y-16 px-4 py-12 md:px-8 md:py-16">
        {/* ---------------- Around you ---------------- */}
        <section>
          <SectionHead
            title={`Around ${me.hood}`}
            sub="What people within a few kilometres want to do."
            action={
              <a href="#/discover" className="btn btn-ghost btn-sm hidden sm:inline-flex">
                See all <Icon name="arrowRight" size={16} />
              </a>
            }
          />
          <Row>
            {around.map((g) => (
              <GoalCard key={g.id} goal={g} variant="compact" fixed />
            ))}
          </Row>
        </section>

        {/* ---------------- Matching ---------------- */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <SectionHead title="You might be able to help" sub={`Matched to what you know — ${me.interests.slice(0, 3).join(', ').toLowerCase()}.`} />
            <div className="grid gap-5 sm:grid-cols-2">
              {matches.slice(0, 2).map(({ goal, reason }) => (
                <GoalCard key={goal.id} goal={goal} variant="compact" reason={`${reason} · ${placeLabel(goal, me.hood).split(' · ')[1]}`} />
              ))}
            </div>
          </div>
          <div>
            <SectionHead title="You might know someone" sub="Sometimes the best help is an introduction." />
            <div className="space-y-3">
              {intros.map(({ goal, friend, reason }) => {
                const owner = state.people[goal.ownerId];
                return (
                  <div key={goal.id} className="card flex gap-4 p-4">
                    <button onClick={() => go({ name: 'goal', id: goal.id })} className="shrink-0">
                      <GoalImage goal={goal} className="h-20 w-20 overflow-hidden rounded-2xl" />
                    </button>
                    <div className="min-w-0 flex-1">
                      <button onClick={() => go({ name: 'goal', id: goal.id })} className="text-left font-semibold leading-tight hover:underline">
                        {goal.emoji} {goal.title}
                      </button>
                      <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">
                        {owner.first} needs: {goal.needs[0]?.toLowerCase() ?? 'a hand'}.
                      </p>
                      <div className="mt-2.5 flex items-center justify-between gap-2">
                        <span className="flex min-w-0 items-center gap-1.5 text-[12px] text-[var(--color-ink-3)]">
                          <Avatar person={friend} size={20} />
                          <span className="truncate">
                            <b className="font-semibold text-[var(--color-ink-2)]">{friend.first}</b> · {reason}
                          </span>
                        </span>
                        <button className="btn btn-quiet btn-sm !h-8 shrink-0 !text-[13px]" onClick={() => open({ type: 'help', goalId: goal.id, mode: 'someone', friendId: friend.id })}>
                          Introduce
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------- Rallying ---------------- */}
        <section>
          <SectionHead title="People rallying around" sub="Goals picking up backers, sponsors and momentum." />
          <Row>
            {rallying.map((g) => (
              <GoalCard key={g.id} goal={g} variant="compact" fixed />
            ))}
          </Row>
        </section>

        {/* ---------------- Your list + completed ---------------- */}
        <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
          <div>
            <SectionHead
              title="Your bucketlist"
              action={
                <a href="#/list" className="btn btn-ghost btn-sm">
                  Open <Icon name="arrowRight" size={16} />
                </a>
              }
            />
            <div className="card divide-y divide-[var(--color-line)] overflow-hidden">
              {myActive.map((g) => (
                <button key={g.id} onClick={() => go({ name: 'goal', id: g.id })} className="flex w-full items-center gap-4 p-4 text-left transition hover:bg-[var(--color-sand-wash)]">
                  <GoalImage goal={g} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">
                      {g.emoji} {g.title}
                    </span>
                    <span className="block text-[13px] text-[var(--color-ink-3)]">
                      {g.status === 'progress' ? 'In progress' : 'Want to do'}
                      {g.steps && g.steps.total > 1 ? ` · ${g.steps.done}/${g.steps.total} ${g.steps.label}` : ''}
                      {g.funding?.enabled ? ` · ${money(g.funding.raised)} raised` : ''}
                    </span>
                  </span>
                  <Icon name="arrowRight" size={16} className="text-[var(--color-ink-4)]" />
                </button>
              ))}
              <button onClick={() => open({ type: 'composer' })} className="flex w-full items-center gap-3 p-4 font-semibold text-[var(--color-ocean)] transition hover:bg-[var(--color-sky-wash)]">
                <span className="flex h-14 w-14 items-center justify-center rounded-xl border-2 border-dashed border-[var(--color-ocean)]/30">
                  <Icon name="plus" size={20} />
                </span>
                What's next?
              </button>
            </div>
          </div>
          <div>
            <SectionHead title="Recently done" sub="From people you know." />
            <div className="grid grid-cols-2 gap-3">
              {completed.map((g) => {
                const o = state.people[g.ownerId];
                return (
                  <button key={g.id} onClick={() => go({ name: 'goal', id: g.id })} className="group relative overflow-hidden rounded-[var(--radius-card)] text-left">
                    <GoalImage goal={g} className="aspect-[4/5] w-full transition duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[rgb(8_14_34/0.85)] via-[rgb(8_14_34/0.15)] to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <span className="pill bg-[var(--color-sun)] text-[var(--color-night)]">
                        <Icon name="check" size={12} strokeWidth={3} /> {o.first} did it
                      </span>
                      <p className="mt-2 font-semibold leading-tight">{g.title}</p>
                      <p className="quote mt-1 line-clamp-2 text-[15px] text-white/85">{g.outcome}</p>
                      <p className="mt-1 text-[11px] text-white/60">{g.completedAt ? `${timeAgo(g.completedAt)} ago` : ''}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Business perspective                                                */
/* ------------------------------------------------------------------ */

function BusinessHome() {
  const { state, me } = useStore();
  const { go } = useUI();
  const visible = useVisibleGoals();
  const open = visible.filter((g) => g.sponsorship?.open && g.status !== 'done' && g.ownerId !== me.id);
  const matched = matchesFor(state, me, open);
  const matchedIds = new Set(matched.map((m) => m.goal.id));
  const rest = open.filter((g) => !matchedIds.has(g.id)).sort((a, b) => (distanceKm(me.hood, a.hood) ?? 0) - (distanceKm(me.hood, b.hood) ?? 0));
  const mine = state.sponsorOffers.filter((o) => o.fromId === me.id);

  return (
    <div className="animate-fade">
      <section className="golden-glow relative overflow-hidden text-white">
        <div className="mx-auto max-w-[1440px] px-4 pt-12 pb-14 md:px-8 md:pt-16 md:pb-20">
          <div className="flex items-center gap-3">
            <Avatar person={me} size={44} />
            <div>
              <p className="text-[13px] font-semibold text-white/80">{greeting()},</p>
              <p className="font-semibold">{me.name}</p>
            </div>
          </div>
          <h1 className="display mt-6 max-w-3xl text-[42px] font-semibold sm:text-[60px] lg:text-[72px]">Whose goal could you make happen this week?</h1>
          <p className="mt-4 max-w-xl text-[17px] text-white/85">
            The best sponsor isn't the one who gives the most. It's the one who removes the biggest obstacle. Here's where {me.kind === 'business' ? 'what you do' : 'you'} could matter.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-[1440px] space-y-16 px-4 py-12 md:px-8 md:py-16">
        {matched.length > 0 && (
          <section>
            <SectionHead title="Matched to what you do" sub={`Goals that need exactly the kind of thing ${me.name} has.`} />
            <div className="masonry">
              {matched.map(({ goal, reason }) => (
                <GoalCard key={goal.id} goal={goal} reason={reason} />
              ))}
            </div>
          </section>
        )}

        {mine.length > 0 && (
          <section>
            <SectionHead title="Your offers" />
            <div className="card divide-y divide-[var(--color-line)]">
              {mine.map((o) => {
                const g = state.goals[o.goalId];
                return (
                  <button key={o.id} onClick={() => go({ name: 'goal', id: g.id })} className="flex w-full items-center gap-4 p-4 text-left hover:bg-[var(--color-sand-wash)]">
                    <GoalImage goal={g} className="h-14 w-14 shrink-0 overflow-hidden rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{g.title}</span>
                      <span className="block truncate text-[13px] text-[var(--color-ink-3)]">{offerSummary(o)}</span>
                    </span>
                    <span className={`pill ${o.status === 'accepted' ? 'bg-[var(--color-sun)]' : o.status === 'declined' ? 'bg-[var(--color-mist)] text-[var(--color-ink-3)]' : 'bg-[var(--color-sky-wash)] text-[var(--color-ocean-deep)]'}`}>
                      {o.status === 'accepted' ? 'Accepted' : o.status === 'declined' ? 'Declined' : 'Waiting'}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        <section>
          <SectionHead title="Looking for a sponsor" sub="Nearby goals where the owner has asked for business support." />
          <div className="masonry">
            {rest.map((g) => (
              <GoalCard key={g.id} goal={g} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
