import { forwardRef, useEffect, useMemo, useState } from 'react';
import { photoUrl } from '../data/photos';
import { MarkPaths } from '../components/Mark';
import type { Goal, Person } from '../types';
import { ArtSvg } from '../components/GoalArt';
import { fundedPct, hash, money, rng } from '../lib/util';

/**
 * The share card is pure SVG (1080×1350, Instagram portrait) so it renders crisply
 * in the app AND exports to a PNG without any extra library.
 */

const CW = 1080;
const CH = 1350;
const ART_H = 760;

function wrap(text: string, max: number, maxLines: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > max) {
      lines.push(cur.trim());
      cur = w;
    } else cur += ' ' + w;
  }
  if (cur.trim()) lines.push(cur.trim());
  if (lines.length > maxLines) {
    const cut = lines.slice(0, maxLines);
    cut[maxLines - 1] = cut[maxLines - 1].replace(/[\s,.;:]*\S*$/, '') + '…';
    return cut;
  }
  return lines;
}

function QR({ seed, x, y, size }: { seed: number; x: number; y: number; size: number }) {
  const r = rng(seed);
  const n = 21;
  const c = size / n;
  const cells: [number, number][] = [];
  const finder = (i: number, j: number) => (i < 7 && j < 7) || (i < 7 && j >= n - 7) || (i >= n - 7 && j < 7);
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (!finder(i, j) && r() > 0.52) cells.push([i, j]);
  const F = ({ fx, fy }: { fx: number; fy: number }) => (
    <g>
      <rect x={x + fx * c} y={y + fy * c} width={7 * c} height={7 * c} rx={c * 1.4} fill="#111318" />
      <rect x={x + (fx + 1) * c} y={y + (fy + 1) * c} width={5 * c} height={5 * c} rx={c} fill="#fff" />
      <rect x={x + (fx + 2) * c} y={y + (fy + 2) * c} width={3 * c} height={3 * c} rx={c * 0.7} fill="#0b5cff" />
    </g>
  );
  return (
    <g>
      <rect x={x - 14} y={y - 14} width={size + 28} height={size + 28} rx={22} fill="#fff" />
      {cells.map(([i, j]) => (
        <rect key={`${i}-${j}`} x={x + j * c + 0.6} y={y + i * c + 0.6} width={c - 1.2} height={c - 1.2} rx={c * 0.3} fill="#111318" />
      ))}
      <F fx={0} fy={0} />
      <F fx={n - 7} fy={0} />
      <F fx={0} fy={n - 7} />
    </g>
  );
}

