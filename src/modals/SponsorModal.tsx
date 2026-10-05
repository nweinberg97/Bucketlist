import { useState } from 'react';
import { offerSummary, useStore } from '../store/store';
import { useUI } from '../store/ui';
import { Avatar, Modal, ModalClose } from '../components/ui';
import { GoalImage } from '../components/GoalCard';
import { Icon, type IconName } from '../components/Icon';
import { PERSONAS } from '../data/people';

type Kind = 'funding' | 'products' | 'services' | 'space' | 'other';

const KINDS: { k: Kind; icon: IconName; label: string; hint: string; placeholder: string }[] = [
  { k: 'funding', icon: 'coin', label: 'Funding', hint: 'Cash toward the goal', placeholder: '250' },
  { k: 'products', icon: 'store', label: 'Products / equipment', hint: 'Gear, supplies, materials', placeholder: 'e.g. Exterior paint for the whole wall' },
  { k: 'services', icon: 'hand', label: 'Services / expertise', hint: 'Lessons, skills, time', placeholder: 'e.g. A 2-hour lesson with an instructor' },
  { k: 'space', icon: 'pin', label: 'Space / venue', hint: 'A wall, a room, a stage', placeholder: 'e.g. Our back wall on West 4th' },
  { k: 'other', icon: 'sparkle', label: 'Other', hint: 'Discounts, transport, promo…', placeholder: 'e.g. We’ll feature it on our Instagram' },
];

/** Sensible starting offers so the demo flows — a real product would learn these from the business profile. */
const PRESETS: Record<string, Partial<Record<Kind, string>>> = {
  westside: { products: 'Exterior paint, primer and brushes for the whole wall', space: '' },
  jericho: { products: 'Free paddleboard for the summer', services: '2-hour lesson with one of our instructors' },
  reel: { products: 'Camera + lens package for 4 shoot days' },
};

