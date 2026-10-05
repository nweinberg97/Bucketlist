import { useEffect, useRef, type ReactNode } from 'react';
import type { Person, Privacy } from '../types';
import { Icon, type IconName } from './Icon';
import { PRIVACY, money } from '../lib/util';
import { useUI } from '../store/ui';

/* ---------------- Avatar ---------------- */

export function Avatar({ person, size = 36, ring = false, className = '' }: { person: Person; size?: number; ring?: boolean; className?: string }) {
  const initials = person.kind === 'business' ? person.name.split(' ').slice(0, 2).map((w) => w[0]).join('') : person.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
  // same hue family as the person's feed tint (violets pulled into sky blue)
  const h = person.hue > 250 && person.hue < 335 ? 228 : person.hue;
  const bg =
    person.kind === 'business'
      ? `linear-gradient(140deg, #062a78, #0b5cff)`
      : `radial-gradient(120% 120% at 20% 10%, hsl(${(h + 30) % 360} 90% 82%), hsl(${h} 70% 62%) 60%, hsl(${(h + 340) % 360} 60% 46%))`;
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center font-semibold text-white select-none ${person.kind === 'business' ? 'rounded-[30%]' : 'rounded-full'} ${ring ? 'ring-2 ring-[var(--color-cloud)]' : ''} ${className}`}
      style={{ width: size, height: size, background: bg, fontSize: size * 0.36, letterSpacing: '-0.02em', textShadow: '0 1px 2px rgb(0 0 0 / .18)' }}
      aria-label={person.name}
      title={person.name}
    >
      {initials}
    </span>
  );
}

export function AvatarStack({ people, size = 26, max = 4 }: { people: Person[]; size?: number; max?: number }) {
  return (
    <span className="flex -space-x-2">
      {people.slice(0, max).map((p) => (
        <Avatar key={p.id} person={p} size={size} ring />
      ))}
    </span>
  );
}

/* ---------------- Progress ---------------- */

export function FundingBar({ raised, target, size = 'md', glow = false }: { raised: number; target: number; size?: 'sm' | 'md' | 'lg'; glow?: boolean }) {
  const pct = Math.min(100, (raised / target) * 100);
  const h = size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2';
  return (
    <div className={`relative w-full overflow-hidden rounded-full bg-[var(--color-sand)] ${h}`} role="progressbar" aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100}>
      <div
        className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background: pct >= 100 ? 'linear-gradient(90deg,#ff8066,#ffc83d)' : 'linear-gradient(90deg,#ffb800,#ffc83d)',
          boxShadow: glow ? '0 0 16px rgb(255 200 61 / .8)' : undefined,
        }}
      />
    </div>
  );
}

export function FundingLine({ raised, target, className = '' }: { raised: number; target: number; className?: string }) {
  return (
    <div className={`flex items-baseline justify-between gap-2 ${className}`}>
      <span className="text-[15px] font-semibold">
        {money(raised)} <span className="font-normal text-[var(--color-ink-3)]">of {money(target)}</span>
      </span>
      <span className="text-xs font-semibold text-[var(--color-ink-3)]">{Math.min(100, Math.round((raised / target) * 100))}%</span>
    </div>
  );
}

/* ---------------- Privacy ---------------- */

const PRIVACY_ICON: Record<Privacy, IconName> = { public: 'globe', network: 'users', private: 'lock' };

export function PrivacyBadge({ privacy, className = '' }: { privacy: Privacy; className?: string }) {
  return (
    <span className={`pill bg-white/90 text-[var(--color-night)] backdrop-blur ${className}`} title={PRIVACY[privacy].help}>
      <Icon name={PRIVACY_ICON[privacy]} size={13} strokeWidth={2.2} />
      {PRIVACY[privacy].label}
    </span>
  );
}

export function PrivacyPicker({ value, onChange, compact = false }: { value: Privacy; onChange: (p: Privacy) => void; compact?: boolean }) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-[var(--color-mist)] p-1" role="radiogroup" aria-label="Who can see this goal">
        {(Object.keys(PRIVACY) as Privacy[]).map((p) => (
          <button
            key={p}
            type="button"
            role="radio"
            aria-checked={value === p}
            onClick={() => onChange(p)}
            className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-2 text-sm font-semibold transition-all ${value === p ? 'bg-white text-[var(--color-night)] shadow-[var(--shadow-soft)]' : 'text-[var(--color-ink-3)] hover:text-[var(--color-night)]'}`}
          >
            <span className="flex items-center gap-1.5">
              <Icon name={PRIVACY_ICON[p]} size={15} />
              {PRIVACY[p].label}
            </span>
            {!compact && <span className="text-[11px] font-medium text-[var(--color-ink-4)]">{PRIVACY[p].short}</span>}
          </button>
        ))}
      </div>
      <p className="mt-2 text-[13px] text-[var(--color-ink-3)]">{PRIVACY[value].help}</p>
    </div>
  );
}

