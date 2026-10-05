import { useState, type ReactNode } from 'react';
import { useStore } from '../store/store';
import { Link, useUI, type Route } from '../store/ui';
import { Avatar } from './ui';
import { Icon, type IconName } from './Icon';

/** The mark: a hot-air balloon — your goals lift you somewhere. */
export function BalloonMark({ size = 28, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size * 1.12} viewBox="0 0 32 36" className={className} aria-hidden="true">
      <path d="M16 1.5C25.5 1.5 30.2 9 28.6 16.4 27.4 22 21.6 25.2 19.6 28H12.4C10.4 25.2 4.6 22 3.4 16.4 1.8 9 6.5 1.5 16 1.5Z" fill="#0b5cff" />
      <path d="M16 1.5C21 1.5 23 9 22.4 16.4 22 22 19.4 25.2 18.4 28H13.6C12.6 25.2 10 22 9.6 16.4 9 9 11 1.5 16 1.5Z" fill="#ffc83d" />
      <path d="M16 1.5C17.8 1.5 18.6 9 18.4 16.4 18.2 22 17.2 25.2 16.8 28H15.2C14.8 25.2 13.8 22 13.6 16.4 13.4 9 14.2 1.5 16 1.5Z" fill="#ff8066" />
      <path d="M6 10.5C9 8.6 23 8.6 26 10.5" stroke="#fffdf8" strokeWidth="1" fill="none" opacity=".55" />
      <path d="M12.4 28 13.4 31M19.6 28 18.6 31" stroke="#111318" strokeWidth="1.1" strokeLinecap="round" />
      <rect x="12.6" y="30.6" width="6.8" height="4.4" rx="1.2" fill="#8a5d33" />
    </svg>
  );
}

