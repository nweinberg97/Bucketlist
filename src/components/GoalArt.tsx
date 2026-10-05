import { useId, useMemo } from 'react';
import type { Motif, Palette, Scene, SceneKind } from '../types';
import { rng } from '../lib/util';
import { MOTIFS } from './Motifs';

/**
 * Generative "horizon" artwork.
 *
 * Every goal gets a landscape: ocean, ridges, rolling hills, a waterfront
 * skyline, dunes, a field or an aurora. Tiny humans in big places — the
 * brand's hot-air-balloon metaphor without turning the app into a travel site.
 * It is deterministic per seed, so a goal always looks like itself.
 */

interface Pal {
  sky: [string, string, string];
  sun: string;
  far: string;
  mid: string;
  near: string;
  water: [string, string];
  figure: string;
}

const PALETTES: Record<Palette, Pal> = {
  dawn: { sky: ['#7fb6ff', '#cfe3ff', '#ffe3c4'], sun: '#ffd27a', far: '#aac4ee', mid: '#7fa0da', near: '#3f63ae', water: ['#86b5f5', '#3d6fd6'], figure: '#1b2a55' },
  noon: { sky: ['#2f7bff', '#7ec3ff', '#e4f3ff'], sun: '#fff3c9', far: '#9cc6f2', mid: '#4c8be0', near: '#1d55b8', water: ['#3a8bff', '#0b4fd6'], figure: '#0d2a66' },
  golden: { sky: ['#2a6cff', '#7cc4ff', '#ffd98c'], sun: '#ffc83d', far: '#8fb3ee', mid: '#3a6ccc', near: '#123f96', water: ['#2f79ff', '#0a3e9e'], figure: '#071d4f' },
  dusk: { sky: ['#0a2a73', '#3b6fd9', '#ff9e7a'], sun: '#ffc83d', far: '#5468b0', mid: '#2a3b7a', near: '#141b3d', water: ['#2d4fa8', '#101b47'], figure: '#0a0f24' },
  sand: { sky: ['#6fb1ff', '#bfe0ff', '#f7e2bd'], sun: '#ffc83d', far: '#ebcb97', mid: '#ddae6b', near: '#b97f3f', water: ['#5aa0ff', '#1d5fd0'], figure: '#4a2c10' },
  night: { sky: ['#050a22', '#0d2050', '#1d4282'], sun: '#eef2ff', far: '#1b2a5c', mid: '#111c40', near: '#080d22', water: ['#13245a', '#070d24'], figure: '#02040d' },
};

const W = 400;
const H = 400;
const HORIZON = 238;

function ridge(r: () => number, base: number, amp: number, steps: number, jag = 1) {
  let d = `M0 ${H} L0 ${base}`;
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const y = base - (r() * amp * (i % 2 === 0 ? 1 : 0.45 * jag + 0.2));
    d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return d + ` L${W} ${H} Z`;
}

function rolling(r: () => number, base: number, amp: number, waves: number) {
  let d = `M0 ${H} L0 ${base}`;
  const step = W / waves;
  for (let i = 0; i < waves; i++) {
    const x0 = i * step;
    const cy = base - amp * (0.4 + r() * 0.8);
    d += ` Q${(x0 + step / 2).toFixed(1)} ${cy.toFixed(1)} ${(x0 + step).toFixed(1)} ${(base - r() * amp * 0.3).toFixed(1)}`;
  }
  return d + ` L${W} ${H} Z`;
}

function Balloon({ x, y, s, colors, o = 1 }: { x: number; y: number; s: number; colors: [string, string]; o?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
      <path d="M0 -22 C 14 -22 18 -8 14 2 C 11 9 5 14 3 18 L -3 18 C -5 14 -11 9 -14 2 C -18 -8 -14 -22 0 -22 Z" fill={colors[0]} />
      <path d="M0 -22 C 6 -22 8 -8 6 2 C 5 9 2 14 1.5 18 L -1.5 18 C -2 14 -5 9 -6 2 C -8 -8 -6 -22 0 -22 Z" fill={colors[1]} />
      <path d="M-3 18 L-2.5 23 M3 18 L2.5 23" stroke="#3a2a1a" strokeWidth="0.6" />
      <rect x="-3.2" y="23" width="6.4" height="4.6" rx="1" fill="#7a5530" />
    </g>
  );
}

function Figure({ x, y, s = 1, color }: { x: number; y: number; s?: number; color: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color}>
      <circle cx="0" cy="-11.5" r="2.3" />
      <path d="M-2.3 -8.6 h4.6 l1 6 h-1.6 l-.4 6.6 h-1.4 l-.2-5 -.2 5 h-1.4 l-.4-6.6 h-1.6 z" />
    </g>
  );
}

