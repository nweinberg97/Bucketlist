import { useMemo, useState } from 'react';
import { useStore } from '../store/store';
import { useUI } from '../store/ui';
import { Avatar, Modal, ModalClose } from '../components/ui';
import { GoalImage } from '../components/GoalCard';
import { Icon } from '../components/Icon';
import { matchReason } from '../lib/search';

// lower-case the first letter unless it starts a proper noun / acronym ("Japan", "DJ")
const lowerFirst = (s: string) => (/^(I\b|[A-Z]{2}|Japan|Vancouver|Tofino)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

const SKILL_LINES: Record<string, string> = {
  'You surf': "I've been surfing for a few years and would be happy to help you get started if you're interested.",
  'You hike': "I've done a lot of hiking around here and would be glad to share what I know — or come along.",
  'You backpack': "I've done a fair bit of backpacking and would be glad to go through gear and routes with you.",
  'You shoot photos': "I shoot a lot and would be happy to help with photos — or just lend a lens.",
  'You know cameras': "I know my way around cameras and would be happy to help.",
  'You paddleboard': "I paddle most mornings and would be happy to show you the basics.",
  'You design': "I'm a designer and would be glad to help with layout or anything visual.",
  'You know the water': "I spend a lot of time on the water and would be happy to help you get started.",
};

const QUICK = [
  { label: "I've done this", line: "I've done this myself and I'm happy to share what I learned." },
  { label: 'I can lend gear', line: 'I have some gear you could borrow.' },
  { label: "I'll come along", line: "If you want company the first time, I'm in." },
  { label: 'I know a place', line: 'I know a good spot for this — happy to point you there.' },
];

export function HelpModal({ goalId, mode: initialMode = 'self', friendId }: { goalId: string; mode?: 'self' | 'someone'; friendId?: string }) {
  const { state, me, dispatch } = useStore();
  const { close, open } = useUI();
  const goal = state.goals[goalId];
  const owner = state.people[goal.ownerId];
  const [mode, setMode] = useState<'self' | 'someone'>(initialMode);
  const friends = me.network.map((id) => state.people[id]).filter((p) => p && p.id !== owner.id);
  const [friend, setFriend] = useState(friendId ?? friends.find((f) => matchReason(f, goal))?.id ?? friends[0]?.id);
  const friendP = friend ? state.people[friend] : undefined;

  const template = useMemo(() => {
    if (mode === 'someone' && friendP) {
      return `Hey ${owner.first}, I saw your goal to ${lowerFirst(goal.title)}. My friend ${friendP.first} (${friendP.tagline.toLowerCase()}) would be a great person to talk to — want me to introduce you two?`;
    }
    const r = matchReason(me, goal);
    const line = (r && SKILL_LINES[r]) || 'I think I might be able to help — happy to chat if you want a hand.';
    return `Hey ${owner.first}, I saw your goal to ${lowerFirst(goal.title)}. ${line}`;
  }, [mode, friendP, owner.first, goal, me]);

  const [message, setMessage] = useState(template);
  const [touched, setTouched] = useState(false);
  const [sent, setSent] = useState(false);
  const shown = touched ? message : template;

  const send = () => {
    dispatch({ type: 'help', goalId, message: shown, mode, introduced: friendP?.name });
    setSent(true);
  };

  return (
    <Modal onClose={close} label="Offer to help">
      <ModalClose onClose={close} />
      {sent ? (
        <div className="px-7 pt-12 pb-8 text-center sm:px-10" data-help-sent>
          <span className="mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full bg-[var(--color-ocean)] text-white shadow-[0_12px_30px_-10px_rgb(11_92_255/0.8)]">
            <Icon name="check" size={30} strokeWidth={2.6} />
          </span>
          <h2 className="display mt-6 text-[34px] font-semibold">{mode === 'someone' ? 'Introduction offered' : 'Introduction sent'}</h2>
          <p className="mx-auto mt-2 max-w-sm text-[16px] text-[var(--color-ink-3)]">
            {owner.first} has been notified that you offered to help. When they reply, you'll pick it up in messages.
          </p>
          <div className="mx-auto mt-6 max-w-sm rounded-2xl bg-white p-4 text-left text-[14px] ring-1 ring-[var(--color-line)]">
            <p className="eyebrow !text-[10px]">You said</p>
            <p className="quote mt-1 text-[18px] leading-snug text-[var(--color-ink-2)]">“{shown}”</p>
          </div>
          <div className="mt-7 flex flex-col justify-center gap-2 sm:flex-row">
            <button className="btn btn-help" onClick={close} data-autofocus>
              Done
            </button>
            {goal.privacy === 'public' && (
              <button className="btn btn-promote" onClick={() => open({ type: 'promote', goalId })}>
                <Icon name="megaphone" size={17} /> Also share it
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-4 border-b border-[var(--color-line)] p-6 pr-16 sm:p-7 sm:pr-16">
            <GoalImage goal={goal} className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl" />
            <div className="min-w-0">
              <p className="text-[14px] text-[var(--color-ink-3)]">You might be able to help {owner.first} make this happen.</p>
              <h2 className="display mt-1 text-[26px] font-semibold">
                {goal.emoji} {goal.title}
              </h2>
              <p className="quote mt-1 line-clamp-2 text-[17px] text-[var(--color-ink-2)]">“{goal.story}”</p>
            </div>
          </div>

          <div className="space-y-5 p-6 sm:p-7">
            <div className="grid grid-cols-2 gap-1 rounded-2xl bg-[var(--color-mist)] p-1">
              {(['self', 'someone'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => {
                    setMode(m);
                    setTouched(false);
                  }}
                  className={`h-10 rounded-xl text-[14px] font-semibold transition ${mode === m ? 'bg-white shadow-[var(--shadow-soft)]' : 'text-[var(--color-ink-3)]'}`}
                >
                  {m === 'self' ? 'I can help' : 'I know someone'}
                </button>
              ))}
            </div>

            {mode === 'someone' && (
              <div>
                <p className="mb-2 text-[13px] font-semibold">Who would you introduce?</p>
                <div className="scroll-row !gap-2">
                  {friends.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => {
                        setFriend(f.id);
                        setTouched(false);
                      }}
                      className={`flex shrink-0 items-center gap-2 rounded-full py-1 pr-3.5 pl-1 text-[13px] font-semibold ring-1 transition ${friend === f.id ? 'bg-[var(--color-night)] text-white ring-transparent' : 'bg-white ring-[var(--color-line)]'}`}
                    >
                      <Avatar person={f} size={26} />
                      {f.first}
                      {matchReason(f, goal) && <span className={`h-1.5 w-1.5 rounded-full ${friend === f.id ? 'bg-[var(--color-sun)]' : 'bg-[var(--color-ocean)]'}`} title="Good match" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'self' && (
              <div className="flex flex-wrap gap-2">
                {QUICK.map((q) => (
                  <button
                    key={q.label}
                    className="chip !h-8 !text-[13px]"
                    onClick={() => {
                      setMessage((shown.trim() + ' ' + q.line).trim());
                      setTouched(true);
                    }}
                  >
                    <Icon name="plus" size={13} /> {q.label}
                  </button>
                ))}
              </div>
            )}

            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
                <Avatar person={me} size={22} /> Your message to {owner.first}
              </span>
              <textarea
                className="field min-h-[132px] text-[16px] leading-relaxed"
                value={shown}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setTouched(true);
                }}
                data-autofocus
                data-help-message
              />
            </label>

            <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12.5px] text-[var(--color-ink-4)]">{owner.first} sees your name, neighbourhood and verified profile.</p>
              <button className="btn btn-help btn-lg" onClick={send} disabled={!shown.trim()} data-send-intro>
                Send introduction <Icon name="arrowRight" size={18} />
              </button>
            </div>
          </div>
        </>
      )}
    </Modal>
  );
}
