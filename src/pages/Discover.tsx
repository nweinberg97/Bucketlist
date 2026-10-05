import { useEffect, useMemo, useRef, useState } from 'react';
import { useStore, useVisibleGoals } from '../store/store';
import { useUI } from '../store/ui';
import { Empty } from '../components/ui';
import { Icon } from '../components/Icon';
import { PersonRow, WAYS, groupByPerson, matchesWay, type Way } from '../components/Feed';
import { CATEGORIES, LOCATION_FILTERS, type LocationFilter } from '../lib/util';
import { DEFAULT_FILTERS, SUGGESTED_SEARCHES, expandQuery, filterGoals } from '../lib/search';

/**
 * Search is secondary to the feed: here when you know what you're looking for.
 * Results stay grouped by person, so you still see who wants to do it.
 */
export function Discover({ q: routeQ }: { q?: string }) {
  const { state, me } = useStore();
  const { go, open } = useUI();
  const visible = useVisibleGoals();
  const [text, setText] = useState(routeQ ?? '');
  const [q, setQ] = useState(routeQ ?? '');
  const [category, setCategory] = useState<string | null>(null);
  const [where, setWhere] = useState<LocationFilter>('Anywhere');
  const [way, setWay] = useState<Way>('all');
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setText(routeQ ?? '');
    setQ(routeQ ?? '');
  }, [routeQ]);
  useEffect(() => {
    const t = setTimeout(() => setQ(text), 160);
    return () => clearTimeout(t);
  }, [text]);
  useEffect(() => {
    if (!routeQ) input.current?.focus();
  }, [routeQ]);

  const results = useMemo(
    () => filterGoals(state, visible, { ...DEFAULT_FILTERS, q, category, location: where, sort: 'near' }, me).filter((g) => matchesWay(g, way)),
    [state, visible, q, category, where, way, me],
  );
  const rows = useMemo(() => groupByPerson(state, results, me, !!q), [state, results, me, q]);
  const related = q ? expandQuery(q).slice(2, 6) : [];
  const searchFor = (s: string) => {
    setText(s);
    go({ name: 'discover', q: s });
  };

  return (
    <div className="mx-auto max-w-[920px] animate-fade px-4 py-10 md:px-8 md:py-14">
      <p className="eyebrow">Search</p>
      <h1 className="display mt-2 text-[38px] font-semibold sm:text-[48px]">Find something to help with.</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          go({ name: 'discover', q: text.trim() || undefined });
        }}
        className="mt-6"
        role="search"
      >
        <label className="flex h-14 items-center gap-3 rounded-full bg-white px-5 shadow-[var(--shadow-soft)] ring-1 ring-[var(--color-line)] transition focus-within:ring-2 focus-within:ring-[var(--color-ocean)]">
          <Icon name="search" size={20} className="text-[var(--color-ocean)]" />
          <input ref={input} value={text} onChange={(e) => setText(e.target.value)} placeholder="surfing, pottery, Japan, DJ…" className="w-full bg-transparent text-[17px] font-medium outline-none placeholder:text-[var(--color-ink-4)]" aria-label="Search goals" data-search-input />
          {text && (
            <button type="button" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-mist)] text-[var(--color-ink-3)]" onClick={() => searchFor('')} aria-label="Clear search">
              <Icon name="x" size={15} />
            </button>
          )}
        </label>
      </form>
      <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[13px]">
        <span className="mr-1 text-[var(--color-ink-3)]">{q ? 'Also matching' : 'Try'}</span>
        {(q ? related : SUGGESTED_SEARCHES).map((s) => (
          <button key={s} className="chip !h-8 !text-[13px]" onClick={() => searchFor(s)}>
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 space-y-2">
        <div className="scroll-row !gap-1.5">
          {WAYS.map((w) => (
            <button key={w.id} className="chip !h-8 !text-[13px]" data-on={way === w.id} onClick={() => setWay(w.id)}>
              <Icon name={w.icon} size={14} /> {w.name}
            </button>
          ))}
          <span className="mx-1 h-6 w-px shrink-0 self-center bg-[var(--color-line)]" />
          <label className="chip !h-8 !pr-2 !text-[13px]">
            <Icon name="pin" size={14} className="text-[var(--color-ocean)]" />
            <select value={where} onChange={(e) => setWhere(e.target.value as LocationFilter)} className="bg-transparent pr-1 font-semibold outline-none" aria-label="Where">
              {LOCATION_FILTERS.map((l) => (
                <option key={l} value={l}>
                  {l === 'Near me' ? 'Within 5 km' : l}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="scroll-row !gap-1.5">
          {CATEGORIES.map((c) => (
            <button key={c.name} className="chip !h-8 !text-[13px]" data-on={category === c.name} onClick={() => setCategory(category === c.name ? null : c.name)}>
              {c.emoji} {c.name}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-8 mb-3 text-[14px] text-[var(--color-ink-3)]" aria-live="polite">
        <b className="text-[var(--color-night)]">{results.length}</b> {results.length === 1 ? 'goal' : 'goals'}
        {q ? ` for “${q}”` : ''} on <b className="text-[var(--color-night)]">{rows.length}</b> {rows.length === 1 ? 'list' : 'lists'}
      </p>
      {rows.length ? (
        <div className="space-y-3">
          {rows.map((r) => (
            <PersonRow key={r.person.id} person={r.person} goals={r.goals} />
          ))}
        </div>
      ) : (
        <Empty
          title={q ? `Nobody's said “${q}” yet.` : 'Nothing matches.'}
          body={q ? 'Which means it could be yours. Put it on your list and someone nearby might help you make it happen.' : 'Try a wider area or another way to help.'}
          action={
            q && me.kind === 'person' ? (
              <button className="btn btn-help" onClick={() => open({ type: 'composer', title: q.charAt(0).toUpperCase() + q.slice(1) })}>
                <Icon name="plus" size={18} /> Add “{q}” to my list
              </button>
            ) : undefined
          }
        />
      )}
    </div>
  );
}