export function GoalArt({ scene, className = '' }: { scene: Scene; className?: string }) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <ArtSvg scene={scene} className="absolute inset-0 h-full w-full" />
      <div className="grain pointer-events-none absolute inset-0" />
    </div>
  );
}

/** The raw SVG — nestable inside other SVGs (the share card uses it so it can export to PNG). */
export function ArtSvg({ scene, className, x, y, width, height, align = 'xMidYMid' }: { scene: Scene; className?: string; x?: number; y?: number; width?: number; height?: number; align?: string }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const p = PALETTES[scene.palette];
  const kind: SceneKind = scene.kind;

  const shapes = useMemo(() => {
    const r = rng(scene.seed * 9973 + 17);
    const sunX = 70 + r() * 260;
    const sunY = kind === 'aurora' ? 70 + r() * 30 : 150 + r() * 70;
    const sunR = kind === 'aurora' ? 12 : 30 + r() * 26;
    return {
      sunX,
      sunY,
      sunR,
      far: ridge(r, HORIZON - 8, 70, 7, 1.4),
      mid: ridge(r, HORIZON + 20, 60, 9, 1),
      near: ridge(r, HORIZON + 70, 54, 6, 0.8),
      hillFar: rolling(r, HORIZON + 6, 46, 3),
      hillMid: rolling(r, HORIZON + 46, 52, 2),
      hillNear: rolling(r, HORIZON + 104, 56, 2),
      headland: r() > 0.5,
      stars: Array.from({ length: 40 }, () => [r() * W, r() * HORIZON * 0.85, r() * 1.1 + 0.3] as const),
      buildings: Array.from({ length: 22 }, (_, i) => {
        const w = 10 + r() * 14;
        const h = 18 + r() * (i > 7 && i < 15 ? 90 : 46);
        return [i * 18.2 + r() * 4, w, h] as const;
      }),
      balloons: [
        [60 + r() * 80, 70 + r() * 60, 1.5],
        [230 + r() * 120, 50 + r() * 50, 1.05],
        [170 + r() * 60, 130 + r() * 50, 0.7],
      ] as const,
      rows: Array.from({ length: 5 }, (_, i) => i),
      figX: 90 + r() * 220,
      waves: Array.from({ length: 9 }, () => [r() * W, HORIZON + 14 + r() * 150, 14 + r() * 40] as const),
    };
  }, [scene.seed, kind]);

  const g = (n: string) => `${uid}-${n}`;
  const isDark = scene.palette === 'night' || scene.palette === 'dusk';

  return (
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio={`${align} slice`} className={className} x={x} y={y} width={width} height={height} role="img" aria-label="Goal artwork">
        <defs>
          <linearGradient id={g('sky')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.sky[0]} />
            <stop offset="0.55" stopColor={p.sky[1]} />
            <stop offset="1" stopColor={p.sky[2]} />
          </linearGradient>
          <linearGradient id={g('water')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.water[0]} />
            <stop offset="1" stopColor={p.water[1]} />
          </linearGradient>
          <radialGradient id={g('glow')}>
            <stop offset="0" stopColor={p.sun} stopOpacity="0.85" />
            <stop offset="0.35" stopColor={p.sun} stopOpacity="0.35" />
            <stop offset="1" stopColor={p.sun} stopOpacity="0" />
          </radialGradient>
          <linearGradient id={g('haze')} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={p.sky[2]} stopOpacity="0" />
            <stop offset="1" stopColor={p.sky[2]} stopOpacity="0.55" />
          </linearGradient>
          <linearGradient id={g('aur')} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#46e0c0" stopOpacity="0" />
            <stop offset="0.3" stopColor="#46e0c0" stopOpacity="0.75" />
            <stop offset="0.7" stopColor="#55b8ff" stopOpacity="0.6" />
            <stop offset="1" stopColor="#55b8ff" stopOpacity="0" />
          </linearGradient>
          <filter id={g('blur')} x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation="9" />
          </filter>
        </defs>

        <rect width={W} height={H} fill={`url(#${g('sky')})`} />

        {(scene.palette === 'night' || kind === 'aurora') &&
          shapes.stars.map(([x, y, s], i) => <circle key={i} cx={x} cy={y} r={s} fill="#fff" opacity={0.35 + (i % 5) * 0.12} />)}

        {kind === 'aurora' && (
          <g filter={`url(#${g('blur')})`}>
            <path d={`M-20 120 C 80 60, 160 160, 240 90 S 380 70, 430 120`} stroke={`url(#${g('aur')})`} strokeWidth="38" fill="none" />
            <path d={`M-20 170 C 90 120, 200 200, 300 140 S 400 140, 430 160`} stroke={`url(#${g('aur')})`} strokeWidth="22" fill="none" opacity="0.7" />
          </g>
        )}

        {/* sun / moon with a soft glow */}
        <circle cx={shapes.sunX} cy={shapes.sunY} r={shapes.sunR * 3.2} fill={`url(#${g('glow')})`} />
        <circle cx={shapes.sunX} cy={shapes.sunY} r={shapes.sunR} fill={p.sun} />

        {scene.balloons &&
          shapes.balloons.map(([x, y, s], i) => (
            <Balloon key={i} x={x} y={y} s={s} o={1 - i * 0.18} colors={i === 1 ? ['#ff8066', '#ffc83d'] : i === 2 ? ['#fffdf8', '#0b5cff'] : ['#ffc83d', '#ff8066']} />
          ))}

        {kind === 'ocean' && (
          <>
            {shapes.headland && <path d={`M${W} ${HORIZON} L${W} ${HORIZON - 34} C 360 ${HORIZON - 40}, 320 ${HORIZON - 14}, 270 ${HORIZON} Z`} fill={p.mid} opacity="0.85" />}
            <rect y={HORIZON} width={W} height={H - HORIZON} fill={`url(#${g('water')})`} />
            {[0, 1, 2, 3, 4].map((i) => (
              <rect key={i} x={shapes.sunX - (40 - i * 6)} y={HORIZON + 6 + i * 14} width={80 - i * 12} height="3" rx="1.5" fill={p.sun} opacity={0.6 - i * 0.1} />
            ))}
            {shapes.waves.map(([x, y, w], i) => (
              <path key={i} d={`M${x} ${y} q ${w / 2} -5 ${w} 0`} stroke="#fff" strokeOpacity={isDark ? 0.18 : 0.35} strokeWidth="1.6" fill="none" strokeLinecap="round" />
            ))}
{!scene.motif && (
            <g transform={`translate(${shapes.figX} ${HORIZON + 92})`}>
              <rect x="-12" y="1" width="24" height="3.2" rx="1.6" fill={p.sun} opacity="0.95" />
              {!scene.motif && <Figure x={0} y={1} s={0.9} color={p.figure} />}
            </g>
            )}
          </>
        )}

        {(kind === 'ridges' || kind === 'aurora') && (
          <>
            <path d={shapes.far} fill={p.far} opacity="0.75" />
            <rect y={HORIZON - 80} width={W} height="140" fill={`url(#${g('haze')})`} />
            <path d={shapes.mid} fill={p.mid} />
            <path d={shapes.near} fill={p.near} />
            {!scene.motif && <Figure x={shapes.figX} y={HORIZON + 60} s={1.1} color={p.figure} />}
          </>
        )}

        {(kind === 'hills' || kind === 'field') && (
          <>
            <path d={shapes.hillFar} fill={p.far} opacity="0.8" />
            <path d={shapes.hillMid} fill={p.mid} />
            {kind === 'field' &&
              shapes.rows.map((i) => (
                <rect key={i} x={40 + i * 66} y={HORIZON + 112 + (i % 2) * 6} width="50" height="9" rx="4.5" fill={p.sun} opacity="0.55" />
              ))}
            <path d={shapes.hillNear} fill={p.near} />
            {!scene.motif && <Figure x={shapes.figX} y={HORIZON + 98} s={1.1} color={p.figure} />}
          </>
        )}

        {kind === 'dunes' && (
          <>
            <path d={shapes.hillFar} fill={p.far} />
            <path d={shapes.hillMid} fill={p.mid} />
            <path d={shapes.hillNear} fill={p.near} opacity="0.9" />
            {!scene.motif && <Figure x={shapes.figX} y={HORIZON + 96} s={1.1} color={p.figure} />}
          </>
        )}

        {kind === 'city' && (
          <>
            <path d={shapes.far} fill={p.far} opacity="0.7" />
            <rect y={HORIZON - 80} width={W} height="140" fill={`url(#${g('haze')})`} />
            {shapes.buildings.map(([x, w, h], i) => (
              <rect key={i} x={x} y={HORIZON + 30 - h} width={w} height={h + 2} fill={p.mid} opacity={0.92} />
            ))}
            {isDark &&
              shapes.buildings.slice(4, 16).map(([x, w, h], i) => (
                <rect key={`w${i}`} x={x + w / 3} y={HORIZON + 34 - h + 8 + (i % 3) * 10} width="2.4" height="2.4" fill={p.sun} opacity="0.9" />
              ))}
            <rect y={HORIZON + 30} width={W} height={H - HORIZON} fill={`url(#${g('water')})`} />
            {[0, 1, 2, 3].map((i) => (
              <rect key={i} x={shapes.sunX - (34 - i * 6)} y={HORIZON + 40 + i * 13} width={68 - i * 12} height="2.6" rx="1.3" fill={p.sun} opacity={0.55 - i * 0.1} />
            ))}
            <path d={`M0 ${H} L0 ${HORIZON + 118} Q ${W * 0.3} ${HORIZON + 100} ${W * 0.55} ${HORIZON + 122} T ${W} ${HORIZON + 112} L ${W} ${H} Z`} fill={p.near} />
            {!scene.motif && <Figure x={shapes.figX} y={HORIZON + 116} s={1.1} color={p.figure} />}
          </>
        )}
        {scene.motif && MOTIFS[scene.motif] && <g transform="translate(100 168)">{MOTIFS[scene.motif]()}</g>}
      </svg>
  );
}

