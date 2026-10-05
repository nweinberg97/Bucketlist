import { useStore } from '../store/store';
import { useUI } from '../store/ui';
import { GoalCard, GoalImage } from '../components/GoalCard';
import { Avatar, AvatarStack, Empty, FundingBar } from '../components/ui';
import { Icon } from '../components/Icon';
import { canSee, money, timeAgo } from '../lib/util';
import { helperCount, offerSummary } from '../store/store';

export function Profile({ id }: { id: string }) {
  const { state, me } = useStore();
  const { go, open } = useUI();
  const p = state.people[id];
  if (!p) return <div className="mx-auto max-w-xl px-4 py-20"><Empty title="We couldn't find that person." body="They may have left Bucketlist." /></div>;

  const isMe = p.id === me.id;
  const goals = Object.values(state.goals).filter((g) => g.ownerId === p.id && canSee(g, me, p));
  const current = goals.filter((g) => g.status !== 'done');
  const rallied = current.filter((g) => g.funding?.enabled || helperCount(state, g) >= 5);
  const done = goals.filter((g) => g.status === 'done').sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0));
  const allDone = Object.values(state.goals).filter((g) => g.ownerId === p.id && g.status === 'done').length;
  const mutuals = p.network.filter((x) => me.network.includes(x) && x !== me.id).map((x) => state.people[x]);
  const sponsorsReceived = state.sponsorOffers.filter((o) => o.status === 'accepted' && state.goals[o.goalId]?.ownerId === p.id).length;
  const sponsored = state.sponsorOffers.filter((o) => o.fromId === p.id && o.status === 'accepted');
  const hiddenCount = Object.values(state.goals).filter((g) => g.ownerId === p.id && !canSee(g, me, p)).length;
  const isBiz = p.kind === 'business';

  return (
    <div className="animate-fade">
      {/* ---------------- Header ---------------- */}
      <section className="relative">
        <div className="horizon h-44 sm:h-56">
          <div className="grain h-full w-full" />
        </div>
        <div className="mx-auto max-w-[1280px] px-4 md:px-8">
          <div className="-mt-16 flex flex-wrap items-end gap-5 sm:-mt-20 sm:items-start">
            <Avatar person={p} size={128} className="ring-[6px] ring-[var(--color-cloud)] max-sm:!h-28 max-sm:!w-28" />
            <div className="min-w-0 flex-1 pb-2 sm:pt-20">
              <h1 className="display text-[38px] font-semibold sm:text-[48px]">{p.name}</h1>
              <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[15px] text-[var(--color-ink-3)]">
                <span className="inline-flex items-center gap-1">
                  <Icon name="pin" size={15} /> {p.hood} · {p.city}
                </span>
                <span>{p.tagline}</span>
              </p>
            </div>
            {!isMe && !isBiz && (
              <div className="flex gap-2 pb-2 sm:pt-20">
                <button className="btn btn-quiet btn-sm">
                  <Icon name="message" size={15} /> Message
                </button>
              </div>
            )}
            {isMe && !isBiz && (
              <button className="btn btn-help btn-sm mb-2 sm:mt-20" onClick={() => open({ type: 'composer' })}>
                <Icon name="plus" size={16} /> Add a goal
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-10 md:px-8 lg:grid-cols-[320px_1fr] lg:gap-14">
        {/* ---------------- Sidebar ---------------- */}
        <aside className="space-y-7">
          <p className="quote text-[24px] leading-snug">“{p.bio}”</p>

          <div className="grid grid-cols-2 gap-2">
            {(isBiz
              ? [
                  ['Goals sponsored', sponsored.length],
                  ['People helped', p.stats.helped],
                ]
              : [
                  ['Completed', allDone],
                  ['In progress', current.length],
                  ['People helped', p.stats.helped],
                  ['Goals backed', p.stats.backed],
                ]
            ).map(([label, n]) => (
              <div key={label} className="rounded-2xl bg-white p-4 ring-1 ring-[var(--color-line)]">
                <p className="display text-[30px] font-semibold">{n}</p>
                <p className="text-[13px] text-[var(--color-ink-3)]">{label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3 text-[14px]">
            <p className="eyebrow">Verified identity</p>
            {p.socials.instagram && (
              <p className="flex items-center gap-2.5">
                <Icon name="instagram" size={17} /> @{p.socials.instagram}
                <Icon name="shield" size={15} className="ml-auto text-[var(--color-ocean)]" />
              </p>
            )}
            {p.socials.linkedin && (
              <p className="flex items-center gap-2.5">
                <Icon name="linkedin" size={17} /> LinkedIn connected
                <Icon name="shield" size={15} className="ml-auto text-[var(--color-ocean)]" />
              </p>
            )}
            {p.socials.tiktok && (
              <p className="flex items-center gap-2.5">
                <Icon name="tiktok" size={17} /> @{p.socials.tiktok}
                <Icon name="shield" size={15} className="ml-auto text-[var(--color-ocean)]" />
              </p>
            )}
            <p className="text-[12px] text-[var(--color-ink-4)]">On Bucketlist since {p.joined}.</p>
          </div>

          {!isMe && mutuals.length > 0 && (
            <div>
              <p className="eyebrow mb-3">{mutuals.length} mutual {mutuals.length === 1 ? 'connection' : 'connections'}</p>
              <div className="flex items-center gap-3">
                <AvatarStack people={mutuals} size={30} max={5} />
                <span className="text-[13px] text-[var(--color-ink-3)]">{mutuals.slice(0, 2).map((m) => m.first).join(', ')}{mutuals.length > 2 ? ` +${mutuals.length - 2}` : ''}</span>
              </div>
            </div>
          )}

          <div>
            <p className="eyebrow mb-3">{isBiz ? 'What we can offer' : 'Into'}</p>
            <div className="flex flex-wrap gap-2">
              {p.interests.map((i) => (
                <button key={i} className="chip !h-8 !text-[13px]" onClick={() => go({ name: 'discover', q: i })}>
                  {i}
                </button>
              ))}
            </div>
          </div>

          {!isBiz && sponsorsReceived > 0 && (
            <p className="flex items-center gap-2 rounded-2xl bg-[var(--color-sky-wash)] px-4 py-3 text-[14px]">
              <Icon name="store" size={16} className="text-[var(--color-ocean-ink)]" /> {sponsorsReceived} {sponsorsReceived === 1 ? 'business has' : 'businesses have'} sponsored {isMe ? 'your' : `${p.first}'s`} goals
            </p>
          )}
        </aside>

        {/* ---------------- Goals ---------------- */}
        <div className="min-w-0 space-y-14">
          {isBiz ? (
            <section>
              <h2 className="display mb-5 text-[28px] font-semibold">Goals {p.name} has helped make happen</h2>
              {sponsored.length ? (
                <div className="grid gap-5 sm:grid-cols-2">
                  {sponsored.map((o) => (
                    <div key={o.id}>
                      <GoalCard goal={state.goals[o.goalId]} variant="compact" />
                      <p className="mt-2 px-2 text-[13px] text-[var(--color-ink-3)]">Offered: {offerSummary(o)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <Empty title="No sponsorships yet." body="Find a goal nearby where what you do removes the biggest obstacle." action={<a href="#/discover" className="btn btn-sponsor">Find a goal</a>} />
              )}
            </section>
          ) : (
            <>
              <section>
                <h2 className="display mb-5 text-[28px] font-semibold">Currently</h2>
                {current.length ? (
                  <div className="flex flex-wrap gap-2.5">
                    {current.map((g) => (
                      <button key={g.id} onClick={() => go({ name: 'goal', id: g.id })} className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pr-4 pl-1.5 text-[15px] font-semibold ring-1 ring-[var(--color-line)] transition hover:ring-[var(--color-ocean)]">
                        <GoalImage goal={g} className="h-9 w-9 overflow-hidden rounded-full" />
                        {g.emoji} {g.title}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-[var(--color-ink-3)]">Nothing public right now.</p>
                )}
                {hiddenCount > 0 && !isMe && <p className="mt-3 text-[13px] text-[var(--color-ink-4)]">+ {hiddenCount} private {hiddenCount === 1 ? 'goal' : 'goals'}</p>}
              </section>

              {rallied.length > 0 && (
                <section>
                  <h2 className="display mb-5 text-[28px] font-semibold">Goals people are helping with</h2>
                  <div className="grid gap-5 sm:grid-cols-2">
                    {rallied.map((g) => (
                      <button key={g.id} onClick={() => go({ name: 'goal', id: g.id })} className="card group overflow-hidden text-left transition hover:shadow-[var(--shadow-lift)]">
                        <GoalImage goal={g} className="aspect-[16/9] w-full" />
                        <div className="space-y-3 p-5">
                          <p className="display text-[22px] font-semibold">
                            {g.emoji} {g.title}
                          </p>
                          {g.funding?.enabled && (
                            <>
                              <FundingBar raised={g.funding.raised} target={g.funding.target} />
                              <p className="text-[14px]">
                                <b>{money(g.funding.raised)}</b> <span className="text-[var(--color-ink-3)]">of {money(g.funding.target)} funded</span>
                              </p>
                            </>
                          )}
                          <p className="text-[14px] text-[var(--color-ink-3)]">{helperCount(state, g)} people helping</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="display mb-5 text-[28px] font-semibold">Done</h2>
                {done.length ? (
                  <ul className="card divide-y divide-[var(--color-line)]">
                    {done.map((g) => (
                      <li key={g.id}>
                        <button onClick={() => go({ name: 'goal', id: g.id })} className="flex w-full items-start gap-4 p-4 text-left hover:bg-[var(--color-sand-wash)]">
                          <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-sun)]">
                            <Icon name="check" size={15} strokeWidth={3} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-semibold">{g.title}</span>
                            {g.outcome && <span className="quote block text-[17px] text-[var(--color-ink-2)]">“{g.outcome}”</span>}
                          </span>
                          <span className="shrink-0 text-[12px] text-[var(--color-ink-4)]">{g.completedAt ? `${timeAgo(g.completedAt)} ago` : ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[var(--color-ink-3)]">Nothing finished yet — give it time.</p>
                )}
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