export function SponsorModal({ goalId }: { goalId: string }) {
  const { state, me, dispatch } = useStore();
  const { close, go, toast } = useUI();
  const goal = state.goals[goalId];
  const owner = state.people[goal.ownerId];
  const preset = PRESETS[me.id] ?? {};
  const [on, setOn] = useState<Set<Kind>>(() => new Set((Object.keys(preset) as Kind[]).filter((k) => preset[k])));
  const [vals, setVals] = useState<Record<Kind, string>>({ funding: '', products: '', services: '', space: '', other: '', ...preset } as Record<Kind, string>);
  const [sent, setSent] = useState(false);

  const offer = {
    goalId,
    funding: on.has('funding') ? Number(vals.funding) || undefined : undefined,
    products: on.has('products') ? vals.products.trim() || undefined : undefined,
    services: on.has('services') ? vals.services.trim() || undefined : undefined,
    space: on.has('space') ? vals.space.trim() || undefined : undefined,
    other: on.has('other') ? vals.other.trim() || undefined : undefined,
  };
  const summary = offerSummary(offer);

  const toggle = (k: Kind) =>
    setOn((s) => {
      const n = new Set(s);
      if (n.has(k)) n.delete(k);
      else n.add(k);
      return n;
    });

  const ownerIsPersona = PERSONAS.includes(owner.id);

  if (sent) {
    return (
      <Modal onClose={close} label="Sponsorship offer sent">
        <ModalClose onClose={close} />
        <div className="px-7 pt-12 pb-8 sm:px-10" data-sponsor-sent>
          <div className="text-center">
            <span className="mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-[var(--color-ocean-ink)] text-white">
              <Icon name="check" size={30} strokeWidth={2.6} />
            </span>
            <h2 className="display mt-6 text-[32px] font-semibold">Offer sent to {owner.first}</h2>
            <p className="mt-2 text-[16px] text-[var(--color-ink-3)]">Here's what lands in {owner.first}'s activity.</p>
          </div>

          <div className="mx-auto mt-6 max-w-md overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-lift)] ring-1 ring-[var(--color-line)]">
            <div className="flex items-center gap-2 bg-[var(--color-ocean-ink)] px-5 py-2.5 text-[11px] font-semibold tracking-[0.12em] text-white uppercase">
              <Icon name="store" size={13} /> New sponsorship offer
            </div>
            <div className="flex gap-3 p-5">
              <Avatar person={me} size={40} />
              <div>
                <p className="text-[14px] leading-snug">
                  <b>{me.name}</b> wants to help make your goal happen.
                </p>
                <p className="mt-2 text-[14px]">
                  <span className="font-semibold">Offer:</span> {summary}
                </p>
                <div className="pointer-events-none mt-3 flex gap-2 opacity-60">
                  <span className="btn btn-help btn-sm !h-8 !text-[12px]">Accept</span>
                  <span className="btn btn-quiet btn-sm !h-8 !text-[12px]">Decline</span>
                  <span className="btn btn-ghost btn-sm !h-8 !text-[12px]">Message</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
            {ownerIsPersona && (
              <button
                className="btn btn-help"
                onClick={() => {
                  dispatch({ type: 'persona', id: owner.id });
                  close();
                  go({ name: 'activity' });
                  toast(`Now viewing as ${owner.first}`);
                }}
                data-switch-to-owner
              >
                See it as {owner.first} <Icon name="arrowRight" size={17} />
              </button>
            )}
            <button className="btn btn-quiet" onClick={close} data-autofocus>
              Done
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={close} label="Sponsor this goal">
      <ModalClose onClose={close} />
      <div className="p-6 pr-16 sm:p-7 sm:pr-16">
        <p className="eyebrow !text-[var(--color-ocean)]">Sponsor this goal</p>
        <h2 className="display mt-2 text-[32px] font-semibold leading-tight">Help make this goal happen.</h2>
        <div className="mt-5 flex items-center gap-3.5 rounded-2xl bg-white p-3 ring-1 ring-[var(--color-line)]">
          <GoalImage goal={goal} className="h-16 w-16 shrink-0 overflow-hidden rounded-xl" />
          <div className="min-w-0">
            <p className="font-semibold leading-tight">
              {goal.emoji} {goal.title}
            </p>
            <p className="mt-0.5 text-[13px] text-[var(--color-ink-3)]">
              {owner.name} · {goal.hood}
            </p>
          </div>
        </div>
        {goal.sponsorship?.need && (
          <div className="mt-3 rounded-2xl bg-[var(--color-sand-wash)] px-4 py-3 ring-1 ring-[var(--color-sand)]">
            <p className="eyebrow !text-[10px]">What's standing in the way</p>
            <p className="mt-1 text-[15px]">{goal.sponsorship.need}</p>
          </div>
        )}
      </div>

      <div className="space-y-3 px-6 pb-7 sm:px-7">
        <p className="text-[14px] font-semibold">What could you offer?</p>
        {KINDS.map(({ k, icon, label, hint, placeholder }) => {
          const active = on.has(k);
          return (
            <div key={k} className={`rounded-2xl transition ${active ? 'bg-white ring-2 ring-[var(--color-ocean)]' : 'bg-white ring-1 ring-[var(--color-line)]'}`}>
              <button className="flex w-full items-center gap-3 p-3.5 text-left" onClick={() => toggle(k)} aria-pressed={active} data-offer-kind={k}>
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${active ? 'bg-[var(--color-ocean)] text-white' : 'bg-[var(--color-mist)] text-[var(--color-ink-2)]'}`}>
                  <Icon name={icon} size={17} />
                </span>
                <span className="flex-1">
                  <span className="block text-[15px] font-semibold">{label}</span>
                  <span className="block text-[12.5px] text-[var(--color-ink-3)]">{hint}</span>
                </span>
                <span className={`flex h-6 w-6 items-center justify-center rounded-full ${active ? 'bg-[var(--color-ocean)] text-white' : 'ring-1 ring-[var(--color-line)]'}`}>{active && <Icon name="check" size={14} strokeWidth={3} />}</span>
              </button>
              {active && (
                <div className="animate-rise px-3.5 pb-3.5">
                  {k === 'funding' ? (
                    <label className="relative block">
                      <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--color-ink-3)]">$</span>
                      <input className="field !pl-8" inputMode="numeric" placeholder={placeholder} value={vals.funding} onChange={(e) => setVals((v) => ({ ...v, funding: e.target.value.replace(/[^0-9]/g, '') }))} autoFocus aria-label="Funding amount" />
                    </label>
                  ) : (
                    <input className="field" placeholder={placeholder} value={vals[k]} onChange={(e) => setVals((v) => ({ ...v, [k]: e.target.value }))} autoFocus={!preset[k]} aria-label={label} />
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-3">
          <button
            className="btn btn-sponsor btn-lg w-full"
            disabled={!summary}
            onClick={() => {
              dispatch({ type: 'sponsor/offer', offer });
              setSent(true);
            }}
            data-send-sponsor
          >
            Send sponsorship offer
          </button>
          <p className="mt-2 text-center text-[12px] text-[var(--color-ink-4)]">
            Offering as <b className="text-[var(--color-ink-3)]">{me.name}</b>. {owner.first} can accept, decline or message you.
          </p>
        </div>
      </div>
    </Modal>
  );
}
