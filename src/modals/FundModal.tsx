import { useEffect, useState } from 'react';
import { useStore } from '../store/store';
import { useUI } from '../store/ui';
import { Avatar, AvatarStack, FundingBar, Modal, ModalClose } from '../components/ui';
import { GoalImage } from '../components/GoalCard';
import { Icon } from '../components/Icon';
import { backerCount, money } from '../lib/util';

const AMOUNTS = [10, 25, 50];

export function FundModal({ goalId }: { goalId: string }) {
  const { state, me, dispatch } = useStore();
  const { close, open } = useUI();
  const goal = state.goals[goalId];
  const owner = state.people[goal.ownerId];
  const f = goal.funding!;
  const [amount, setAmount] = useState<number | 'custom'>(25);
  const [custom, setCustom] = useState('');
  const [phase, setPhase] = useState<'pick' | 'paying' | 'done'>('pick');
  const [shownRaised, setShownRaised] = useState(f.raised);

  const value = amount === 'custom' ? Number(custom) || 0 : amount;
  const remaining = Math.max(0, f.target - f.raised);
  const backers = f.backers.map((b) => (b.personId ? state.people[b.personId] : null)).filter(Boolean).reverse() as (typeof me)[];

  const pay = () => {
    setPhase('paying');
    // Simulated payment — no processor, no money moves.
    setTimeout(() => {
      dispatch({ type: 'fund', goalId, amount: value });
      setPhase('done');
    }, 1100);
  };

  // animate the bar from old -> new on success
  useEffect(() => {
    if (phase === 'done') {
      const t = setTimeout(() => setShownRaised(goal.funding!.raised), 120);
      return () => clearTimeout(t);
    }
  }, [phase, goal.funding]);

  const full = phase === 'done' && goal.funding!.raised >= f.target;

  if (phase === 'done') {
    return (
      <Modal onClose={close} label="Thanks for backing" size="sm">
        <div className={`relative overflow-hidden px-7 pt-12 pb-8 text-center ${full ? 'golden-glow text-white' : ''}`} data-fund-done>
          <ModalClose onClose={close} light={full} />
          <span className={`mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full shadow-[0_12px_30px_-10px_rgb(232_168_0/0.9)] ${full ? 'bg-white text-[var(--color-sun-deep)]' : 'bg-[var(--color-sun)] text-[var(--color-night)]'}`}>
            <Icon name={full ? 'sparkle' : 'coin'} size={28} />
          </span>
          <h2 className="display mt-6 text-[32px] font-semibold leading-tight">{full ? `You helped ${owner.first} make it happen.` : "You're helping make this happen."}</h2>
          <p className={`mt-2 text-[16px] ${full ? 'text-white/85' : 'text-[var(--color-ink-3)]'}`}>
            {owner.first}'s goal is now <b className={full ? 'text-white' : 'text-[var(--color-night)]'}>{money(goal.funding!.raised)} / {money(f.target)}</b> funded.
          </p>
          <div className="mx-auto mt-6 max-w-xs">
            <FundingBar raised={shownRaised} target={f.target} size="lg" glow />
            <div className={`mt-3 flex items-center justify-center gap-2 text-[13px] ${full ? 'text-white/85' : 'text-[var(--color-ink-3)]'}`}>
              <Avatar person={me} size={24} ring />
              You and {backerCount(goal) - 1} others are backing this
            </div>
          </div>
          <p className={`mt-6 text-[12px] ${full ? 'text-white/60' : 'text-[var(--color-ink-4)]'}`}>Prototype · {money(value)} simulated — no real payment was made.</p>
          <div className="mt-6 flex flex-col gap-2">
            <button className={`btn ${full ? 'btn-dark' : 'btn-help'}`} onClick={close} data-autofocus>
              Done
            </button>
            <button className={`btn ${full ? 'bg-white/15 text-white' : 'btn-promote'}`} onClick={() => open({ type: 'promote', goalId })}>
              <Icon name="megaphone" size={17} /> Tell people about it
            </button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={close} label="Fund this goal">
      <ModalClose onClose={close} light />
      <div className="relative">
        <GoalImage goal={goal} className="h-40 w-full sm:h-48" />
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(6_14_36/0.75)] to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-6 text-white">
          <Avatar person={owner} size={40} />
          <div>
            <p className="text-[13px] text-white/80">Back {owner.first}'s goal</p>
            <h2 className="display text-[28px] font-semibold">
              {goal.emoji} {goal.title}
            </h2>
          </div>
        </div>
      </div>

      <div className="space-y-6 p-6 sm:p-7">
        <p className="quote text-[19px] leading-snug text-[var(--color-ink-2)]">“{goal.story}”</p>

        <div className="space-y-2.5 rounded-2xl bg-white p-4 ring-1 ring-[var(--color-line)]">
          <div className="flex items-baseline justify-between">
            <p className="text-[15px]">
              <b className="display text-[24px] font-semibold">{money(f.raised)}</b> <span className="text-[var(--color-ink-3)]">of {money(f.target)}</span>
            </p>
            <p className="text-[13px] text-[var(--color-ink-3)]">{money(remaining)} to go</p>
          </div>
          <FundingBar raised={f.raised + (phase === 'pick' ? 0 : value)} target={f.target} />
          <p className="flex items-center gap-2 text-[13px] text-[var(--color-ink-3)]">
            <AvatarStack people={backers} size={22} /> {backerCount(goal)} people backing this
          </p>
        </div>

        <div>
          <p className="mb-2.5 text-[14px] font-semibold">How much would you like to put toward it?</p>
          <div className="grid grid-cols-4 gap-2">
            {AMOUNTS.map((a) => (
              <button
                key={a}
                onClick={() => setAmount(a)}
                className={`h-14 rounded-2xl text-[18px] font-semibold transition ${amount === a ? 'bg-[var(--color-sun)] text-[var(--color-night)] shadow-[0_8px_20px_-10px_rgb(232_168_0/0.9)]' : 'bg-white ring-1 ring-[var(--color-line)] hover:ring-[var(--color-sun)]'}`}
                data-amount={a}
              >
                ${a}
              </button>
            ))}
            <button
              onClick={() => setAmount('custom')}
              className={`h-14 rounded-2xl text-[15px] font-semibold transition ${amount === 'custom' ? 'bg-[var(--color-sun)]' : 'bg-white ring-1 ring-[var(--color-line)] hover:ring-[var(--color-sun)]'}`}
            >
              Custom
            </button>
          </div>
          {amount === 'custom' && (
            <label className="relative mt-2 block animate-rise">
              <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[18px] text-[var(--color-ink-3)]">$</span>
              <input autoFocus className="field !pl-8 text-[18px]" inputMode="numeric" placeholder="Any amount" value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))} aria-label="Custom amount" />
            </label>
          )}
        </div>

        <button className="btn btn-fund btn-lg w-full" disabled={value < 1 || phase === 'paying'} onClick={pay} data-confirm-fund>
          {phase === 'paying' ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-night)] border-t-transparent" /> Sending…
            </>
          ) : (
            <>Back this goal{value ? ` with ${money(value)}` : ''}</>
          )}
        </button>
        <p className="-mt-3 text-center text-[12px] text-[var(--color-ink-4)]">Prototype — payments are simulated. Your name shows to {owner.first} as a backer.</p>
      </div>
    </Modal>
  );
}