/* Pick a fitting scene for a brand-new goal from its words + category. */
const MOTIF_WORDS: [RegExp, Motif][] = [
  [/paddle|\bsup\b/, 'paddleboard'], [/surf/, 'surfboard'], [/mural|paint a wall/, 'mural'], [/japan|kyoto|tokyo/, 'torii'],
  [/guitar|open mic|busk|band|song/, 'guitar'], [/marathon|\brun\b|race|5k|10k/, 'finish'], [/pottery|clay|ceramic/, 'pottery'],
  [/camp|tent/, 'tent'], [/hike|trail|trek|backpack/, 'backpack'], [/spanish|french|language|italian lessons/, 'coffee'],
  [/photo|camera|zine/, 'camera'], [/sushi/, 'sushi'], [/film|movie|documentary/, 'film'], [/\bep\b|album|record|vinyl/, 'vinyl'],
  [/garden|grow|plant/, 'garden'], [/bike|cycl|ironman|triathlon/, 'bike'], [/book|novel|write/, 'book'], [/lighthouse|game/, 'lighthouse'],
  [/paint|art|draw|residency/, 'easel'], [/dinner|feast|potluck|supper/, 'table'], [/volleyball/, 'volleyball'], [/\bdj\b|turntable/, 'turntable'],
  [/pasta|italian|cook/, 'pasta'], [/ramen|noodle|restaurant|eat at/, 'noodles'], [/stand-?up|comedy|speech|sing/, 'mic'],
  [/sky ?div|parachute/, 'parachute'], [/canoe|kayak|row/, 'canoe'], [/lift|deadlift|squat|clean and jerk/, 'barbell'],
];

