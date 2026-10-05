import { useEffect, useRef, useState } from 'react';
import type { Notification, NotificationKind } from '../types';
import { offerSummary, useStore } from '../store/store';
import { useUI } from '../store/ui';
import { Avatar, Empty } from '../components/ui';
import { GoalImage } from '../components/GoalCard';
import { Icon, type IconName } from '../components/Icon';
import { timeAgo } from '../lib/util';

const KIND_ICON: Record<NotificationKind, { icon: IconName; tone: string }> = {
  help: { icon: 'hand', tone: 'bg-[var(--color-ocean)] text-white' },
  fund: { icon: 'coin', tone: 'bg-[var(--color-sun)] text-[var(--color-night)]' },
  milestone: { icon: 'sparkle', tone: 'bg-[var(--color-sun)] text-[var(--color-night)]' },
  'sponsor-offer': { icon: 'store', tone: 'bg-[var(--color-ocean-ink)] text-white' },
  'sponsor-accepted': { icon: 'check', tone: 'bg-[var(--color-ocean-ink)] text-white' },
  'sponsor-declined': { icon: 'x', tone: 'bg-[var(--color-mist)] text-[var(--color-ink-3)]' },
  'promote-request': { icon: 'megaphone', tone: 'bg-white text-[var(--color-night)] ring-1 ring-[var(--color-line)]' },
  'promote-approved': { icon: 'megaphone', tone: 'bg-[var(--color-sun)] text-[var(--color-night)]' },
  'promote-declined': { icon: 'megaphone', tone: 'bg-[var(--color-mist)] text-[var(--color-ink-3)]' },
  completed: { icon: 'trophy', tone: 'bg-[var(--color-sun)] text-[var(--color-night)]' },
  nearby: { icon: 'pin', tone: 'bg-[var(--color-sky-wash)] text-[var(--color-ocean)]' },
  shared: { icon: 'share', tone: 'bg-[var(--color-sky-wash)] text-[var(--color-ocean)]' },
};

