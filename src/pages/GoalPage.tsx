import { useState } from 'react';
import type { Goal, Status } from '../types';
import { helperCount, offerSummary, useStore, useVisibleGoals } from '../store/store';
import { useUI } from '../store/ui';
import { GoalImage, useGoalActions } from '../components/GoalCard';
import { MiniGoal } from '../components/Feed';
import { Avatar, AvatarStack, Empty, FundingBar, FundingLine, PrivacyBadge, PrivacyPicker, SocialBadges } from '../components/ui';
import { Icon } from '../components/Icon';
import { backerCount, canSee, categoryEmoji, fundedPct, money, placeLabel, timeAgo } from '../lib/util';
import { potentialHelpers, relatedGoals } from '../lib/search';
import { RequestCard } from './Activity';

export function GoalPage({ id }: { id: string }) {
  const { state, me } = useStore();
  const { go, open, back } = useUI();
  const goal = state.goals[id];
  const visible = useVisibleGoals();

  if (!goal || !canSee(goal, me, state.people[goal.ownerId])) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20">
        <Empty
          title="This goal isn't visible to you."
          body="It might be private, shared only with someone's network, or it may have been removed."
          action={
            <button className="btn btn-quiet" onClick={() => go({ name: 'discover' })}>
              Back to Discover
            </button>
          }
        />
      </div>
    );
  }

  const owner = state.people[goal.ownerId];
  const mine = goal.ownerId === me.id;
  const mutuals = me.network.filter((p) => owner.network.includes(p) && p !== me.id).map((p) => state.people[p]);
  const intros = state.intros.filter((i) => i.goalId === goal.id);
  const backers = goal.funding?.backers ?? [];
  const sponsors = state.sponsorOffers.filter((o) => o.goalId === goal.id && o.status === 'accepted');
  const pendingSponsor = state.sponsorOffers.filter((o) => o.goalId === goal.id && o.status === 'pending');
  const pendingPromo = state.promotions.filter((p) => p.goalId === goal.id && p.status === 'pending');
  const helpers = potentialHelpers(state, goal, me.id);
  const related = relatedGoals(goal, visible.filter((g) => g.ownerId !== me.id));
  const a = useGoalActions(goal);

  return (
    <div className="animate-fade">
      <div className="mx-auto max-w-[1280px] px-4 pt-5 md:px-8 md:pt-8">
        <button onClick={back} className="btn btn-ghost btn-sm -ml-3 mb-4">
          <Icon name="arrowLeft" size={16} /> Back
        </button>

        {/* ---------------- Hero ---------------- */}
        <div className="relative overflow-hidden rounded-[var(--radius-xl2)]">
          <GoalImage goal={goal} className="aspect-[4/3] w-full sm:aspect-[16/9] lg:aspect-[2/1]" w={1800} />
          <div className="absolute inset-0 bg-gradient-to-t from-[rgb(6_14_36/0.82)] via-[rgb(6_14_36/0.2)] to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-8 md:p-10">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="pill bg-white/90 text-[var(--color-night)]">
                {categoryEmoji(goal.category)} {goal.category}
              </span>
              <StatusPill status={goal.status} />
              <PrivacyBadge privacy={goal.privacy} />
            </div>
            <h1 className="display max-w-4xl text-[38px] font-semibold sm:text-[56px] lg:text-[68px]">
              <span className="mr-2" aria-hidden="true">
                {goal.emoji}
              </span>
              {goal.title}
            </h1>
          </div>
        </div>
        {goal.photo && !goal.image && (
          <p className="mt-2 text-right text-[11px] text-[var(--color-ink-4)]">
            Photo:{' '}
            <a href={goal.photo.page} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">
              {goal.photo.by}
            </a>{' '}
            on Unsplash
          </p>
        )}
      </div>

      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-8 md:px-8 md:py-10 lg:grid-cols-[1fr_380px] lg:gap-14">
        {/* ---------------- Main column ---------------- */}
        <div className="min-w-0 space-y-12">
          <div>
            <button onClick={() => go({ name: 'person', id: owner.id })} className="group flex items-center gap-3 text-left">
              <Avatar person={owner} size={52} />
              <span>
                <span className="flex items-center gap-2 font-semibold group-hover:underline">
                  {mine ? `${owner.name} (you)` : owner.name} <SocialBadges person={owner} />
                </span>
                <span className="block text-[14px] text-[var(--color-ink-3)]">
                  {placeLabel(goal, mine ? undefined : me.hood)} · added {timeAgo(goal.createdAt)} ago
                </span>
              </span>
            </button>
            {!mine && mutuals.length > 0 && (
              <p className="mt-3 flex items-center gap-2 text-[13px] text-[var(--color-ink-3)]">
                <AvatarStack people={mutuals} size={22} max={3} />
                You both know {mutuals.slice(0, 2).map((m) => m.first).join(' and ')}
                {mutuals.length > 2 ? ` and ${mutuals.length - 2} more` : ''}
              </p>
            )}
            <p className="quote mt-7 text-[28px] leading-[1.25] text-[var(--color-night)] sm:text-[34px]">“{goal.story}”</p>

            <dl className="mt-7 flex flex-wrap gap-x-8 gap-y-3 text-[14px]">
              <Meta label="Where" value={`${goal.hood} · ${goal.city}`} />
              {goal.targetDate && <Meta label="When" value={new Date(goal.targetDate + '-01T12:00').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} />}
              <Meta label="Progress" value={goal.steps ? `${goal.steps.done} / ${goal.steps.total} ${goal.steps.label}` : goal.status === 'done' ? '1 / 1 completed' : '0 / 1 completed'} />
              <Meta label="Shared" value={`${goal.shares} ${goal.shares === 1 ? 'time' : 'times'}`} />
            </dl>
          </div>

          {goal.status === 'done' && goal.outcome && (
            <div className="golden-glow rounded-[var(--radius-xl2)] p-7 text-white">
              <p className="eyebrow !text-white/75">{mine ? 'You did it' : `${owner.first} did it`}</p>
              <p className="quote mt-2 text-[26px] leading-snug">“{goal.outcome}”</p>
              {goal.completedAt && <p className="mt-3 text-[13px] text-white/70">{timeAgo(goal.completedAt)} ago</p>}
            </div>
          )}

          {mine && (pendingSponsor.length > 0 || pendingPromo.length > 0) && (
            <section>
              <h2 className="display mb-4 text-2xl font-semibold">Waiting on you</h2>
              <div className="space-y-3">
                {pendingSponsor.map((o) => (
                  <RequestCard key={o.id} kind="sponsor" id={o.id} />
                ))}
                {pendingPromo.map((p) => (
                  <RequestCard key={p.id} kind="promote" id={p.id} />
                ))}
              </div>
            </section>
          )}

          {goal.needs.length > 0 && goal.status !== 'done' && (
            <section>
              <h2 className="display mb-1 text-2xl font-semibold">What would help</h2>
              <p className="mb-4 text-[14px] text-[var(--color-ink-3)]">{mine ? 'What you said would make the biggest difference.' : `In ${owner.first}'s words.`}</p>
              <ul className="space-y-2">
                {goal.needs.map((n) => (
                  <li key={n} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3.5 ring-1 ring-[var(--color-line)]">
                    <span className="flex items-center gap-3 text-[15px]">
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--color-sun)]" />
                      {n}
                    </span>
                    {a.canAct && (
                      <button className="shrink-0 text-[13px] font-semibold text-[var(--color-ocean)] hover:underline" onClick={a.help}>
                        I've got this
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {sponsors.length > 0 && (
            <section>
              <h2 className="display mb-4 text-2xl font-semibold">Made possible with</h2>
              <div className="space-y-3">
                {sponsors.map((o) => {
                  const s = state.people[o.fromId];
                  return (
                    <div key={o.id} className="rounded-[var(--radius-card)] p-5 text-white" style={{ background: 'linear-gradient(120deg,#062a78,#0b5cff 70%,#3c8dff)' }}>
                      <button onClick={() => go({ name: 'person', id: s.id })} className="flex items-center gap-3 text-left">
                        <Avatar person={s} size={40} />
                        <span>
                          <span className="block font-semibold">{s.name}</span>
                          <span className="block text-[12.5px] text-white/70">Sponsor · {s.tagline}</span>
                        </span>
                      </button>
                      {o.experience && <p className="quote mt-4 text-[22px] leading-snug">“{o.experience}”</p>}
                      <p className="mt-3 text-[13.5px] text-white/80">{offerSummary(o)}</p>
                      {o.involvement && o.involvement.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {o.involvement.map((i) => (
                            <span key={i} className="pill bg-white/15 text-white">
                              {i}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {(intros.length > 0 || backers.length > 0) && (
            <section>
              <h2 className="display mb-4 text-2xl font-semibold">People making this happen</h2>
              <div className="card divide-y divide-[var(--color-line)]">
                {[
                  ...intros.map((i) => ({ k: i.id, at: i.at, p: state.people[i.fromId], what: i.mode === 'someone' ? 'Made an introduction' : 'Offered to help', quote: i.message })),
                  ...backers.map((b, j) => ({ k: `b${j}`, at: b.at, p: b.personId ? state.people[b.personId] : undefined, name: b.name, what: `Backed with ${money(b.amount)}`, quote: '' })),
                ]
                  .sort((x, y) => y.at - x.at)
                  .map((row) => (
                    <div key={row.k} className="flex gap-3 p-4">
                      {row.p && <Avatar person={row.p} size={36} />}
                      <div className="min-w-0">
                        <p className="text-[14px]">
                          <b className="font-semibold">{row.p?.id === me.id ? 'You' : row.p?.name}</b> <span className="text-[var(--color-ink-3)]">· {row.what} · {timeAgo(row.at)}</span>
                        </p>
                        {row.quote && <p className="mt-1 text-[14px] text-[var(--color-ink-2)]">“{row.quote}”</p>}
                      </div>
                    </div>
                  ))}
              </div>
            </section>
          )}

          {!mine && goal.status !== 'done' && helpers.length > 0 && (
            <section>
              <h2 className="display mb-1 text-2xl font-semibold">People who might help</h2>
              <p className="mb-4 text-[14px] text-[var(--color-ink-3)]">Know one of them? An introduction is a kind of help.</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {helpers.map((p) => (
                  <div key={p.id} className="card p-4">
                    <button onClick={() => go({ name: 'person', id: p.id })} className="flex items-center gap-3 text-left">
                      <Avatar person={p} size={42} />
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{p.kind === 'business' ? p.name : p.first}</span>
                        <span className="block text-[12.5px] leading-snug text-[var(--color-ink-3)]">{p.tagline}</span>
                      </span>
                    </button>
                    {me.network.includes(p.id) ? (
                      <button className="btn btn-quiet btn-sm mt-3 w-full !text-[13px]" onClick={() => open({ type: 'help', goalId: goal.id, mode: 'someone', friendId: p.id })}>
                        Introduce {p.first.split(' ')[0]}
                      </button>
                    ) : (
                      <p className="mt-3 text-[12px] text-[var(--color-ink-4)]">{p.kind === 'business' ? 'Local business' : 'Not in your network yet'}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section>
              <h2 className="display mb-1 text-2xl font-semibold">On other people's lists</h2>
              <div className="grid gap-x-8 divide-y divide-[var(--color-line)] sm:grid-cols-2 sm:divide-y-0">
                {related.map((g) => (
                  <MiniGoal key={g.id} goal={g} line={`${state.people[g.ownerId].first} · ${g.hood}`} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---------------- Side panel ---------------- */}
        <aside className="lg:sticky lg:top-[92px] lg:self-start">{mine ? <OwnerPanel goal={goal} /> : <ActionPanel goal={goal} />}</aside>
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="eyebrow !text-[10px]">{label}</dt>
      <dd className="mt-0.5 font-semibold">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: Status }) {
  if (status === 'done')
    return (
      <span className="pill bg-[var(--color-sun)] text-[var(--color-night)]">
        <Icon name="check" size={12} strokeWidth={3} /> Done
      </span>
    );
  return <span className="pill bg-white/20 text-white backdrop-blur">{status === 'progress' ? 'In progress' : 'Want to do'}</span>;
}

/* ------------------------------------------------------------------ */
/* Visitor action panel — the four ways to help                        */
/* ------------------------------------------------------------------ */

function ActionPanel({ goal }: { goal: Goal }) {
  const { state, me } = useStore();
  const a = useGoalActions(goal);
  const owner = state.people[goal.ownerId];
  const helping = helperCount(state, goal);
  const backerPeople = (goal.funding?.backers ?? []).map((b) => (b.personId ? state.people[b.personId] : null)).filter(Boolean) as typeof me[];
  const pct = fundedPct(goal);
  const offersCount = state.sponsorOffers.filter((o) => o.goalId === goal.id && o.status !== 'declined').length;

  return (
    <div className="space-y-4">
      <div className={`overflow-hidden rounded-[var(--radius-xl2)] ring-1 ring-[var(--color-line)] ${pct >= 100 ? 'golden-glow text-white' : 'bg-white'}`}>
        <div className="p-6">
          {goal.status === 'done' ? (
            <>
              <p className="display text-2xl font-semibold">{owner.first} did it.</p>
              <p className="mt-2 text-[15px] text-[var(--color-ink-3)]">{helping} people helped make it happen.</p>
            </>
          ) : (
            <>
              <p className={`text-[15px] ${pct >= 100 ? 'text-white/85' : 'text-[var(--color-ink-3)]'}`}>
                {pct >= 100 ? `${owner.first} made it happen.` : `You might be able to help ${owner.first} make this happen.`}
              </p>
              {goal.funding?.enabled && (
                <div className="mt-5 space-y-2.5">
                  <FundingLine raised={goal.funding.raised} target={goal.funding.target} />
                  <FundingBar raised={goal.funding.raised} target={goal.funding.target} size="lg" glow={pct >= 100} />
                  <div className={`flex items-center gap-2 text-[13px] ${pct >= 100 ? 'text-white/80' : 'text-[var(--color-ink-3)]'}`}>
                    {backerPeople.length > 0 && <AvatarStack people={backerPeople.slice().reverse()} size={22} />}
                    {backerCount(goal)} people backing
                  </div>
                </div>
              )}
              <div className={`mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[14px] ${goal.funding?.enabled ? 'border-t border-[var(--color-line)] pt-4' : ''}`}>
                <span className="inline-flex items-center gap-1.5">
                  <Icon name="hand" size={16} className="text-[var(--color-ocean)]" /> <b>{helping}</b> helping
                </span>
                {goal.sponsorship?.open && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="store" size={16} className="text-[var(--color-ocean-ink)]" /> <b>{offersCount}</b> sponsor {offersCount === 1 ? 'offer' : 'offers'}
                  </span>
                )}
                {goal.shares > 0 && (
                  <span className="inline-flex items-center gap-1.5">
                    <Icon name="megaphone" size={16} className="text-[var(--color-sun-deep)]" /> <b>{goal.shares}</b> shares
                  </span>
                )}
              </div>
            </>
          )}
        </div>

        {a.canAct && (
          <div className={`space-y-2.5 p-6 pt-0`}>
            {/* Order follows the goal: a business sees Sponsor first; funded goals lead with Fund. */}
            {(a.primary === 'sponsor' ? ['sponsor', 'help', 'fund', 'promote'] : a.primary === 'fund' ? ['help', 'fund', 'sponsor', 'promote'] : ['help', 'fund', 'sponsor', 'promote']).map((k) => {
              if (k === 'help')
                return (
                  <button key={k} className={`btn btn-lg w-full ${a.primary === 'help' || a.primary === 'fund' ? 'btn-help' : 'btn-quiet'}`} onClick={a.help} data-action="help">
                    <Icon name="hand" size={19} /> {a.offers.intro ? 'You offered — say more' : 'I can help'}
                  </button>
                );
              if (k === 'fund' && a.canFund && !a.isBiz)
                return (
                  <button key={k} className="btn btn-fund btn-lg w-full" onClick={a.fund} data-action="fund">
                    <Icon name="coin" size={19} /> {a.offers.backed ? `You've backed ${money(a.offers.backed)} · add more` : 'Fund this goal'}
                  </button>
                );
              if (k === 'sponsor' && a.canSponsor)
                return (
                  <button key={k} className={`btn btn-lg w-full ${a.isBiz ? 'btn-sponsor' : 'btn-quiet'}`} onClick={a.sponsor} data-action="sponsor">
                    <Icon name="store" size={19} /> {a.offers.sponsor ? (a.offers.sponsor.status === 'pending' ? 'Offer sent · waiting' : a.offers.sponsor.status === 'accepted' ? 'You sponsor this goal' : 'Offer declined') : 'Sponsor this goal'}
                  </button>
                );
              if (k === 'promote')
                return (
                  <button key={k} className="btn btn-promote btn-lg w-full" onClick={a.promote} data-action="promote">
                    <Icon name="megaphone" size={19} />
                    {a.offers.promo ? (a.offers.promo.status === 'approved' ? 'See your share card' : a.offers.promo.status === 'pending' ? `Waiting for ${owner.first}'s OK` : 'Promote') : 'Promote'}
                    <span className="absolute top-1/2 right-4 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--color-sun)]" />
                  </button>
                );
              return null;
            })}
          </div>
        )}
      </div>

      {goal.sponsorship?.open && goal.status !== 'done' && (
        <div className="rounded-[var(--radius-card)] bg-[var(--color-sand-wash)] p-5 ring-1 ring-[var(--color-sand)]">
          <p className="eyebrow">Looking for a sponsor</p>
          <p className="mt-2 text-[15px] leading-snug">{goal.sponsorship.need}</p>
          <p className="mt-3 text-[12.5px] text-[var(--color-ink-3)]">Sponsors don't just pay. They co-create the moment: gear, space, expertise, and their name on something real.</p>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Owner panel — manage, privacy, funding, sponsorship                 */
/* ------------------------------------------------------------------ */

function OwnerPanel({ goal }: { goal: Goal }) {
  const { state, dispatch } = useStore();
  const { open, toast, go } = useUI();
  const [target, setTarget] = useState(String(goal.funding?.target ?? 500));
  const [need, setNeed] = useState(goal.sponsorship?.need ?? '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const helping = helperCount(state, goal);
  const pct = fundedPct(goal);
  const update = (patch: Partial<Goal>) => dispatch({ type: 'goal/update', id: goal.id, patch });

  const setStatus = (s: Status) => {
    dispatch({ type: 'goal/status', id: goal.id, status: s });
    if (s === 'done') open({ type: 'celebrate', goalId: goal.id });
  };

  const toggleFunding = () => {
    if (goal.funding?.enabled) {
      update({ funding: { ...goal.funding, enabled: false } });
      toast('Funding turned off');
    } else {
      const t = Math.max(50, Number(target) || 500);
      update({ funding: { enabled: true, target: t, raised: goal.funding?.raised ?? 0, baseBackers: goal.funding?.baseBackers ?? 0, backers: goal.funding?.backers ?? [] } });
      toast('Funding is on — people can back this now', 'sun');
    }
  };

  return (
    <div className="space-y-4">
      <div className={`rounded-[var(--radius-xl2)] p-6 ring-1 ring-[var(--color-line)] ${pct >= 100 ? 'golden-glow text-white' : 'bg-white'}`}>
        <p className="eyebrow">{pct >= 100 ? <span className="text-white/80">You made it happen.</span> : 'Your goal'}</p>
        <p className="display mt-1 text-[26px] font-semibold">{helping} people helping</p>
        {goal.funding?.enabled && (
          <div className="mt-4 space-y-2">
            <FundingLine raised={goal.funding.raised} target={goal.funding.target} />
            <FundingBar raised={goal.funding.raised} target={goal.funding.target} size="lg" glow={pct >= 100} />
          </div>
        )}

        <div className="mt-6">
          <p className="mb-2 text-[13px] font-semibold">Where it's at</p>
          <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[var(--color-mist)] p-1 text-[var(--color-night)]">
            {(['want', 'progress', 'done'] as Status[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`h-10 rounded-xl text-[13px] font-semibold transition ${goal.status === s ? (s === 'done' ? 'bg-[var(--color-sun)]' : 'bg-white shadow-[var(--shadow-soft)]') : 'text-[var(--color-ink-3)]'}`}
                data-status={s}
              >
                {s === 'want' ? 'Want to' : s === 'progress' ? 'Doing it' : 'Done ✓'}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 text-[var(--color-night)]">
          <p className="mb-2 text-[13px] font-semibold">Who can see it</p>
          <PrivacyPicker compact value={goal.privacy} onChange={(p) => { update({ privacy: p }); toast(`Now ${p === 'public' ? 'public' : p === 'network' ? 'visible to your network' : 'private'}`); }} />
        </div>

        <div className="mt-5 flex gap-2">
          <button className="btn btn-quiet btn-sm flex-1 text-[var(--color-night)]" onClick={() => open({ type: 'composer', goalId: goal.id })}>
            <Icon name="edit" size={15} /> Edit
          </button>
          <button
            className={`btn btn-sm ${confirmDelete ? 'bg-[var(--color-coral)] text-white' : 'btn-ghost text-[var(--color-ink-3)]'}`}
            onClick={() => {
              if (!confirmDelete) {
                setConfirmDelete(true);
                setTimeout(() => setConfirmDelete(false), 3500);
                return;
              }
              dispatch({ type: 'goal/delete', id: goal.id });
              toast('Goal removed');
              go({ name: 'list' });
            }}
            aria-label="Remove goal"
          >
            <Icon name="trash" size={15} />
            {confirmDelete && 'Remove?'}
          </button>
        </div>
      </div>

      {goal.privacy !== 'private' && goal.status !== 'done' && (
        <div className="rounded-[var(--radius-xl2)] bg-white p-6 ring-1 ring-[var(--color-line)]">
          <p className="display text-xl font-semibold">Let people help</p>
          <p className="mt-1 text-[13px] text-[var(--color-ink-3)]">Anyone can offer help. These are optional extras.</p>

          <Toggle on={!!goal.funding?.enabled} onClick={toggleFunding} title="Accept funding" sub="Friends and strangers can chip in." icon="coin" />
          {(goal.funding?.enabled || true) && (
            <label className={`mt-2 flex items-center gap-2 transition ${goal.funding?.enabled ? '' : 'opacity-60'}`}>
              <span className="text-[13px] text-[var(--color-ink-3)]">Target</span>
              <span className="relative flex-1">
                <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[var(--color-ink-3)]">$</span>
                <input
                  className="field !py-2 !pl-7"
                  inputMode="numeric"
                  value={target}
                  onChange={(e) => setTarget(e.target.value.replace(/[^0-9]/g, ''))}
                  onBlur={() => {
                    const t = Math.max(50, Number(target) || 500);
                    setTarget(String(t));
                    if (goal.funding?.enabled && t !== goal.funding.target) {
                      update({ funding: { ...goal.funding, target: t } });
                      toast(`Target set to ${money(t)}`);
                    }
                  }}
                  aria-label="Funding target"
                  data-funding-target
                />
              </span>
            </label>
          )}

          <Toggle
            on={!!goal.sponsorship?.open}
            onClick={() => {
              const open = !goal.sponsorship?.open;
              update({ sponsorship: { open, need: need || goal.needs[0] || '' } });
              toast(open ? 'Local businesses can now offer support' : 'Sponsorship closed');
            }}
            title="Open to sponsors"
            sub="Local businesses can offer gear, space or services."
            icon="store"
          />
          {goal.sponsorship?.open && (
            <textarea
              className="field mt-2 !text-[14px]"
              rows={2}
              placeholder="What's standing in the way? e.g. a wall to paint"
              value={need}
              onChange={(e) => setNeed(e.target.value)}
              onBlur={() => update({ sponsorship: { open: true, need } })}
              aria-label="What would a sponsor help with"
            />
          )}
        </div>
      )}
    </div>
  );
}

function Toggle({ on, onClick, title, sub, icon }: { on: boolean; onClick: () => void; title: string; sub: string; icon: 'coin' | 'store' }) {
  return (
    <button onClick={onClick} className="mt-4 flex w-full items-center gap-3 text-left" role="switch" aria-checked={on}>
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${icon === 'coin' ? 'bg-[var(--color-sun-wash)] text-[#8a6200]' : 'bg-[var(--color-sky-wash)] text-[var(--color-ocean-ink)]'}`}>
        <Icon name={icon} size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold">{title}</span>
        <span className="block text-[12.5px] text-[var(--color-ink-3)]">{sub}</span>
      </span>
      <span className={`relative h-7 w-12 shrink-0 rounded-full transition ${on ? 'bg-[var(--color-ocean)]' : 'bg-[var(--color-line)]'}`}>
        <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
      </span>
    </button>
  );
}
