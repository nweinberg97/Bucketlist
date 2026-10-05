import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react';
import type { AppState, Goal, Notification, Person, Promotion, SponsorOffer, Status } from '../types';
import { createSeedState, STATE_VERSION } from '../data/seed';
import { canSee, fundedPct, uid } from '../lib/util';

/* ------------------------------------------------------------------ */
/* Actions                                                             */
/* ------------------------------------------------------------------ */

export type Action =
  | { type: 'persona'; id: string }
  | { type: 'goal/add'; goal: Goal }
  | { type: 'goal/update'; id: string; patch: Partial<Goal> }
  | { type: 'goal/delete'; id: string }
  | { type: 'goal/status'; id: string; status: Status }
  | { type: 'help'; goalId: string; message: string; mode: 'self' | 'someone'; introduced?: string }
  | { type: 'fund'; goalId: string; amount: number }
  | { type: 'sponsor/offer'; offer: Omit<SponsorOffer, 'id' | 'status' | 'at' | 'fromId'> }
  | { type: 'sponsor/respond'; id: string; status: 'accepted' | 'declined' }
  | { type: 'promote/request'; goalId: string; caption: string }
  | { type: 'promote/respond'; id: string; status: 'approved' | 'declined'; caption?: string }
  | { type: 'notifications/read' }
  | { type: 'reset' };

const STORAGE_KEY = 'bucketlist:state';

function notify(state: AppState, n: Omit<Notification, 'id' | 'at' | 'read'>): AppState {
  return { ...state, notifications: [{ id: uid('n'), at: Date.now(), read: false, ...n }, ...state.notifications] };
}

function patchGoal(state: AppState, id: string, patch: Partial<Goal>): AppState {
  const g = state.goals[id];
  if (!g) return state;
  return { ...state, goals: { ...state.goals, [id]: { ...g, ...patch } } };
}

export function offerSummary(o: Pick<SponsorOffer, 'funding' | 'products' | 'services' | 'space' | 'other'>) {
  const parts = [
    o.funding ? `$${o.funding.toLocaleString()} toward the goal` : '',
    o.products ?? '',
    o.services ?? '',
    o.space ?? '',
    o.other ?? '',
  ].filter((x) => x && x.trim());
  return parts.join(' + ');
}

