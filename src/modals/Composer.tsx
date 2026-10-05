import { useMemo, useRef, useState } from 'react';
import type { Category, Goal, Privacy, Status } from '../types';
import { useStore } from '../store/store';
import { useUI } from '../store/ui';
import { Modal, ModalClose, PrivacyPicker } from '../components/ui';
import { GoalArt, sceneFor } from '../components/GoalArt';
import { Icon } from '../components/Icon';
import { CATEGORIES, HOODS, hash, uid } from '../lib/util';
import { potentialHelpers } from '../lib/search';

const GUESS: [RegExp, Category, string][] = [
  [/surf|hike|climb|camp|ski|skydiv|paddle|kayak|trail|summit|dive/i, 'Adventure', '🧭'],
  [/run|marathon|lift|yoga|swim|league|gym|triathlon|cycle|volleyball/i, 'Fitness', '🏃'],
  [/cook|pasta|bake|sushi|restaurant|eat|food|dinner|wine|coffee/i, 'Food', '🍝'],
  [/paint|mural|guitar|music|sing|write|film|photo|draw|dj|dance|pottery|ep\b|book|zine|podcast|art/i, 'Creativity', '🎨'],
  [/learn|language|spanish|french|japanese|class|course|read|study/i, 'Learning', '📚'],
  [/visit|travel|trip|japan|europe|northern lights|aurora|backpack|fly to|see the/i, 'Travel', '✈️'],
  [/career|business|job|start a|launch|ship|build my|promotion/i, 'Career', '🛠️'],
  [/garden|volunteer|neighbo|community|charity|host|organize/i, 'Community', '🌱'],
  [/family|friend|mom|dad|grand|partner|call|reconnect/i, 'Relationships', '💛'],
];

const EMOJI_HINTS: [RegExp, string][] = [
  [/surf/i, '🏄'], [/paddle|sup\b|canoe|kayak/i, '🛶'], [/hike|trail/i, '🥾'], [/run|marathon/i, '🏃'], [/japan/i, '🗾'], [/guitar/i, '🎸'],
  [/paint|mural/i, '🎨'], [/pottery|clay|ceramic/i, '🏺'], [/pasta|italian/i, '🍝'], [/sushi/i, '🍣'], [/dj|turntable/i, '🎛️'], [/film|movie/i, '🎬'],
  [/photo|camera|zine/i, '📷'], [/aurora|northern lights/i, '🌌'], [/sky ?div|parachut/i, '🪂'], [/garden/i, '🌱'], [/spanish|french|language/i, '🗣️'],
  [/swim/i, '🏊'], [/volleyball/i, '🏐'], [/podcast/i, '🎙️'], [/book|write/i, '📚'], [/climb|mountain/i, '🏔️'], [/europe|travel|trip/i, '✈️'], [/stand-?up|comedy/i, '🎤'],
];

function guess(title: string): { category: Category; emoji: string } | null {
  for (const [re, category, emoji] of GUESS) if (re.test(title)) return { category, emoji: EMOJI_HINTS.find(([r]) => r.test(title))?.[1] ?? emoji };
  return null;
}

