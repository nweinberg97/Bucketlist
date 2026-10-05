import { useRef, useState } from 'react';
import { useStore } from '../store/store';
import { useUI } from '../store/ui';
import { Avatar, Modal, ModalClose } from '../components/ui';
import { Icon } from '../components/Icon';
import { PERSONAS } from '../data/people';
import { ShareCardSvg, canDownload, svgToPng, triggerDownload, usePhotoData } from './ShareCard';

// lower-case the first letter unless it starts a proper noun / acronym ("Japan", "DJ")
const lowerFirst = (s: string) => (/^(I\b|[A-Z]{2}|Japan|Vancouver|Tofino)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

export function PromoteModal({ goalId }: { goalId: string }) {
  const { state, me, dispatch } = useStore();
  const { close, go, toast, open } = useUI();
  const goal = state.goals[goalId];
  const owner = state.people[goal.ownerId];
  const existing = state.promotions.find((p) => p.goalId === goalId && p.promoterId === me.id && p.status === 'pending');

  const need = goal.sponsorship?.open ? goal.sponsorship.need : goal.needs[0];
  const ask = goal.sponsorship?.open
    ? `If you know a business, building owner, or anyone who could help with ${lowerFirst(need ?? 'this').replace(/\.$/, '')} — connect them with ${owner.first}.`
    : goal.funding?.enabled
      ? `Every little bit gets ${owner.first} closer. Back it on Bucketlist.`
      : `If you can help, reach out to ${owner.first} on Bucketlist.`;
  const [caption, setCaption] = useState(`I'm really inspired by ${owner.first}'s goal to ${lowerFirst(goal.title)}. ${ask}`);
  const [sent, setSent] = useState(!!existing);
  const photo = usePhotoData(goal);

  const switchToOwner = () => {
    dispatch({ type: 'persona', id: owner.id });
    go({ name: 'activity' });
    toast(`Now viewing as ${owner.first}`);
    open({ type: 'request', kind: 'promote', goalId });
  };

  if (sent) {
    return (
      <Modal onClose={close} label="Waiting for approval" size="sm">
        <ModalClose onClose={close} />
        <div className="px-7 pt-12 pb-8 text-center" data-promote-sent>
          <span className="mx-auto flex h-16 w-16 animate-pop items-center justify-center rounded-full text-[var(--color-night)]" style={{ background: 'linear-gradient(160deg,#55b8ff,#ffc83d)' }}>
            <Icon name="megaphone" size={28} />
          </span>
          <h2 className="display mt-6 text-[30px] font-semibold leading-tight">Waiting for {owner.first}'s OK</h2>
          <p className="mx-auto mt-2 max-w-xs text-[15px] text-[var(--color-ink-3)]">
            It's {owner.first}'s ambition, so Bucketlist always asks before a goal travels beyond the app. You'll get your share card the moment they approve.
          </p>
          <div className="mt-7 flex flex-col gap-2">
            {PERSONAS.includes(owner.id) && (
              <button className="btn btn-help" onClick={switchToOwner} data-switch-to-owner>
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
    <Modal onClose={close} label="Promote this goal" size="lg">
      <ModalClose onClose={close} />
      <div className="grid md:grid-cols-[1fr_300px]">
        <div className="p-6 sm:p-8">
          <p className="eyebrow">
            <span className="text-[var(--color-ocean)]">Promote</span> · step 1 of 2
          </p>
          <h2 className="display mt-2 text-[32px] font-semibold leading-tight">What would you say about {owner.first}'s goal?</h2>
          <p className="mt-2 text-[15px] text-[var(--color-ink-3)]">Your words go on a share card for Instagram, TikTok or anywhere else — once {owner.first} says it's OK.</p>

          <label className="mt-6 block">
            <span className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
              <Avatar person={me} size={22} /> Your caption
            </span>
            <textarea className="field quote min-h-[150px] !text-[20px] leading-snug" value={caption} maxLength={240} onChange={(e) => setCaption(e.target.value)} data-autofocus data-caption />
            <span className="mt-1 block text-right text-[12px] text-[var(--color-ink-4)]">{caption.length}/240</span>
          </label>

          <div className="mt-4 rounded-2xl bg-[var(--color-sky-wash)] p-4 text-[13.5px] text-[var(--color-ink-2)]">
            <p className="flex items-start gap-2">
              <Icon name="shield" size={17} className="mt-0.5 shrink-0 text-[var(--color-ocean)]" />
              <span>
                <b>Step 2:</b> {owner.first} reviews your caption and can approve, edit or decline it. Nothing is posted without their OK.
              </span>
            </p>
          </div>

          <button
            className="btn btn-help btn-lg mt-6 w-full"
            disabled={!caption.trim()}
            onClick={() => {
              dispatch({ type: 'promote/request', goalId, caption: caption.trim() });
              setSent(true);
            }}
            data-request-approval
          >
            Request approval <Icon name="arrowRight" size={18} />
          </button>
        </div>

        <div className="hidden border-l border-[var(--color-line)] bg-[var(--color-mist)]/60 p-6 md:block">
          <p className="eyebrow mb-3">Preview</p>
          <div className="overflow-hidden rounded-2xl shadow-[var(--shadow-lift)]">
            <ShareCardSvg goal={goal} owner={owner} promoter={me} caption={caption} photo={photo} />
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function ShareModal({ promotionId }: { promotionId: string }) {
  const { state, me } = useStore();
  const { close, toast } = useUI();
  const svg = useRef<SVGSVGElement>(null);
  const [png, setPng] = useState<string | null>(null);
  const p = state.promotions.find((x) => x.id === promotionId);
  const photo = usePhotoData(p ? state.goals[p.goalId] : undefined);
  if (!p) return null;
  const goal = state.goals[p.goalId];
  const owner = state.people[goal.ownerId];
  const promoter = state.people[p.promoterId];
  const iAmOwner = me.id === owner.id;
  const link = `https://bucketlist.app/${owner.first.toLowerCase()}/${goal.id}`;

  const copy = async (text: string, msg: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard can be blocked in iframes — the toast still confirms the intent */
    }
    toast(msg);
  };

  return (
    <Modal onClose={close} label="Share card" size="lg">
      <ModalClose onClose={close} />
      <div className="grid md:grid-cols-[1fr_340px]">
        <div className="horizon-soft flex items-center justify-center p-6 sm:p-10">
          <div className="relative w-full max-w-[400px] animate-pop overflow-hidden rounded-[22px] shadow-[var(--shadow-modal)]" data-share-card>
            <ShareCardSvg ref={svg} goal={goal} owner={owner} promoter={promoter} caption={p.caption} photo={photo} />
            {png && <img src={png} alt={`Share card for ${goal.title}`} className="absolute inset-0 h-full w-full" />}
          </div>
        </div>
        <div className="flex flex-col p-6 sm:p-8">
          <p className="eyebrow !text-[var(--color-sun-deep)]">Approved</p>
          <h2 className="display mt-2 text-[30px] font-semibold leading-tight">{iAmOwner ? `${promoter.first}'s post is ready to go.` : `${owner.first} said yes. Share it.`}</h2>
          <p className="mt-2 text-[15px] text-[var(--color-ink-3)]">
            {iAmOwner
              ? `${promoter.first} has been notified and can post it. Everyone who scans it lands on your goal — and on Bucketlist.`
              : `Everyone who scans this lands on ${owner.first}'s goal — and discovers what people near them want to do.`}
          </p>

          <div className="mt-6 space-y-2">
            <button
              className="btn btn-fund w-full"
              onClick={async () => {
                if (!svg.current) return;
                try {
                  const url = await svgToPng(svg.current);
                  if (canDownload()) {
                    triggerDownload(url, `bucketlist-${goal.id}.png`);
                    toast('Share card saved');
                  } else setPng(url);
                } catch {
                  toast("Couldn't render the image — try a screenshot");
                }
              }}
              data-download-card
            >
              <Icon name="download" size={17} /> Download image
            </button>
            {png && <p className="text-[12.5px] text-[var(--color-ink-3)]">Your image is on the left — right-click or long-press it to save.</p>}
            <button className="btn btn-quiet w-full" onClick={() => copy(`${p.caption}\n\n${link}`, 'Caption + link copied')}>
              <Icon name="link" size={17} /> Copy caption & link
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button className="btn btn-quiet btn-sm" onClick={() => toast('Opening Instagram… (simulated)')}>
                <Icon name="instagram" size={16} /> Instagram
              </button>
              <button className="btn btn-quiet btn-sm" onClick={() => toast('Opening TikTok… (simulated)')}>
                <Icon name="tiktok" size={16} /> TikTok
              </button>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <p className="eyebrow mb-2">How this grows</p>
            <ol className="space-y-1.5 text-[13px] text-[var(--color-ink-3)]">
              {['Someone sees the card', `They help ${owner.first} — or add their own goal`, 'Their goal becomes discoverable', 'Someone else helps them'].map((s, i) => (
                <li key={s} className="flex items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-sky-wash)] text-[11px] font-bold text-[var(--color-ocean)]">{i + 1}</span>
                  {s}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </Modal>
  );
}