export function sceneFor(title: string, category: string, seed: number): Scene {
  const base = sceneBase(title, category, seed);
  const t = title.toLowerCase();
  const motif = MOTIF_WORDS.find(([re]) => re.test(t))?.[1];
  return motif ? { ...base, motif } : base;
}

function sceneBase(title: string, category: string, seed: number): Scene {
  const t = title.toLowerCase();
  const pals: Palette[] = ['golden', 'dawn', 'noon', 'dusk'];
  const palette = pals[seed % pals.length];
  if (/aurora|northern light|stars/.test(t)) return { kind: 'aurora', palette: 'night', seed };
  if (/surf|paddle|sup|swim|sail|kayak|ocean|beach|canoe|dive|fish/.test(t)) return { kind: 'ocean', palette, seed };
  if (/hike|climb|mountain|trail|ski|summit|camp|peak|run|marathon/.test(t)) return { kind: 'ridges', palette, seed };
  if (/garden|farm|plant|grow/.test(t)) return { kind: 'field', palette: 'noon', seed };
  if (/desert|morocco|egypt|pottery|clay|bake|cook|pasta|food/.test(t)) return { kind: 'dunes', palette: seed % 2 ? 'sand' : 'golden', seed, balloons: /morocco|turkey|cappadocia|balloon/.test(t) };
  switch (category) {
    case 'Travel':
      return { kind: 'hills', palette, seed, balloons: true };
    case 'Adventure':
    case 'Fitness':
      return { kind: 'ridges', palette, seed };
    case 'Creativity':
    case 'Career':
    case 'Community':
      return { kind: 'city', palette, seed };
    case 'Food':
      return { kind: 'dunes', palette: 'golden', seed };
    case 'Just for fun':
      return { kind: 'hills', palette, seed, balloons: true };
    default:
      return { kind: 'hills', palette, seed };
  }
}
