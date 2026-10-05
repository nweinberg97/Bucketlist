import { useMemo, useState } from 'react';
import { offerSummary, useStore, useVisibleGoals } from '../store/store';
import { useUI } from '../store/ui';
import { Avatar, Empty, FundingBar } from '../components/ui';
import { Icon } from '../components/Icon';
import { MiniGoal, PersonRow, WAYS, groupByPerson, helpingLine, matchesWay, type Way } from '../components/Feed';
import { LOCATION_FILTERS, distanceKm, greeting, money, placeLabel, type LocationFilter } from '../lib/util';
import { introSuggestions, matchesFor, popularity } from '../lib/search';

const IDEAS = ['Learn to surf', 'See the Northern Lights', 'Play at an open mic', 'Run a half marathon'];

/**
 * Home is the social feed: people's open bucketlists, one calm coloured row each.
 * Pictures wait until you open a goal; the feed is for spontaneous inspiration.
 */
export function Home() {
  const { state, me } = useStore();
  const { open, go } = useUI();
  const visible = useVisibleGoals();
  const isBiz = me.kind === 'business';
  const [way, setWay] = useState<Way>(isBiz ? 'sponsor' : 'all');
  const [where, setWhere] = useState<LocationFilter>('Anywhere');
  const [draft, setDraft] = useState('');

  const open_ = visible.filter((g) => g.ownerId !== me.id && g.status !== 'done');
  const inArea = open_.filter((g) => {
    if (where === 'Anywhere') return true;
    if (where === 'Near me') return (distanceKm(me.hood, g.hood) ?? 99) <= 5;
    return g.hood === where;
  });
  const rows = useMemo(() => groupByPerson(state, inArea.filter((g) => matchesWay(g, way)), me), [state, inArea, way, me]);
  const counts = useMemo(() => Object.fromEntries(WAYS.map((w) => [w.id, inArea.filter((g) => matchesWay(g, w.id)).length])), [inArea]);
  const activeWay = WAYS.find((w) => w.id === way)!;

  const matches = useMemo(() => matchesFor(state, me, open_).slice(0, 3), [state, me, open_]);
  const intros = useMemo(() => introSuggestions(state, me, open_).slice(0, 2), [state, me, open_]);
  const rallying = useMemo(() => open_.filter((g) => g.funding?.enabled).sort((a, b) => popularity(state, b) - popularity(state, a)).slice(0, 3), [open_, state]);

  const mine = Object.values(state.goals).filter((g) => g.ownerId === me.id && g.status !== 'done').sort((a, b) => (a.status === 'progress' ? 0 : 1) - (b.status === 'progress' ? 0 : 1));
  const myOffers = state.sponsorOffers.filter((o) => o.fromId === me.id);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    open({ type: 'composer', title: draft.trim() || undefined });
    setDraft('');
  };

  return (
    <div className="animate-fade">
      {/* ---------------- Greeting + your list ---------------- */}
      <section className="horizon-soft">
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-8 px-4 pt-9 pb-8 md:px-8 md:pt-12 lg:grid-cols-[1.35fr_1fr] lg:items-end">
          <div>
            <p className="eyebrow">
              {greeting()}, {isBiz ? me.name : me.first}.
            </p>
            <h1 className="display mt-2 text-[40px] font-semibold sm:text-[56px]">{isBiz ? 'Whose goal could you make happen?' : 'What do you want to do?'}</h1>
            {isBiz ? (
              <p className="mt-3 max-w-lg text-[16px] text-[var(--color-ink-3)]">Sponsoring isn't a donation. It's co-creating the moment: your gear, your space, your people, your name on something real.</p>
            ) : (
              <>
                <form onSubmit={submit} className="mt-6 flex max-w-xl items-center gap-2 rounded-full bg-white p-1.5 pl-5 shadow-[var(--shadow-soft)] ring-1 ring-[var(--color-line)]">
                  <span className="quote shrink-0 text-[19px] text-[var(--color-ink-3)]">I want to</span>
                  <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="learn to surf…" className="min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:text-[var(--color-ink-4)]" aria-label="What do you want to do?" />
                  <button className="btn btn-help btn-sm shrink-0" type="submit">
                    <Icon name="plus" size={16} strokeWidth={2.4} /> Add
                  </button>
                </form>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {IDEAS.map((i) => (
                    <button key={i} className="chip !h-8 !text-[13px]" onClick={() => open({ type: 'composer', title: i })}>
                      {i}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* your bucketlist, one tap away */}
          <div className="rounded-[var(--radius-card)] bg-white/80 p-5 ring-1 ring-[var(--color-line)] backdrop-blur">
            {isBiz ? (
              <>
                <div className="flex items-center justify-between">
                  <p className="display text-[20px] font-semibold">Your offers</p>
                  <span className="text-[13px] text-[var(--color-ink-3)]">{myOffers.length}</span>
                </div>
                {myOffers.length ? (
                  <ul className="mt-2 divide-y divide-[var(--color-line)]">
                    {myOffers.slice(0, 4).map((o) => {
                      const g = state.goals[o.goalId];
                      return (
                        <li key={o.id}>
                          <button onClick={() => go({ name: 'goal', id: g.id })} className="flex w-full items-center gap-3 py-2.5 text-left">
                            <span className="text-[18px]">{g.emoji}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[14.5px] font-semibold">{g.title}</span>
                              <span className="block truncate text-[12.5px] text-[var(--color-ink-3)]">{o.experience || offerSummary(o)}</span>
                            </span>
                            <span className={`pill ${o.status === 'accepted' ? 'bg-[var(--color-sun)]' : o.status === 'declined' ? 'bg-[var(--color-mist)] text-[var(--color-ink-3)]' : 'bg-[var(--color-sky-wash)] text-[var(--color-ocean-deep)]'}`}>
                              {o.status === 'accepted' ? 'On' : o.status === 'declined' ? 'Passed' : 'Waiting'}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-[14px] text-[var(--color-ink-3)]">Nothing yet. Pick a goal below where what you do removes the biggest obstacle.</p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <button onClick={() => go({ name: 'list' })} className="display text-[20px] font-semibold hover:underline">
                    Your bucketlist
                  </button>
                  <button onClick={() => go({ name: 'list' })} className="text-[13px] font-semibold text-[var(--color-ocean)] hover:underline" data-open-my-list>
                    Open ({mine.length}) →
                  </button>
                </div>
                <ul className="mt-2 divide-y divide-[var(--color-line)]">
                  {mine.slice(0, 4).map((g) => (
                    <li key={g.id}>
                      <button onClick={() => go({ name: 'goal', id: g.id })} className="flex w-full items-center gap-3 py-2.5 text-left">
                        <span className={`h-2 w-2 shrink-0 rounded-full ${g.status === 'progress' ? 'bg-[var(--color-ocean)]' : 'ring-[1.5px] ring-[var(--color-ocean)] ring-inset'}`} />
                        <span className="min-w-0 flex-1 truncate text-[14.5px] font-medium">
                          {g.emoji} {g.title}
                        </span>
                        {g.privacy !== 'public' && <Icon name={g.privacy === 'private' ? 'lock' : 'users'} size={14} className="text-[var(--color-ink-4)]" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>

        {/* ---------------- The four ways — the feed's main filter ---------------- */}
        <div className="mx-auto max-w-[1280px] px-4 pb-6 md:px-8">
          <div className="scroll-row !gap-2 sm:grid sm:grid-cols-5" role="tablist" aria-label="Ways to help">
            {WAYS.map((w) => {
              const on = way === w.id;
              return (
                <button
                  key={w.id}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setWay(w.id)}
                  className={`flex min-w-[150px] shrink-0 flex-col items-start gap-1.5 rounded-2xl p-3.5 text-left ring-1 transition sm:min-w-0 ${on ? 'bg-[var(--color-night)] text-[var(--color-cloud)] ring-transparent' : 'bg-white/70 ring-[var(--color-line)] hover:bg-white'}`}
                  data-way={w.id}
                >
                  <span className="flex w-full items-center justify-between">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full ${wayTone(w.id, on)}`}>
                      <Icon name={w.icon} size={16} />
                    </span>
                    <span className={`text-[12px] font-semibold ${on ? 'text-white/60' : 'text-[var(--color-ink-4)]'}`}>{counts[w.id]}</span>
                  </span>
                  <span className="text-[15px] font-semibold">{w.name}</span>
                  <span className={`hidden text-[12.5px] leading-snug sm:block ${on ? 'text-white/70' : 'text-[var(--color-ink-3)]'}`}>{w.line}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------------- Feed + rail ---------------- */}
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-4 py-8 md:px-8 lg:grid-cols-[1fr_340px]">
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="display text-[26px] font-semibold">{where === 'Anywhere' ? 'On everyone’s list' : where === 'Near me' ? `Around ${me.hood}` : `In ${where}`}</h2>
              <p className="mt-0.5 text-[14px] text-[var(--color-ink-3)]">{way === 'all' ? 'Open goals from people around you. Tap one to help make it happen.' : activeWay.line}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden items-center gap-3 text-[12px] text-[var(--color-ink-3)] sm:flex">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[var(--color-ink-3)]" /> doing it
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full ring-[1.5px] ring-[var(--color-ink-3)] ring-inset" /> someday
                </span>
              </span>
              <label className="chip !h-9 !pr-2">
                <Icon name="pin" size={15} className="text-[var(--color-ocean)]" />
                <select value={where} onChange={(e) => setWhere(e.target.value as LocationFilter)} className="bg-transparent pr-1 font-semibold text-[var(--color-night)] outline-none" aria-label="Where">
                  {LOCATION_FILTERS.map((l) => (
                    <option key={l} value={l}>
                      {l === 'Near me' ? 'Within 5 km' : l}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {rows.length ? (
            <div className="space-y-3">
              {rows.map((r, i) => (
                <div key={r.person.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}>
                  <PersonRow person={r.person} goals={r.goals} />
                </div>
              ))}
            </div>
          ) : (
            <Empty title="Quiet here." body={activeWay.empty + ' Try a wider area.'} />
          )}
        </section>

        {/* ---------------- Rail ---------------- */}
        <aside className="space-y-8 lg:sticky lg:top-[92px] lg:self-start">
          {matches.length > 0 && (
            <RailBlock title="You might be able to help" sub={`Matched to what you know.`}>
              {matches.map(({ goal, reason }) => (
                <MiniGoal key={goal.id} goal={goal} line={`${state.people[goal.ownerId].first} · ${reason.toLowerCase()} · ${placeLabel(goal, me.hood).split(' · ')[1]}`} />
              ))}
            </RailBlock>
          )}
          {!isBiz && intros.length > 0 && (
            <RailBlock title="You might know someone" sub="Sometimes the best help is an intro.">
              {intros.map(({ goal, friend, reason }) => (
                <MiniGoal
                  key={goal.id}
                  goal={goal}
                  line={
                    <span className="flex items-center gap-1.5">
                      <Avatar person={friend} size={16} /> {friend.first} · {reason}
                    </span>
                  }
                  action={
                    <button className="btn btn-quiet btn-sm !h-8 !text-[13px]" onClick={() => open({ type: 'help', goalId: goal.id, mode: 'someone', friendId: friend.id })}>
                      Introduce {friend.first}
                    </button>
                  }
                />
              ))}
            </RailBlock>
          )}
          {rallying.length > 0 && (
            <RailBlock title="People rallying around" sub="Picking up backers right now.">
              {rallying.map((g) => (
                <MiniGoal
                  key={g.id}
                  goal={g}
                  line={
                    <span className="block space-y-1.5">
                      <span className="block">
                        {state.people[g.ownerId].first} · {money(g.funding!.raised)} of {money(g.funding!.target)} · {helpingLine(state, g)}
                      </span>
                      <FundingBar raised={g.funding!.raised} target={g.funding!.target} size="sm" />
                    </span>
                  }
                />
              ))}
            </RailBlock>
          )}
        </aside>
      </div>
    </div>
  );
}

function wayTone(id: Way, on: boolean) {
  if (on) return id === 'fund' ? 'bg-[var(--color-sun)] text-[var(--color-night)]' : id === 'promote' ? 'bg-white text-[var(--color-night)]' : 'bg-[var(--color-ocean)] text-white';
  switch (id) {
    case 'help':
      return 'bg-[var(--color-sky-wash)] text-[var(--color-ocean)]';
    case 'fund':
      return 'bg-[var(--color-sun-wash)] text-[#8a6200]';
    case 'sponsor':
      return 'bg-[var(--color-sky-wash)] text-[var(--color-ocean-ink)]';
    case 'promote':
      return 'bg-[var(--color-sand-wash)] text-[var(--color-night)]';
    default:
      return 'bg-[var(--color-mist)] text-[var(--color-ink-2)]';
  }
}

function RailBlock({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <section>
      <h3 className="display text-[19px] font-semibold">{title}</h3>
      <p className="text-[13px] text-[var(--color-ink-3)]">{sub}</p>
      <div className="mt-1 divide-y divide-[var(--color-line)]">{children}</div>
    </section>
  );
}