export function Activity() {
  const { state, me, dispatch } = useStore();
  const { go } = useUI();
  const mine = state.notifications.filter((n) => n.to === me.id).sort((a, b) => b.at - a.at);
  // remember what was unread when the page opened, then clear the badge
  const fresh = useRef(new Set(mine.filter((n) => !n.read).map((n) => n.id)));
  useEffect(() => {
    fresh.current = new Set(state.notifications.filter((n) => n.to === me.id && !n.read).map((n) => n.id));
    const t = setTimeout(() => dispatch({ type: 'notifications/read' }), 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me.id]);

  const pending = mine.filter(
    (n) =>
      (n.kind === 'sponsor-offer' && state.sponsorOffers.find((o) => o.id === n.refId)?.status === 'pending') ||
      (n.kind === 'promote-request' && state.promotions.find((p) => p.id === n.refId)?.status === 'pending'),
  );
  const rest = mine.filter((n) => !pending.includes(n));

  return (
    <div className="mx-auto max-w-3xl animate-fade px-4 py-10 md:px-8 md:py-14">
      <p className="eyebrow">Activity</p>
      <h1 className="display mt-2 text-[40px] font-semibold sm:text-[52px]">What's happening.</h1>
      <p className="mt-2 text-[16px] text-[var(--color-ink-3)]">{me.kind === 'business' ? 'Goals near you, and how your offers landed.' : 'People helping you, and the people you help.'}</p>

      {pending.length > 0 && (
        <section className="mt-10">
          <h2 className="eyebrow mb-3 !text-[var(--color-ocean)]">Needs your answer · {pending.length}</h2>
          <div className="space-y-3">
            {pending.map((n) => (
              <RequestCard key={n.id} kind={n.kind === 'sponsor-offer' ? 'sponsor' : 'promote'} id={n.refId!} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10">
        {rest.length === 0 && pending.length === 0 ? (
          <Empty title="Quiet for now." body="When someone offers help, backs a goal or asks to share it, you'll see it here." />
        ) : (
          <ul className="card divide-y divide-[var(--color-line)] overflow-hidden">
            {rest.map((n) => (
              <NotificationRow key={n.id} n={n} fresh={fresh.current.has(n.id)} onOpen={() => n.goalId && go({ name: 'goal', id: n.goalId })} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function NotificationRow({ n, fresh, onOpen }: { n: Notification; fresh: boolean; onOpen: () => void }) {
  const { state } = useStore();
  const { open } = useUI();
  const actor = n.actorId ? state.people[n.actorId] : undefined;
  const k = KIND_ICON[n.kind];
  const goal = n.goalId ? state.goals[n.goalId] : undefined;
  const promo = n.kind === 'promote-approved' ? state.promotions.find((p) => p.id === n.refId) : undefined;

  return (
    <li className={`relative flex gap-4 p-4 transition sm:p-5 ${fresh ? 'bg-[var(--color-sun-wash)]/60' : ''}`}>
      <span className="relative shrink-0">
        {actor ? <Avatar person={actor} size={44} /> : <span className={`flex h-11 w-11 items-center justify-center rounded-full ${k.tone}`}><Icon name={k.icon} size={19} /></span>}
        {actor && (
          <span className={`absolute -right-1 -bottom-1 flex h-5 w-5 items-center justify-center rounded-full ring-2 ring-white ${k.tone}`}>
            <Icon name={k.icon} size={11} strokeWidth={2.4} />
          </span>
        )}
      </span>
      <div className="min-w-0 flex-1">
        <button onClick={onOpen} className="text-left text-[15px] leading-snug hover:underline">
          {n.text}
        </button>
        {n.quote && <p className="quote mt-1.5 text-[17px] leading-snug text-[var(--color-ink-2)]">“{n.quote}”</p>}
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <span className="text-[12px] text-[var(--color-ink-4)]">{timeAgo(n.at)} ago</span>
          {promo && (
            <button className="btn btn-fund btn-sm !h-8 !text-[13px]" onClick={() => open({ type: 'share', promotionId: promo.id })}>
              <Icon name="share" size={14} /> Open share card
            </button>
          )}
        </div>
      </div>
      {goal && (
        <button onClick={onOpen} className="hidden shrink-0 sm:block" aria-label={`Open ${goal.title}`}>
          <GoalImage goal={goal} className="h-14 w-14 overflow-hidden rounded-xl" />
        </button>
      )}
      {fresh && <span className="absolute top-5 left-1.5 h-1.5 w-1.5 rounded-full bg-[var(--color-ocean)]" />}
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* Actionable requests: sponsorship offers + promotion approvals       */
/* ------------------------------------------------------------------ */

export function RequestCard({ kind, id }: { kind: 'sponsor' | 'promote'; id: string }) {
  const { state, me, dispatch } = useStore();
  const { open, toast } = useUI();
  const [editing, setEditing] = useState(false);
  const promo = kind === 'promote' ? state.promotions.find((p) => p.id === id) : undefined;
  const offer = kind === 'sponsor' ? state.sponsorOffers.find((o) => o.id === id) : undefined;
  const [caption, setCaption] = useState(promo?.caption ?? '');
  const rec = promo ?? offer;
  if (!rec) return null;
  const goal = state.goals[rec.goalId];
  const from = state.people[promo ? promo.promoterId : offer!.fromId];

  if (offer) {
    const firstSponsor = !state.sponsorOffers.some((o) => o.status === 'accepted' && state.goals[o.goalId]?.ownerId === me.id);
    return (
      <div className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-[var(--color-line)] animate-rise" data-request="sponsor">
        <div className="flex items-center gap-2 bg-[var(--color-ocean-ink)] px-5 py-2.5 text-[12px] font-semibold tracking-[0.12em] text-white uppercase">
          <Icon name="store" size={14} /> New sponsorship offer
        </div>
        <div className="p-5">
          <div className="flex items-start gap-3">
            <Avatar person={from} size={44} />
            <div className="min-w-0">
              <p className="text-[15px] leading-snug">
                <b>{from.name}</b> wants to help make <b>{goal.title.toLowerCase()}</b> happen.
              </p>
              <div className="mt-3 rounded-2xl bg-[var(--color-sky-wash)] px-4 py-3">
                <p className="eyebrow !text-[10px] !text-[var(--color-ocean-deep)]">Offer</p>
                <p className="mt-1 text-[15px] font-semibold">{offerSummary(offer)}</p>
              </div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 sm:pl-14">
            <button
              className="btn btn-help btn-sm"
              data-respond="accept"
              onClick={() => {
                dispatch({ type: 'sponsor/respond', id: offer.id, status: 'accepted' });
                toast(firstSponsor ? 'Someone believes in your goal.' : `You accepted ${from.name}'s offer`, 'sun');
              }}
            >
              <Icon name="check" size={16} /> Accept
            </button>
            <button className="btn btn-quiet btn-sm" onClick={() => { dispatch({ type: 'sponsor/respond', id: offer.id, status: 'declined' }); toast('Offer declined — they’ve been thanked'); }}>
              Decline
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => toast(`Message thread with ${from.name} opened (simulated)`)}>
              <Icon name="message" size={16} /> Message
            </button>
          </div>
        </div>
      </div>
    );
  }

  const p = promo!;
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] bg-white ring-1 ring-[var(--color-line)] animate-rise" data-request="promote">
      <div className="flex items-center gap-2 px-5 py-2.5 text-[12px] font-semibold tracking-[0.12em] text-[var(--color-night)] uppercase" style={{ background: 'linear-gradient(90deg,#eaf3ff,#fff4d6)' }}>
        <Icon name="megaphone" size={14} /> Share request
      </div>
      <div className="p-5">
        <div className="flex items-start gap-3">
          <Avatar person={from} size={44} />
          <div className="min-w-0 flex-1">
            <p className="text-[15px] leading-snug">
              <b>{from.first}</b> wants to share <b>{goal.title.toLowerCase()}</b> with their followers.
            </p>
            {editing ? (
              <textarea className="field quote mt-3 !text-[18px] leading-snug" rows={4} value={caption} onChange={(e) => setCaption(e.target.value)} aria-label="Edit caption" />
            ) : (
              <p className="quote mt-3 border-l-2 border-[var(--color-sun)] pl-4 text-[19px] leading-snug text-[var(--color-ink-2)]">“{caption}”</p>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 sm:pl-14">
          <button
            className="btn btn-fund btn-sm"
            data-respond="approve"
            onClick={() => {
              dispatch({ type: 'promote/respond', id: p.id, status: 'approved', caption });
              open({ type: 'share', promotionId: p.id });
            }}
          >
            <Icon name="check" size={16} /> Approve
          </button>
          <button className="btn btn-quiet btn-sm" onClick={() => setEditing((e) => !e)}>
            <Icon name="edit" size={15} /> {editing ? 'Done editing' : 'Edit caption'}
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => { dispatch({ type: 'promote/respond', id: p.id, status: 'declined' }); toast('Declined — no hard feelings'); }}>
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