function reducer(state: AppState, a: Action): AppState {
  const me = state.people[state.me];
  switch (a.type) {
    case 'persona':
      return { ...state, me: a.id };

    case 'goal/add':
      return { ...state, goals: { [a.goal.id]: a.goal, ...state.goals } };

    case 'goal/update':
      return patchGoal(state, a.id, a.patch);

    case 'goal/delete': {
      const goals = { ...state.goals };
      delete goals[a.id];
      return { ...state, goals };
    }

    case 'goal/status': {
      const g = state.goals[a.id];
      const done = a.status === 'done';
      let next = patchGoal(state, a.id, { status: a.status, completedAt: done ? Date.now() : undefined });
      if (done && g.status !== 'done' && g.privacy !== 'private') {
        // Completion ripples out to the people who helped — this closes the loop.
        const helpers = new Set([
          ...state.intros.filter((i) => i.goalId === g.id).map((i) => i.fromId),
          ...(g.funding?.backers.map((b) => b.personId).filter(Boolean) as string[]),
        ]);
        helpers.delete(g.ownerId);
        for (const h of helpers) {
          next = notify(next, { to: h, kind: 'completed', actorId: g.ownerId, goalId: g.id, text: `${me.first} did it: '${g.title}.' You helped make this happen.` });
        }
      }
      return next;
    }

    case 'help': {
      const g = state.goals[a.goalId];
      const next: AppState = {
        ...state,
        intros: [{ id: uid('i'), goalId: a.goalId, fromId: me.id, message: a.message, mode: a.mode, at: Date.now() }, ...state.intros],
        people: { ...state.people, [me.id]: { ...me, stats: { ...me.stats, helped: me.stats.helped + 1 } } },
      };
      return notify(next, {
        to: g.ownerId,
        kind: 'help',
        actorId: me.id,
        goalId: g.id,
        text: a.mode === 'someone' ? `${me.first} wants to introduce you to ${a.introduced || 'someone'} for '${g.title}.'` : `${me.first} offered to help with '${g.title}.'`,
        quote: a.message,
      });
    }

    case 'fund': {
      const g = state.goals[a.goalId];
      if (!g.funding) return state;
      const before = fundedPct(g);
      const funding = {
        ...g.funding,
        raised: g.funding.raised + a.amount,
        backers: [...g.funding.backers, { personId: me.id, name: me.name, amount: a.amount, at: Date.now() }],
      };
      let next = patchGoal(state, g.id, { funding });
      next = {
        ...next,
        people: { ...next.people, [me.id]: { ...me, stats: { ...me.stats, backed: me.stats.backed + 1 } } },
      };
      next = notify(next, { to: g.ownerId, kind: 'fund', actorId: me.id, goalId: g.id, text: `${me.first} backed '${g.title}' with $${a.amount}.` });
      const after = fundedPct(next.goals[g.id]);
      for (const m of [50, 75, 100]) {
        if (before < m && after >= m) {
          next = notify(next, {
            to: g.ownerId,
            kind: 'milestone',
            goalId: g.id,
            text: m === 100 ? `You made it happen — '${g.title}' is fully funded.` : `'${g.title}' is now ${m}% funded.`,
          });
        }
      }
      return next;
    }

    case 'sponsor/offer': {
      const g = state.goals[a.offer.goalId];
      const offer: SponsorOffer = { ...a.offer, id: uid('s'), fromId: me.id, status: 'pending', at: Date.now() };
      const next = { ...state, sponsorOffers: [offer, ...state.sponsorOffers] };
      return notify(next, {
        to: g.ownerId,
        kind: 'sponsor-offer',
        actorId: me.id,
        goalId: g.id,
        refId: offer.id,
        text: `${me.name} wants to make '${g.title}' happen with you.`,
        quote: offer.experience || offerSummary(offer),
      });
    }

    case 'sponsor/respond': {
      const o = state.sponsorOffers.find((x) => x.id === a.id);
      if (!o) return state;
      const g = state.goals[o.goalId];
      let next: AppState = { ...state, sponsorOffers: state.sponsorOffers.map((x) => (x.id === a.id ? { ...x, status: a.status } : x)) };
      if (a.status === 'accepted' && o.funding && g.funding?.enabled) {
        // Sponsor cash counts toward the goal like any other backer.
        next = patchGoal(next, g.id, {
          funding: { ...g.funding, raised: g.funding.raised + o.funding, backers: [...g.funding.backers, { personId: o.fromId, name: next.people[o.fromId].name, amount: o.funding, at: Date.now() }] },
        });
      }
      return notify(next, {
        to: o.fromId,
        kind: a.status === 'accepted' ? 'sponsor-accepted' : 'sponsor-declined',
        actorId: g.ownerId,
        goalId: g.id,
        text: a.status === 'accepted' ? `${state.people[g.ownerId].first} accepted your sponsorship of '${g.title}.'` : `${state.people[g.ownerId].first} passed on your offer for '${g.title}' — thanks for offering.`,
      });
    }

    case 'promote/request': {
      const g = state.goals[a.goalId];
      const p: Promotion = { id: uid('p'), goalId: g.id, promoterId: me.id, caption: a.caption, status: 'pending', at: Date.now() };
      const next = { ...state, promotions: [p, ...state.promotions] };
      return notify(next, {
        to: g.ownerId,
        kind: 'promote-request',
        actorId: me.id,
        goalId: g.id,
        refId: p.id,
        text: `${me.first} wants to share '${g.title}.'`,
        quote: a.caption,
      });
    }

    case 'promote/respond': {
      const p = state.promotions.find((x) => x.id === a.id);
      if (!p) return state;
      const g = state.goals[p.goalId];
      let next: AppState = {
        ...state,
        promotions: state.promotions.map((x) => (x.id === a.id ? { ...x, status: a.status, caption: a.caption ?? x.caption } : x)),
      };
      if (a.status === 'approved') next = patchGoal(next, g.id, { shares: g.shares + 1 });
      return notify(next, {
        to: p.promoterId,
        kind: a.status === 'approved' ? 'promote-approved' : 'promote-declined',
        actorId: g.ownerId,
        goalId: g.id,
        refId: p.id,
        text: a.status === 'approved' ? `${state.people[g.ownerId].first} approved your post. Your share card is ready.` : `${state.people[g.ownerId].first} would rather keep '${g.title}' low-key for now.`,
      });
    }

    case 'notifications/read':
      return { ...state, notifications: state.notifications.map((n) => (n.to === state.me ? { ...n, read: true } : n)) };

    case 'reset':
      return createSeedState();
  }
}

/* ------------------------------------------------------------------ */
/* Persistence                                                         */
/* ------------------------------------------------------------------ */

function load(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === STATE_VERSION) return parsed;
    }
  } catch {
    /* storage unavailable — fall back to seed */
  }
  return createSeedState();
}

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

interface StoreValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  me: Person;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* quota or privacy mode — the prototype still works in memory */
    }
  }, [state]);

  const value = useMemo(() => ({ state, dispatch, me: state.people[state.me] }), [state]);
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const v = useContext(StoreContext);
  if (!v) throw new Error('useStore outside provider');
  return v;
}

/* ------------------------------------------------------------------ */
/* Selectors                                                           */
/* ------------------------------------------------------------------ */

export function useVisibleGoals() {
  const { state, me } = useStore();
  return useMemo(
    () => Object.values(state.goals).filter((g) => canSee(g, me, state.people[g.ownerId])),
    [state.goals, state.people, me],
  );
}

export function helperCount(state: AppState, g: Goal) {
  const intros = new Set(state.intros.filter((i) => i.goalId === g.id && i.fromId !== g.ownerId).map((i) => i.fromId));
  const backers = g.funding ? g.funding.backers.length : 0;
  const sponsors = state.sponsorOffers.filter((o) => o.goalId === g.id && o.status === 'accepted').length;
  return g.baseHelpers + intros.size + backers + sponsors;
}

export function myOffersFor(state: AppState, goalId: string) {
  return {
    intro: state.intros.find((i) => i.goalId === goalId && i.fromId === state.me),
    sponsor: state.sponsorOffers.find((o) => o.goalId === goalId && o.fromId === state.me),
    promo: state.promotions.find((p) => p.goalId === goalId && p.promoterId === state.me),
    backed: state.goals[goalId]?.funding?.backers.filter((b) => b.personId === state.me).reduce((s, b) => s + b.amount, 0) ?? 0,
  };
}