export function Logo({ light = false, size = 22 }: { light?: boolean; size?: number }) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${light ? 'text-white' : 'text-[var(--color-night)]'}`}>
      <BalloonMark size={size + 4} className="-mt-1" />
      <span className="display font-semibold tracking-[-0.04em]" style={{ fontSize: size }}>
        bucketlist
      </span>
    </span>
  );
}

function NavLink({ to, label, icon, active }: { to: Route; label: string; icon: IconName; active: boolean }) {
  return (
    <Link
      to={to}
      className={`flex h-10 items-center gap-2 rounded-full px-4 text-[15px] font-semibold transition ${active ? 'bg-[var(--color-night)] text-[var(--color-cloud)]' : 'text-[var(--color-ink-2)] hover:bg-[var(--color-mist)] hover:text-[var(--color-night)]'}`}
    >
      <Icon name={icon} size={17} />
      {label}
    </Link>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { state, me } = useStore();
  const { route, go, open } = useUI();
  const [q, setQ] = useState('');
  const unread = state.notifications.filter((n) => n.to === me.id && !n.read).length;
  const isBiz = me.kind === 'business';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    go({ name: 'discover', q: q.trim() || undefined });
  };

  return (
    <div className="min-h-dvh pb-24 md:pb-0">
      {/* ---------------- Desktop / tablet top bar ---------------- */}
      <header className="sticky top-[env(safe-area-inset-top,0px)] z-40 border-b border-[var(--color-line)]/70 bg-[var(--color-cloud)]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-[1440px] items-center gap-3 px-4 md:px-8">
          <Link to={{ name: 'home' }} aria-label="Bucketlist home" className="shrink-0">
            <Logo />
          </Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary">
            <NavLink to={{ name: 'home' }} label="Home" icon="home" active={route.name === 'home'} />
            <NavLink to={{ name: 'discover' }} label="Discover" icon="compass" active={route.name === 'discover'} />
            {!isBiz && <NavLink to={{ name: 'list' }} label="My bucketlist" icon="list" active={route.name === 'list'} />}
          </nav>

          <form onSubmit={submit} className="ml-auto hidden max-w-[320px] flex-1 md:block" role="search">
            <label className="flex h-11 items-center gap-2 rounded-full bg-[var(--color-mist)] px-4 text-[var(--color-ink-3)] ring-[var(--color-ocean)] transition focus-within:bg-white focus-within:ring-2">
              <Icon name="search" size={17} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search goals — surfing, pottery, Japan…"
                className="w-full bg-transparent text-[15px] text-[var(--color-night)] outline-none placeholder:text-[var(--color-ink-4)]"
                aria-label="Search goals"
              />
            </label>
          </form>

          <div className="ml-auto flex items-center gap-1.5 md:ml-2">
            {!isBiz && (
              <button className="btn btn-help btn-sm hidden md:inline-flex" onClick={() => open({ type: 'composer' })}>
                <Icon name="plus" size={17} strokeWidth={2.4} /> Add a goal
              </button>
            )}
            <Link
              to={{ name: 'activity' }}
              className={`relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-[var(--color-mist)] ${route.name === 'activity' ? 'bg-[var(--color-mist)]' : ''}`}
              aria-label={`Activity${unread ? `, ${unread} new` : ''}`}
            >
              <Icon name="bell" size={20} />
              {unread > 0 && (
                <span className="absolute top-1 right-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[var(--color-sun)] px-1 text-[11px] font-bold text-[var(--color-night)] ring-2 ring-[var(--color-cloud)]">
                  {unread}
                </span>
              )}
            </Link>
            <button
              onClick={() => open({ type: 'persona' })}
              className="flex items-center gap-2 rounded-full py-1 pr-1 pl-1 transition hover:bg-[var(--color-mist)] md:pl-3"
              aria-label={`Viewing as ${me.name}. Switch perspective`}
              data-persona-switch
            >
              <span className="hidden text-right leading-tight md:block">
                <span className="block text-[10px] font-semibold tracking-[0.12em] text-[var(--color-ink-4)] uppercase">Viewing as</span>
                <span className="block text-[13px] font-semibold">{me.first === me.name ? me.name : me.kind === 'business' ? me.name : me.first}</span>
              </span>
              <Avatar person={me} size={34} />
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Demo tour launcher — for presenting the prototype */}
      <button
        onClick={() => open({ type: 'guide' })}
        className="fixed bottom-6 left-6 z-30 hidden items-center gap-2 rounded-full bg-[var(--color-night)] py-2.5 pr-4 pl-3 text-[13px] font-semibold text-[var(--color-cloud)] shadow-[var(--shadow-lift)] transition hover:-translate-y-0.5 md:flex"
        data-demo-guide
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-sun)] text-[var(--color-night)]">
          <Icon name="play" size={11} strokeWidth={0} fill="currentColor" />
        </span>
        Demo tour
      </button>

      {/* ---------------- Mobile tab bar ---------------- */}
      <nav className="pb-safe fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-line)] bg-[var(--color-cloud)]/95 backdrop-blur-xl md:hidden" aria-label="Primary">
        <div className="mx-auto grid h-[66px] max-w-md grid-cols-5 items-center px-2">
          <TabLink to={{ name: 'home' }} icon="home" label="Home" active={route.name === 'home'} />
          <TabLink to={{ name: 'discover' }} icon="compass" label="Discover" active={route.name === 'discover'} />
          <div className="flex justify-center">
            {isBiz ? (
              <button onClick={() => open({ type: 'guide' })} className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-night)] text-[var(--color-sun)]" aria-label="Demo tour">
                <Icon name="play" size={16} strokeWidth={0} fill="currentColor" />
              </button>
            ) : (
              <button
                onClick={() => open({ type: 'composer' })}
                className="flex h-13 w-13 -translate-y-3 items-center justify-center rounded-full text-[var(--color-night)] shadow-[0_10px_24px_-8px_rgb(11_92_255/0.6)]"
                style={{ background: 'linear-gradient(160deg,#0b5cff 0%,#55b8ff 60%,#ffc83d 100%)', width: 54, height: 54 }}
                aria-label="Add a goal"
              >
                <Icon name="plus" size={24} strokeWidth={2.6} className="text-white" />
              </button>
            )}
          </div>
          {isBiz ? <TabLink to={{ name: 'activity' }} icon="bell" label="Activity" active={route.name === 'activity'} /> : <TabLink to={{ name: 'list' }} icon="list" label="My list" active={route.name === 'list'} />}
          <TabLink to={{ name: 'person', id: me.id }} icon="users" label="Profile" active={route.name === 'person' && route.id === me.id} />
        </div>
      </nav>
    </div>
  );
}

function TabLink({ to, icon, label, active }: { to: Route; icon: IconName; label: string; active: boolean }) {
  return (
    <Link to={to} className={`flex flex-col items-center gap-1 text-[11px] font-semibold ${active ? 'text-[var(--color-ocean)]' : 'text-[var(--color-ink-3)]'}`}>
      <Icon name={icon} size={22} strokeWidth={active ? 2.2 : 1.8} />
      {label}
    </Link>
  );
}