/* ---------------- Social identity ---------------- */

export function SocialBadges({ person, size = 'sm' }: { person: Person; size?: 'sm' | 'md' }) {
  const s = size === 'sm' ? 13 : 15;
  const items: { icon: IconName; label: string }[] = [];
  if (person.socials.instagram) items.push({ icon: 'instagram', label: `@${person.socials.instagram}` });
  if (person.socials.linkedin) items.push({ icon: 'linkedin', label: 'LinkedIn' });
  if (person.socials.tiktok) items.push({ icon: 'tiktok', label: `@${person.socials.tiktok}` });
  return (
    <span className="inline-flex items-center gap-1 text-[var(--color-ink-3)]" title={`Verified via ${items.map((i) => i.label).join(', ')}`}>
      {items.map((i) => (
        <Icon key={i.icon} name={i.icon} size={s} />
      ))}
      <span className="sr-only">Verified identity</span>
    </span>
  );
}

/* ---------------- Modal ---------------- */

export function Modal({
  children,
  onClose,
  label,
  size = 'md',
  tone = 'light',
}: {
  children: ReactNode;
  onClose: () => void;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  tone?: 'light' | 'bare';
}) {
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel.current?.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, []);

  const w = size === 'sm' ? 'sm:max-w-md' : size === 'lg' ? 'sm:max-w-3xl' : 'sm:max-w-xl';
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6" role="dialog" aria-modal="true" aria-label={label}>
      <div className="absolute inset-0 animate-fade bg-[rgb(8_20_52/0.42)] backdrop-blur-[3px]" onClick={onClose} />
      <div
        ref={panel}
        className={`relative max-h-[92dvh] w-full overflow-y-auto overscroll-contain ${w} ${tone === 'light' ? 'bg-[var(--color-cloud)]' : ''} rounded-t-[28px] shadow-[var(--shadow-modal)] sm:rounded-[28px] animate-rise`}
      >
        {children}
      </div>
    </div>
  );
}

export function ModalClose({ onClose, light = false }: { onClose: () => void; light?: boolean }) {
  return (
    <button
      onClick={onClose}
      aria-label="Close"
      className={`absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition ${light ? 'bg-white/20 text-white backdrop-blur hover:bg-white/30' : 'bg-[var(--color-mist)] text-[var(--color-ink-2)] hover:bg-[var(--color-line)]'}`}
    >
      <Icon name="x" size={18} />
    </button>
  );
}

/* ---------------- Toasts ---------------- */

export function Toasts() {
  const { toasts } = useUI();
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 md:bottom-8">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex animate-rise items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-[var(--shadow-lift)] ${t.tone === 'sun' ? 'bg-[var(--color-sun)] text-[var(--color-night)]' : 'bg-[var(--color-night)] text-[var(--color-cloud)]'}`}
          role="status"
        >
          <Icon name="check" size={16} strokeWidth={2.6} />
          {t.text}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Section header ---------------- */

export function SectionHead({ title, sub, action }: { title: string; sub?: string; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        <h2 className="display text-[26px] font-semibold md:text-[30px]">{title}</h2>
        {sub && <p className="mt-1 text-[15px] text-[var(--color-ink-3)]">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------------- Empty state ---------------- */

export function Empty({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="horizon-soft relative overflow-hidden rounded-[var(--radius-card)] px-6 py-12 text-center">
      <svg viewBox="0 0 60 80" className="mx-auto mb-4 h-16 w-12 animate-float" aria-hidden="true">
        <path d="M30 4C44 4 50 18 46 30 43 38 36 46 34 52H26C24 46 17 38 14 30 10 18 16 4 30 4Z" fill="#ffc83d" />
        <path d="M30 4C36 4 38 18 36 30 35 38 32 46 31.5 52H28.5C28 46 25 38 24 30 22 18 24 4 30 4Z" fill="#ff8066" />
        <path d="M26 52 27 57M34 52 33 57" stroke="#111318" strokeWidth="1" /><path d="M24.5 60.5C24.5 55 35.5 55 35.5 60.5" stroke="#111318" strokeWidth="1.2" fill="none" />
        <path d="M23.5 60.5H36.5L35 69H25Z" fill="#111318" /><rect x="23" y="59.5" width="14" height="2.4" rx="1.1" fill="#3c4049" /><path d="M25 64.5H35" stroke="#ffc83d" strokeWidth="1.1" />
      </svg>
      <h3 className="display text-2xl font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-[15px] text-[var(--color-ink-3)]">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