export const ShareCardSvg = forwardRef<SVGSVGElement, { goal: Goal; owner: Person; promoter: Person; caption: string; photo?: string }>(function ShareCardSvg(
  { goal, owner, promoter, caption, photo },
  ref,
) {
  const titleLines = useMemo(() => wrap(goal.title, 20, 3), [goal.title]);
  const capLines = useMemo(() => wrap(`“${caption}”`, 42, 4), [caption]);
  const slug = owner.first.toLowerCase().replace(/[^a-z]/g, '');
  const pct = fundedPct(goal);
  const h = owner.hue;
  const titleSize = titleLines.length > 2 ? 78 : 92;
  const titleTop = ART_H - 70 - (titleLines.length - 1) * titleSize * 1.02;
  const display = `'Bricolage Grotesque', 'Hanken Grotesk', 'Helvetica Neue', Arial, sans-serif`;
  const sans = `'Hanken Grotesk', 'Helvetica Neue', Arial, sans-serif`;
  const serif = `'Instrument Serif', Georgia, 'Times New Roman', serif`;
  const capTop = ART_H + 92;

  return (
    <svg ref={ref} xmlns="http://www.w3.org/2000/svg" viewBox={`0 0 ${CW} ${CH}`} width={CW} height={CH} className="h-auto w-full" role="img" aria-label={`Share card for ${goal.title}`}>
      <defs>
        <linearGradient id="sc-fade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#06102a" stopOpacity="0.35" />
          <stop offset="0.35" stopColor="#06102a" stopOpacity="0" />
          <stop offset="0.6" stopColor="#06102a" stopOpacity="0.1" />
          <stop offset="1" stopColor="#06102a" stopOpacity="0.78" />
        </linearGradient>
        <linearGradient id="sc-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#0b5cff" />
          <stop offset="0.6" stopColor="#55b8ff" />
          <stop offset="1" stopColor="#ffc83d" />
        </linearGradient>
        <radialGradient id="sc-av" cx="0.25" cy="0.15" r="1.1">
          <stop offset="0" stopColor={`hsl(${(h + 30) % 360} 90% 82%)`} />
          <stop offset="0.6" stopColor={`hsl(${h} 70% 62%)`} />
          <stop offset="1" stopColor={`hsl(${(h + 340) % 360} 60% 46%)`} />
        </radialGradient>
        <linearGradient id="sc-bar" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffb800" />
          <stop offset="1" stopColor="#ffc83d" />
        </linearGradient>
        <clipPath id="sc-art">
          <rect width={CW} height={ART_H} />
        </clipPath>
      </defs>

      <rect width={CW} height={CH} fill="#fffdf8" />

      {/* artwork */}
      <g clipPath="url(#sc-art)">
        {goal.image || photo ? (
          <image href={goal.image ?? photo} x="0" y="0" width={CW} height={ART_H} preserveAspectRatio="xMidYMid slice" />
        ) : (
          <ArtSvg scene={goal.scene} x={0} y={0} width={CW} height={ART_H} />
        )}
        <rect width={CW} height={ART_H} fill="url(#sc-fade)" />
      </g>

      {/* masthead */}
      <text x="72" y="104" fill="#fff" fontFamily={sans} fontSize="28" fontWeight="700" letterSpacing="7">
        {`${owner.first.toUpperCase()}'S BUCKETLIST`}
      </text>
      <rect x="72" y="128" width="64" height="6" rx="3" fill="#ffc83d" />

      {/* goal title */}
      <text x="72" y={titleTop - titleSize * 1.15} fontSize="72">
        {goal.emoji}
      </text>
      {titleLines.map((l, i) => (
        <text key={i} x="72" y={titleTop + i * titleSize * 1.02} fill="#fff" fontFamily={display} fontSize={titleSize} fontWeight="650" letterSpacing="-2.5">
          {l}
        </text>
      ))}

      {/* gradient seam */}
      <rect y={ART_H} width={CW} height="10" fill="url(#sc-band)" />

      {/* caption */}
      {capLines.map((l, i) => (
        <text key={i} x="72" y={capTop + i * 50} fill="#111318" fontFamily={serif} fontStyle="italic" fontSize="42">
          {l}
        </text>
      ))}
      <text x="72" y={capTop + capLines.length * 50 + 22} fill="#6b707b" fontFamily={sans} fontSize="24" fontWeight="500">
        {`— ${promoter.name}`}
      </text>

      {/* owner + CTA */}
      <g transform={`translate(72 ${CH - 232})`}>
        <circle cx="38" cy="38" r="38" fill="url(#sc-av)" />
        <text x="38" y="50" textAnchor="middle" fill="#fff" fontFamily={sans} fontSize="30" fontWeight="700">
          {owner.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
        </text>
        <text x="96" y="32" fill="#111318" fontFamily={sans} fontSize="28" fontWeight="700">
          {owner.name}
        </text>
        <text x="96" y="66" fill="#6b707b" fontFamily={sans} fontSize="24">
          {`${goal.hood} · ${goal.city}`}
        </text>
        {goal.funding?.enabled && (
          <g transform="translate(400 18)">
            <rect width="230" height="14" rx="7" fill="#f4e8d2" />
            <rect width={Math.max(14, 2.3 * pct)} height="14" rx="7" fill="url(#sc-bar)" />
            <text y="52" fill="#111318" fontFamily={sans} fontSize="22" fontWeight="700">
              {`${money(goal.funding.raised)} of ${money(goal.funding.target)}`}
            </text>
          </g>
        )}
      </g>

      <g transform={`translate(72 ${CH - 126})`}>
        <rect width="560" height="76" rx="38" fill="#0b5cff" />
        <text x="280" y="49" textAnchor="middle" fill="#fffdf8" fontFamily={sans} fontSize="28" fontWeight="700">
          {`Help ${owner.first} make this happen`}
        </text>
      </g>

      <QR seed={hash(goal.id)} x={CW - 72 - 190} y={CH - 324} size={190} />
      <text x={CW - 72 - 95} y={CH - 98} textAnchor="middle" fill="#3c4049" fontFamily={sans} fontSize="21" fontWeight="600">
        {`bucketlist.app/${slug}`}
      </text>

      {/* brand footer */}
      <g transform={`translate(${CW - 72 - 300} ${CH - 62})`}>
        <g transform="translate(2 -10) scale(1)">
          <MarkPaths />
        </g>
        <text x="42" y="23" fill="#111318" fontFamily={display} fontSize="24" fontWeight="650" letterSpacing="-0.8">
          Discover more on bucketlist
        </text>
      </g>
    </svg>
  );
});

/** Render the SVG card to a PNG data URL (fonts fall back to system faces inside the image). */
export async function svgToPng(svg: SVGSVGElement): Promise<string> {
  const xml = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([xml], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = rej;
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = CW;
    canvas.height = CH;
    canvas.getContext('2d')!.drawImage(img, 0, 0, CW, CH);
    return canvas.toDataURL('image/png');
  } finally {
    URL.revokeObjectURL(url);
  }
}

/** Embedded/sandboxed frames silently block downloads, so callers show the image instead. */
export function canDownload() {
  try {
    return window.self === window.top;
  } catch {
    return false;
  }
}

export function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.download = filename;
  a.href = dataUrl;
  a.click();
}

/**
 * The card is exported via canvas, which can't use remote images inside an SVG,
 * so the goal's photo is pulled in as a data URL. If that's blocked, the illustration is used.
 */
export function usePhotoData(goal: Goal | undefined) {
  const [data, setData] = useState<string | undefined>();
  const url = goal?.photo && !goal.image ? photoUrl(goal.photo, 1080) : undefined;
  useEffect(() => {
    if (!url) return;
    let alive = true;
    fetch(url)
      .then((r) => (r.ok ? r.blob() : Promise.reject()))
      .then(
        (b) =>
          new Promise<string>((res, rej) => {
            const fr = new FileReader();
            fr.onload = () => res(fr.result as string);
            fr.onerror = rej;
            fr.readAsDataURL(b);
          }),
      )
      .then((d) => alive && setData(d))
      .catch(() => {
        /* offline or blocked — the illustrated scene stands in */
      });
    return () => {
      alive = false;
    };
  }, [url]);
  return data;
}
