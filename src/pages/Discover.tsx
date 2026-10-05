import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, useVisibleGoals } from '../store/store';
import { useUI } from '../store/ui';
import { GoalCard } from '../components/GoalCard';
import { Empty } from '../components/ui';
import { Icon } from '../components/Icon';
import { CATEGORIES, LOCATION_FILTERS, type LocationFilter } from '../lib/util';
import { DEFAULT_FILTERS, SUGGESTED_SEARCHES, expandQuery, filterGoals, type Filters, type SortKey } from '../lib/search';

export function Discover({ q: routeQ }: { q?: string }) {
  const { state, me } = useStore();
  const { go } = useUI();
  const visible = useVisibleGoals();
  const [f, setF] = useState<Filters>({ ...DEFAULT_FILTERS, q: routeQ ?? '' });
  const [text, setText] = useState(routeQ ?? '');
  const input = useRef<HTMLInputElement>(null);

  // keep URL and filters in sync (so search from the top bar lands here)
  useEffect(() => {
    setF((x) => ({ ...x, q: routeQ ?? '' }));
    setText(routeQ ?? '');
  }, [routeQ]);

  // live search with a short debounce
  useEffect(() => {
    const t = setTimeout(() => setF((x) => (x.q === text ? x : { ...x, q: text })), 160);
    return () => clearTimeout(t);
  }, [text]);

  const results = useMemo(() => filterGoals(state, visible, f, me), [state, visible, f, me]);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((x) => ({ ...x, [k]: v }));
  const searchFor = (q: string) => {
    setText(q);
    go({ name: 'discover', q });
  };
  const related = f.q ? expandQuery(f.q).slice(2, 6) : [];
  const activeFilterCount = [f.category, f.location !== 'Anywhere', f.funding, f.sponsor, f.network, f.status !== 'active'].filter(Boolean).length;

  return (
    <div className="animate-fade">
      <section className="horizon-soft">
        <div className="mx-auto max-w-[1440px] px-4 pt-10 pb-8 md:px-8 md:pt-14">
          <p className="eyebrow">Discover</p>
          <h1 className="display mt-2 text-[40px] font-semibold sm:text-[56px]">What people around you want to do.</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              go({ name: 'discover', q: text.trim() || undefined });
            }}
            className="mt-7 max-w-2xl"
            role="search"
          >
            <label className="flex h-16 items-center gap-3 rounded-full bg-white px-6 shadow-[var(--shadow-lift)] ring-1 ring-[var(--color-line)] transition focus-within:ring-2 focus-within:ring-[var(--color-ocean)]">
              <Icon name="search" size={22} className="text-[var(--color-ocean)]" />
              <input
                ref={input}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Try surfing, pottery, Japan, DJ…"
                className="w-full bg-transparent text-[18px] font-medium outline-none placeholder:text-[var(--color-ink-4)]"
                aria-label="Search goals"
                data-search-input
              />
              {text && (
                <button
                  type="button"
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-mist)] text-[var(--color-ink-3)]"
                  onClick={() => {
                    setText('');
                    go({ name: 'discover' });
                    input.current?.focus();
                  }}
                  aria-label="Clear search"
                >
                  <Icon name="x" size={15} />
                </button>
              )}
            </label>
          </form>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[13px]">
            <span className="text-[var(--color-ink-3)]">{f.q ? 'Also matching' : 'Popular right now'}</span>
            {(f.q ? related : SUGGESTED_SEARCHES).map((s) => (
              <button key={s} className="chip !h-8 !text-[13px]" onClick={() => searchFor(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Filters ---------------- */}
      <div className="sticky top-[68px] z-30 border-b border-[var(--color-line)]/70 bg-[var(--color-cloud)]/90 backdrop-blur-xl">
        <div className="mx-auto max-w-[1440px] space-y-2.5 px-4 py-3 md:px-8">
          <div className="scroll-row !gap-2">
            <button className="chip" data-on={!f.category} onClick={() => set('category', null)}>
              All
            </button>
            {CATEGORIES.map((c) => (
              <button key={c.name} className="chip" data-on={f.category === c.name} onClick={() => set('category', f.category === c.name ? null : c.name)}>
                <span aria-hidden="true">{c.emoji}</span> {c.name}
              </button>
            ))}
          </div>
          <div className="scroll-row !gap-2 items-center">
            <label className="chip !pr-2">
              <Icon name="pin" size={15} className="text-[var(--color-ocean)]" />
              <select
                value={f.location}
                onChange={(e) => set('location', e.target.value as LocationFilter)}
                className="bg-transparent pr-1 font-semibold text-[var(--color-night)] outline-none"
                aria-label="Location"
              >
                {LOCATION_FILTERS.map((l) => (
                  <option key={l} value={l}>
                    {l === 'Near me' ? 'Within 5 km' : l}
                  </option>
                ))}
              </select>
            </label>
            <button className="chip chip-ocean" data-on={f.funding} onClick={() => set('funding', !f.funding)}>
              <Icon name="coin" size={15} /> Funding open
            </button>
            <button className="chip chip-ocean" data-on={f.sponsor} onClick={() => set('sponsor', !f.sponsor)}>
              <Icon name="store" size={15} /> Needs a sponsor
            </button>
            {me.kind === 'person' && (
              <button className="chip chip-ocean" data-on={f.network} onClick={() => set('network', !f.network)}>
                <Icon name="users" size={15} /> My network
              </button>
            )}
            <button className="chip chip-ocean" data-on={f.status === 'done'} onClick={() => set('status', f.status === 'done' ? 'active' : 'done')}>
              <Icon name="check" size={15} /> Done
            </button>
            <span className="mx-1 h-6 w-px shrink-0 bg-[var(--color-line)]" />
            <div className="flex shrink-0 rounded-full bg-[var(--color-mist)] p-1">
              {(['near', 'popular', 'recent'] as SortKey[]).map((s) => (
                <button
                  key={s}
                  onClick={() => set('sort', s)}
                  className={`h-7 rounded-full px-3 text-[13px] font-semibold transition ${f.sort === s ? 'bg-white shadow-[var(--shadow-soft)]' : 'text-[var(--color-ink-3)]'}`}
                >
                  {s === 'near' ? 'Nearest' : s === 'popular' ? 'Popular' : 'New'}
                </button>
              ))}
            </div>
            {activeFilterCount > 0 && (
              <button
                className="btn btn-ghost btn-sm shrink-0 !text-[13px]"
                onClick={() => setF({ ...DEFAULT_FILTERS, q: f.q, sort: f.sort })}
              >
                Clear filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ---------------- Results ---------------- */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 md:px-8">
        <p className="mb-5 text-[15px] text-[var(--color-ink-3)]" aria-live="polite">
          {f.q ? (
            <>
              <b className="font-semibold text-[var(--color-night)]">{results.length}</b> {results.length === 1 ? 'goal' : 'goals'} for “{f.q}”
            </>
          ) : (
            <>
              <b className="font-semibold text-[var(--color-night)]">{results.length}</b> goals {f.location === 'Anywhere' ? 'across Vancouver' : f.location === 'Near me' ? `within 5 km of ${me.hood}` : `in ${f.location}`}
            </>
          )}
        </p>
        {results.length ? (
          <div className="masonry">
            {results.map((g, i) => (
              <div key={g.id} className="animate-rise" style={{ animationDelay: `${Math.min(i, 10) * 35}ms` }}>
                <GoalCard goal={g} />
              </div>
            ))}
          </div>
        ) : (
          <Empty
            title={f.q ? `Nobody's said “${f.q}” yet.` : 'Nothing here — yet.'}
            body={f.q ? "Which means it could be yours. Put it on your list and someone nearby might help you make it happen." : 'Try widening the area or clearing a filter.'}
            action={
              me.kind === 'person' && f.q ? (
                <AddFromSearch q={f.q} />
              ) : (
                <button className="btn btn-quiet" onClick={() => setF({ ...DEFAULT_FILTERS })}>
                  Clear everything
                </button>
              )
            }
          />
        )}
      </div>
    </div>
  );
}

function AddFromSearch({ q }: { q: string }) {
  const { open } = useUI();
  return (
    <button className="btn btn-help" onClick={() => open({ type: 'composer', title: q.charAt(0).toUpperCase() + q.slice(1) })}>
      <Icon name="plus" size={18} /> Add “{q}” to my list
    </button>
  );
}
