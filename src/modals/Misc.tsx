import { useState } from 'react';
import { useStore } from '../store/store';
import { useUI, type Modal as ModalT, type Route } from '../store/ui';
import { Avatar, Modal, ModalClose } from '../components/ui';
import { GoalImage } from '../components/GoalCard';
import { Icon } from '../components/Icon';
import { PERSONAS } from '../data/people';
import { helperCount } from '../store/store';
import { RequestCard } from '../pages/Activity';

/* ------------------------------------------------------------------ */
/* "You did it." — the sunset moment                                   */
/* ------------------------------------------------------------------ */

export function Celebrate({ goalId }: { goalId: string }) {
  const { state, dispatch } = useStore();
  const { close, open } = useUI();
  const goal = state.goals[goalId];
  const [outcome, setOutcome] = useState(goal.outcome ?? '');
  const helping = helperCount(state, goal);

  const finish = (next?: ModalT) => {
    if (outcome.trim()) dispatch({ type: 'goal/update', id: goalId, patch: { outcome: outcome.trim() } });
    if (next) open(next);
    else close();
  };

  return (
    <Modal onClose={() => finish()} label="You did it" size="sm" tone="bare">
      <div className="golden-glow relative overflow-hidden text-white" data-celebrate>
        <ModalClose onClose={() => finish()} light />
        <div className="relative h-52 overflow-hidden">
          <GoalImage goal={goal} className="h-full w-full opacity-90" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgb(255 200 61 / 0.15), rgb(8 65 184 / 0.0) 40%, rgb(255 210 122 / 0.95))' }} />
          {[...Array(14)].map((_, i) => (
            <span
              key={i}
              className="absolute h-2 w-2 rounded-full"
              style={{
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 80}%`,
                background: i % 3 ? '#ffc83d' : '#fffdf8',
                opacity: 0.8,
                animation: `rise ${0.8 + (i % 5) * 0.25}s ease-out ${i * 0.05}s both`,
              }}
            />
          ))}
        </div>
        <div className="px-7 pt-2 pb-8 text-center text-[var(--color-night)]">
          <p className="eyebrow !text-[var(--color-night)]/60">{goal.emoji} {goal.title}</p>
          <h2 className="display mt-2 text-[56px] font-semibold">You did it.</h2>
          <p className="mt-1 text-[15px] text-[var(--color-night)]/75">
            {helping > 0 ? `${helping} ${helping === 1 ? 'person' : 'people'} helped make it happen — they'll hear about it.` : 'Bucket list, one lighter.'}
          </p>
          <label className="mt-6 block text-left">
            <span className="mb-1.5 block text-[13px] font-semibold">How did it go? <span className="font-normal opacity-60">One line is plenty</span></span>
            <input className="field !bg-white/80 quote !text-[18px]" placeholder="Cried a little at kilometre 19…" value={outcome} onChange={(e) => setOutcome(e.target.value)} data-autofocus />
          </label>
          <div className="mt-6 flex flex-col gap-2">
            <button className="btn btn-dark" onClick={() => finish({ type: 'composer' })}>
              What's next? <Icon name="arrowRight" size={17} />
            </button>
            <button className="btn bg-white/60 text-[var(--color-night)] hover:bg-white" onClick={() => finish()}>
              Done
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Perspective switcher — the demo needs both sides of each flow        */
/* ------------------------------------------------------------------ */

const PERSONA_NOTES: Record<string, string> = {
  alex: 'You. Surfer, hiker, photographer in Kitsilano.',
  sarah: 'Owns the surf, mural and open-mic goals. Approves promotions and sponsor offers.',
  maya: 'Filmmaker raising money for her first short.',
  westside: 'Local paint shop — sponsors creative goals.',
  jericho: 'Paddleboard rentals — sponsors water goals.',
  reel: 'Camera rentals — sponsors film projects.',
};

export function PersonaModal() {
  const { state, me, dispatch } = useStore();
  const { close, go, toast } = useUI();
  const switchTo = (id: string) => {
    dispatch({ type: 'persona', id });
    close();
    go({ name: 'home' });
    if (id !== me.id) toast(`Now viewing as ${state.people[id].name}`);
  };
  return (
    <Modal onClose={close} label="Switch perspective" size="sm">
      <ModalClose onClose={close} />
      <div className="p-6 sm:p-7">
        <p className="eyebrow">Prototype</p>
        <h2 className="display mt-1 text-[28px] font-semibold">Switch perspective</h2>
        <p className="mt-1 text-[14px] text-[var(--color-ink-3)]">Sign-in is simulated. Hop between people and businesses to see both sides of help, funding, sponsorship and sharing.</p>
        <div className="mt-5 space-y-2">
          {PERSONAS.map((id) => {
            const p = state.people[id];
            const unread = state.notifications.filter((n) => n.to === id && !n.read).length;
            return (
              <button key={id} onClick={() => switchTo(id)} className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${me.id === id ? 'bg-[var(--color-sky-wash)] ring-2 ring-[var(--color-ocean)]' : 'bg-white ring-1 ring-[var(--color-line)] hover:ring-[var(--color-ocean)]'}`} data-persona={id}>
                <Avatar person={p} size={42} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 font-semibold">
                    {p.name}
                    {p.kind === 'business' && <span className="pill !h-5 bg-[var(--color-ocean-ink)] !text-[10px] text-white">Business</span>}
                  </span>
                  <span className="block text-[12.5px] leading-snug text-[var(--color-ink-3)]">{PERSONA_NOTES[id]}</span>
                </span>
                {unread > 0 && <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-[var(--color-sun)] px-1.5 text-[12px] font-bold">{unread}</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-5 flex items-center gap-2 text-[12px] text-[var(--color-ink-4)]">
          <Icon name="shield" size={14} /> In the real product, identity comes from Instagram, LinkedIn or TikTok.
        </p>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Demo tour — the 3–5 minute walkthrough, one click per beat           */
/* ------------------------------------------------------------------ */

interface Step {
  title: string;
  body: string;
  as: string;
  route: Route;
  modal?: ModalT;
  done?: boolean;
  /** custom runner for steps that depend on earlier ones */
  action?: () => void;
}

export function GuideModal() {
  const { state, dispatch } = useStore();
  const { close, go, open, toast } = useUI();
  const [confirmReset, setConfirmReset] = useState(false);
  const alexPromo = state.promotions.find((p) => p.goalId === 'sarah-mural' && p.promoterId === 'alex');

  const steps: Step[] = [
    { title: 'The feed', body: "People's open bucketlists, one row each.", as: 'alex', route: { name: 'home' } },
    { title: 'Search “surfing”', body: 'Synonyms and stems: surf, waves, Tofino.', as: 'alex', route: { name: 'discover', q: 'surfing' } },
    { title: "Open Sarah's goal", body: 'Learn to surf — Kitsilano.', as: 'alex', route: { name: 'goal', id: 'sarah-surf' } },
    { title: 'I can help', body: 'Edit the intro and send it.', as: 'alex', route: { name: 'goal', id: 'sarah-surf' }, modal: { type: 'help', goalId: 'sarah-surf' }, done: state.intros.some((i) => i.goalId === 'sarah-surf' && i.fromId === 'alex') },
    { title: 'My bucketlist', body: 'Want to do · In progress · Done.', as: 'alex', route: { name: 'list' } },
    { title: 'Add a goal', body: 'Lightweight — a title is enough.', as: 'alex', route: { name: 'list' }, modal: { type: 'composer' }, done: Object.values(state.goals).some((g) => g.ownerId === 'alex' && g.id.startsWith('g-')) },
    { title: 'Fund a creator', body: "Back Maya's short film with $25.", as: 'alex', route: { name: 'goal', id: 'maya-film' }, modal: { type: 'fund', goalId: 'maya-film' }, done: !!state.goals['maya-film']?.funding?.backers.some((b) => b.personId === 'alex') },
    { title: 'Sponsor as a business', body: "Westside Paint offers paint for Sarah's mural.", as: 'westside', route: { name: 'goal', id: 'sarah-mural' }, modal: { type: 'sponsor', goalId: 'sarah-mural' }, done: state.sponsorOffers.some((o) => o.fromId === 'westside' && o.goalId === 'sarah-mural') },
    { title: 'Promote', body: "Alex writes a caption for Sarah's mural.", as: 'alex', route: { name: 'goal', id: 'sarah-mural' }, modal: { type: 'promote', goalId: 'sarah-mural' }, done: !!alexPromo },
    { title: 'Approve as Sarah', body: 'Sarah reviews the caption and approves it.', as: 'sarah', route: { name: 'activity' }, done: alexPromo?.status === 'approved', action: () => approveFlow() },
    { title: 'Share card', body: 'The growth loop, as an image.', as: 'alex', route: { name: 'goal', id: 'sarah-mural' }, done: alexPromo?.status === 'approved', action: () => shareFlow() },
  ];

  const DEFAULT_CAPTION =
    "I'm really inspired by Sarah's goal to paint a community mural. If you know a business, building owner, or anyone with a wall to spare — connect them with Sarah.";

  /** Make sure there's a request from Alex waiting, then show Sarah the approval. */
  const approveFlow = () => {
    if (!alexPromo) {
      dispatch({ type: 'persona', id: 'alex' });
      dispatch({ type: 'promote/request', goalId: 'sarah-mural', caption: DEFAULT_CAPTION });
    }
    if (alexPromo?.status === 'approved') return shareFlow();
    dispatch({ type: 'persona', id: 'sarah' });
    toast('Now viewing as Sarah Chen');
    go({ name: 'activity' });
    setTimeout(() => open({ type: 'request', kind: 'promote', goalId: 'sarah-mural' }), 60);
  };

  /** The card only exists once Sarah approves — if she hasn't yet, walk through that first. */
  const shareFlow = () => {
    if (alexPromo?.status !== 'approved') {
      toast('Sarah has to approve it first');
      return approveFlow();
    }
    dispatch({ type: 'persona', id: 'alex' });
    go({ name: 'goal', id: 'sarah-mural' });
    setTimeout(() => open({ type: 'share', promotionId: alexPromo.id }), 60);
  };

  const run = (s: Step) => {
    if (s.action) return s.action();
    if (state.me !== s.as) {
      dispatch({ type: 'persona', id: s.as });
      toast(`Now viewing as ${state.people[s.as].name}`);
    }
    go(s.route);
    if (s.modal) setTimeout(() => open(s.modal!), 60);
    else close();
  };

  return (
    <Modal onClose={close} label="Demo tour" size="md">
      <ModalClose onClose={close} />
      <div className="p-6 sm:p-7">
        <p className="eyebrow">Demo tour · ~4 minutes</p>
        <h2 className="display mt-1 text-[30px] font-semibold leading-tight">Ambition → invitation.</h2>
        <p className="mt-1 text-[14px] text-[var(--color-ink-3)]">Each step jumps to the right screen and perspective. Everything is live — the state carries through.</p>
        <ol className="mt-5 space-y-1.5">
          {steps.map((s, i) => {
            const who = state.people[s.as];
            return (
              <li key={s.title}>
                <button onClick={() => run(s)} className="group flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition hover:bg-white hover:ring-1 hover:ring-[var(--color-line)]" data-step={i + 1}>
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[13px] font-bold ${s.done ? 'bg-[var(--color-sun)]' : 'bg-[var(--color-mist)] text-[var(--color-ink-2)]'}`}>
                    {s.done ? <Icon name="check" size={15} strokeWidth={3} /> : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[15px] font-semibold">{s.title}</span>
                    <span className="block text-[12.5px] text-[var(--color-ink-3)]">{s.body}</span>
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-ink-4)]">
                    <Avatar person={who} size={20} />
                    <span className="hidden sm:inline">{who.kind === 'business' ? who.name.split(' ')[0] : who.first}</span>
                  </span>
                  <Icon name="arrowRight" size={16} className="text-[var(--color-ink-4)] transition group-hover:translate-x-0.5 group-hover:text-[var(--color-ocean)]" />
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-5 flex items-center justify-between border-t border-[var(--color-line)] pt-4">
          <span className="text-[12px] text-[var(--color-ink-4)]">State is saved in this browser.</span>
          <button
            className={`btn btn-sm !text-[13px] ${confirmReset ? 'bg-[var(--color-coral)] text-white' : 'btn-ghost'}`}
            onClick={() => {
              if (!confirmReset) {
                setConfirmReset(true);
                return;
              }
              dispatch({ type: 'reset' });
              close();
              go({ name: 'home' });
              toast('Demo reset');
            }}
            data-reset
          >
            <Icon name="refresh" size={14} /> {confirmReset ? 'Click again to reset' : 'Reset demo'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* A focused approval view — what the goal owner sees when a request lands */
/* ------------------------------------------------------------------ */

export function RequestModal({ kind, goalId }: { kind: 'promote' | 'sponsor'; goalId: string }) {
  const { state, me } = useStore();
  const { close, open } = useUI();
  const goal = state.goals[goalId];
  const pending =
    kind === 'promote'
      ? state.promotions.filter((p) => p.goalId === goalId && p.status === 'pending')
      : state.sponsorOffers.filter((o) => o.goalId === goalId && o.status === 'pending');
  const approved = kind === 'promote' ? state.promotions.find((p) => p.goalId === goalId && p.status === 'approved' && p.promoterId === 'alex') : undefined;

  return (
    <Modal onClose={close} label="Review request">
      <ModalClose onClose={close} />
      <div className="p-6 sm:p-7" data-request-modal>
        <div className="flex items-center gap-3 pr-10">
          <GoalImage goal={goal} className="h-14 w-14 shrink-0 rounded-xl" w={200} />
          <div>
            <p className="eyebrow">{me.first}'s goal</p>
            <p className="display text-[22px] font-semibold leading-tight">
              {goal.emoji} {goal.title}
            </p>
          </div>
        </div>
        <h2 className="display mt-6 text-[30px] font-semibold leading-tight">
          {kind === 'promote' ? 'Someone wants to share your goal.' : 'Someone wants to sponsor your goal.'}
        </h2>
        <p className="mt-1 text-[15px] text-[var(--color-ink-3)]">
          {kind === 'promote' ? "It's your ambition, so nothing goes out without your OK. You can edit their caption first." : 'Accept it, pass on it, or message them first.'}
        </p>
        <div className="mt-5 space-y-3">
          {pending.map((r) => (
            <RequestCard key={r.id} kind={kind} id={r.id} />
          ))}
          {pending.length === 0 && (
            <div className="rounded-2xl bg-white p-5 text-center ring-1 ring-[var(--color-line)]">
              <p className="font-semibold">All caught up.</p>
              {approved && (
                <button className="btn btn-fund btn-sm mt-3" onClick={() => open({ type: 'share', promotionId: approved.id })}>
                  Open the share card
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