async function downscale(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = rej;
      img.src = url;
    });
    const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function Composer({ goalId, title: initialTitle }: { goalId?: string; title?: string }) {
  const { state, me, dispatch } = useStore();
  const { close, go, toast, open } = useUI();
  const existing = goalId ? state.goals[goalId] : undefined;
  const editing = !!existing;

  const [title, setTitle] = useState(existing?.title ?? initialTitle ?? '');
  const [category, setCategory] = useState<Category | null>(existing?.category ?? (initialTitle ? guess(initialTitle)?.category ?? null : null));
  const [catTouched, setCatTouched] = useState(editing);
  const [privacy, setPrivacy] = useState<Privacy>(existing?.privacy ?? 'public');
  const [status, setStatus] = useState<Status>(existing?.status ?? 'want');
  const [story, setStory] = useState(existing?.story ?? '');
  const [hood, setHood] = useState(existing?.hood ?? me.hood);
  const [target, setTarget] = useState(existing?.targetDate ?? '');
  const [needs, setNeeds] = useState(existing?.needs.join('\n') ?? '');
  const [image, setImage] = useState<string | undefined>(existing?.image);
  const [funding, setFunding] = useState(!!existing?.funding?.enabled);
  const [fundTarget, setFundTarget] = useState(String(existing?.funding?.target ?? 500));
  const [sponsor, setSponsor] = useState(!!existing?.sponsorship?.open);
  const [sponsorNeed, setSponsorNeed] = useState(existing?.sponsorship?.need ?? '');
  const [more, setMore] = useState(editing);
  const [created, setCreated] = useState<Goal | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const g = guess(title);
  const cat: Category = (catTouched ? category : g?.category ?? category) ?? 'Just for fun';
  const emoji = existing && existing.title === title ? existing.emoji : g?.emoji ?? CATEGORIES.find((c) => c.name === cat)!.emoji;
  const seed = useMemo(() => (existing ? existing.scene.seed : (hash(title || 'new') % 900) + 7), [existing, title]);
  const scene = existing && existing.title === title && existing.category === cat ? existing.scene : sceneFor(title, cat, seed);

  const save = () => {
    const t = title.trim();
    if (!t) return;
    const ft = Math.max(50, Number(fundTarget) || 500);
    const base: Partial<Goal> = {
      title: t.charAt(0).toUpperCase() + t.slice(1),
      emoji,
      category: cat,
      privacy,
      status,
      story: story.trim() || `${t.charAt(0).toUpperCase() + t.slice(1)}. It's been on my mind for a while — this is me saying it out loud.`,
      hood,
      targetDate: target || undefined,
      needs: needs.split('\n').map((n) => n.trim()).filter(Boolean),
      image,
      scene,
      tags: t.toLowerCase().split(/\s+/).filter((w) => w.length > 2),
      funding: funding && privacy !== 'private' ? { enabled: true, target: ft, raised: existing?.funding?.raised ?? 0, baseBackers: existing?.funding?.baseBackers ?? 0, backers: existing?.funding?.backers ?? [] } : existing?.funding ? { ...existing.funding, enabled: false } : undefined,
      sponsorship: sponsor && privacy !== 'private' ? { open: true, need: sponsorNeed.trim() || 'Anything that helps make it happen.' } : existing?.sponsorship ? { ...existing.sponsorship, open: false } : undefined,
    };
    if (existing) {
      // Keep tags from seed data — they power matching
      const { status: nextStatus, ...rest } = base;
      dispatch({ type: 'goal/update', id: existing.id, patch: { ...rest, tags: Array.from(new Set([...existing.tags, ...(base.tags ?? [])])) } });
      if (nextStatus && nextStatus !== existing.status) dispatch({ type: 'goal/status', id: existing.id, status: nextStatus });
      if (nextStatus === 'done' && existing.status !== 'done') open({ type: 'celebrate', goalId: existing.id });
      else {
        toast('Saved');
        close();
      }
    } else {
      const goal: Goal = {
        id: uid('g'),
        ownerId: me.id,
        city: 'Vancouver',
        createdAt: Date.now(),
        baseHelpers: 0,
        shares: 0,
        ...(base as Omit<Goal, 'id' | 'ownerId' | 'city' | 'createdAt' | 'baseHelpers' | 'shares'>),
      };
      dispatch({ type: 'goal/add', goal });
      setCreated(goal);
    }
  };

  if (created) {
    const helpers = potentialHelpers(state, created, me.id);
    const first = Object.values(state.goals).filter((x) => x.ownerId === me.id).length <= 1;
    return (
      <Modal onClose={close} label="Goal added" size="sm">
        <div className="relative overflow-hidden">
          <ModalClose onClose={close} light />
          <div className="horizon relative h-56 overflow-hidden">
            <svg viewBox="0 0 60 80" className="absolute left-1/2 h-24 w-20 -translate-x-1/2 animate-[rise_1.4s_cubic-bezier(.2,.8,.2,1)_both]" style={{ top: 34 }} aria-hidden="true">
              <path d="M30 4C44 4 50 18 46 30 43 38 36 46 34 52H26C24 46 17 38 14 30 10 18 16 4 30 4Z" fill="#ffc83d" />
              <path d="M30 4C36 4 38 18 36 30 35 38 32 46 31.5 52H28.5C28 46 25 38 24 30 22 18 24 4 30 4Z" fill="#ff8066" />
              <path d="M26 52 27 57M34 52 33 57" stroke="#111318" strokeWidth="1" /><path d="M24.5 60.5C24.5 55 35.5 55 35.5 60.5" stroke="#111318" strokeWidth="1.2" fill="none" />
              <path d="M23.5 60.5H36.5L35 69H25Z" fill="#111318" /><rect x="23" y="59.5" width="14" height="2.4" rx="1.1" fill="#3c4049" /><path d="M25 64.5H35" stroke="#ffc83d" strokeWidth="1.1" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 h-16" style={{ background: 'linear-gradient(transparent, rgb(255 253 248))' }} />
          </div>
          <div className="px-7 pb-8 text-center" data-goal-created>
            <p className="eyebrow">{first ? 'Your first goal' : 'On your list'}</p>
            <h2 className="display mt-2 text-[32px] font-semibold leading-tight">
              {created.emoji} {created.title}
            </h2>
            <p className="mt-2 text-[15px] text-[var(--color-ink-3)]">
              {created.privacy === 'private'
                ? 'Just for you, for now. You can share it whenever you’re ready.'
                : helpers.length
                  ? `${helpers.length} ${helpers.length === 1 ? 'person' : 'people'} on Bucketlist might be able to help — they'll see it ${created.privacy === 'network' ? 'if they’re in your network' : 'in Discover'}.`
                  : `It's ${created.privacy === 'public' ? 'out there' : 'visible to your network'}. Someone nearby might be able to help.`}
            </p>
            <div className="mt-7 flex flex-col gap-2">
              <button
                className="btn btn-help"
                onClick={() => {
                  close();
                  go({ name: 'goal', id: created.id });
                }}
                data-autofocus
              >
                See your goal
              </button>
              <button
                className="btn btn-quiet"
                onClick={() => {
                  close();
                  go({ name: 'list' });
                }}
              >
                Back to my bucketlist
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal onClose={close} label={editing ? 'Edit goal' : 'Add a goal'}>
      <ModalClose onClose={close} light />
      {/* live artwork preview */}
      <div className="relative h-36 overflow-hidden sm:h-44">
        {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <GoalArt scene={scene} className="h-full w-full" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[rgb(6_14_36/0.55)] to-transparent" />
        <div className="absolute bottom-4 left-6 flex items-center gap-2">
          <span className="pill bg-white/90 text-[var(--color-night)]">
            {emoji} {cat}
          </span>
          <button className="pill bg-black/30 text-white backdrop-blur hover:bg-black/45" onClick={() => fileRef.current?.click()}>
            <Icon name="image" size={13} /> {image ? 'Change photo' : 'Add a photo'}
          </button>
          {image && (
            <button className="pill bg-black/30 text-white backdrop-blur" onClick={() => setImage(undefined)}>
              Remove
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (f) {
                try {
                  setImage(await downscale(f));
                } catch {
                  toast("Couldn't read that image");
                }
              }
            }}
          />
        </div>
      </div>

      <form
        className="space-y-6 p-6 sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          save();
        }}
      >
        <label className="block">
          <span className="quote text-[22px] text-[var(--color-ink-3)]">{editing ? 'Your goal' : 'I want to…'}</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="learn to surf"
            className="display mt-1 w-full border-b-2 border-[var(--color-line)] bg-transparent pb-2 text-[32px] font-semibold outline-none transition placeholder:text-[var(--color-ink-4)] focus:border-[var(--color-ocean)]"
            maxLength={80}
            data-autofocus
            data-goal-title
          />
        </label>

        <div>
          <p className="mb-2 text-[13px] font-semibold">What kind of thing is it?</p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                type="button"
                key={c.name}
                className="chip !h-8 !text-[13px]"
                data-on={cat === c.name}
                onClick={() => {
                  setCategory(c.name);
                  setCatTouched(true);
                }}
              >
                {c.emoji} {c.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-[13px] font-semibold">Who can see it?</p>
          <PrivacyPicker value={privacy} onChange={setPrivacy} />
        </div>

        {!more ? (
          <button type="button" className="flex items-center gap-1.5 text-[14px] font-semibold text-[var(--color-ocean)]" onClick={() => setMore(true)}>
            <Icon name="plus" size={15} /> Add the story, a date, or ways people can help
          </button>
        ) : (
          <div className="animate-rise space-y-5">
            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold">Why does it matter to you?</span>
              <textarea className="field quote min-h-[90px] !text-[19px] leading-snug" placeholder="I've lived near the ocean for three years and still haven't…" value={story} onChange={(e) => setStory(e.target.value)} />
            </label>

            <div className="grid gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold">Where</span>
                <select className="field !py-2.5" value={hood} onChange={(e) => setHood(e.target.value)}>
                  {Object.keys(HOODS).map((h) => (
                    <option key={h}>{h}</option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold">By when (optional)</span>
                <input type="month" className="field !py-2" value={target} onChange={(e) => setTarget(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-2 block text-[13px] font-semibold">Where it's at</span>
                <select className="field !py-2.5" value={status} onChange={(e) => setStatus(e.target.value as Status)}>
                  <option value="want">Want to do</option>
                  <option value="progress">In progress</option>
                  <option value="done">Done</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-[13px] font-semibold">What would help? <span className="font-normal text-[var(--color-ink-4)]">One per line</span></span>
              <textarea className="field min-h-[70px] text-[15px]" placeholder={'Someone to go with the first time\nA board to borrow'} value={needs} onChange={(e) => setNeeds(e.target.value)} />
            </label>

            {privacy !== 'private' && (
              <div className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-[var(--color-line)]">
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" className="h-5 w-5 accent-[var(--color-ocean)]" checked={funding} onChange={(e) => setFunding(e.target.checked)} />
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold">Accept funding</span>
                    <span className="block text-[12.5px] text-[var(--color-ink-3)]">For goals that need resources — gear, travel, materials.</span>
                  </span>
                </label>
                {funding && (
                  <label className="relative ml-8 block animate-rise">
                    <span className="absolute top-1/2 left-4 -translate-y-1/2 text-[var(--color-ink-3)]">$</span>
                    <input className="field !py-2 !pl-8" inputMode="numeric" value={fundTarget} onChange={(e) => setFundTarget(e.target.value.replace(/[^0-9]/g, ''))} aria-label="Funding target" />
                  </label>
                )}
                <label className="flex cursor-pointer items-center gap-3">
                  <input type="checkbox" className="h-5 w-5 accent-[var(--color-ocean)]" checked={sponsor} onChange={(e) => setSponsor(e.target.checked)} />
                  <span className="flex-1">
                    <span className="block text-[15px] font-semibold">Open to sponsors</span>
                    <span className="block text-[12.5px] text-[var(--color-ink-3)]">Local businesses can offer gear, space or services.</span>
                  </span>
                </label>
                {sponsor && <input className="field ml-8 !w-[calc(100%-2rem)] animate-rise !py-2" placeholder="What's standing in the way?" value={sponsorNeed} onChange={(e) => setSponsorNeed(e.target.value)} />}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button type="button" className="btn btn-ghost" onClick={close}>
            Cancel
          </button>
          <button type="submit" className="btn btn-help btn-lg" disabled={!title.trim()} data-save-goal>
            {editing ? 'Save changes' : 'Add to my bucketlist'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
