import type { ReactElement } from 'react';
import type { Motif } from '../types';

/**
 * Foreground subjects for the illustrated scenes, so a fallback image still
 * says what the goal is (a pottery night shows a wheel and bowls, not just a sunset).
 *
 * Each motif is drawn in a 200×150 box with its base on y=150; GoalArt places it on the horizon.
 */

const INK = '#13204a';
const INK2 = '#24376f';
const CLOUD = '#fffdf8';
const SUN = '#ffc83d';
const SUND = '#e8a800';
const CORAL = '#ff8066';
const RED = '#e2553f';
const SAND = '#f4e8d2';
const WOOD = '#b5793f';
const WOODD = '#8a5a2b';
const CLAY = '#c8804f';
const CLAYD = '#a25f35';
const GREEN = '#3f9a6a';
const GREEND = '#2d7a52';
const STEEL = '#a9bbd8';

const Shadow = ({ cx = 100, rx = 80 }: { cx?: number; rx?: number }) => <ellipse cx={cx} cy={150} rx={rx} ry={7} fill="#000" opacity={0.18} />;

const Bulbs = ({ y = 10, n = 7 }: { y?: number; n?: number }) => (
  <g>
    <path d={`M-10 ${y} Q100 ${y + 26} 210 ${y}`} stroke={INK} strokeWidth="1.4" fill="none" opacity="0.7" />
    {Array.from({ length: n }, (_, i) => {
      const x = (i + 0.5) * (220 / n) - 10;
      const t = x / 200;
      const yy = y + 26 * 4 * t * (1 - t) * 0.5 + 6;
      return (
        <g key={i}>
          <circle cx={x} cy={yy} r="7" fill={SUN} opacity="0.35" />
          <circle cx={x} cy={yy} r="3.2" fill={SUN} />
        </g>
      );
    })}
  </g>
);

export const MOTIFS: Record<Motif, () => ReactElement> = {
  surfboard: () => (
    <g>
      <ellipse cx="100" cy="146" rx="74" ry="12" fill={SAND} />
      <g transform="rotate(-9 100 150)">
        <path d="M100 2 C124 14 130 84 119 148 L81 148 C70 84 76 14 100 2Z" fill={CLOUD} />
        <path d="M100 6 L100 146" stroke={SUN} strokeWidth="7" />
        <path d="M100 6 L100 146" stroke={CORAL} strokeWidth="2" />
        <path d="M86 40 C90 24 110 24 114 40" stroke={INK2} strokeWidth="2.4" fill="none" opacity=".5" />
      </g>
      <path d="M20 140 q14-8 28 0 q14 8 28 0" stroke={CLOUD} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9" />
      <path d="M130 144 q12-7 24 0 q12 7 24 0" stroke={CLOUD} strokeWidth="3" fill="none" strokeLinecap="round" opacity=".9" />
    </g>
  ),

  paddleboard: () => (
    <g>
      <ellipse cx="100" cy="138" rx="96" ry="10" fill={CLOUD} />
      <path d="M12 138 L188 138" stroke={CORAL} strokeWidth="3" />
      <line x1="150" y1="30" x2="108" y2="132" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <path d="M104 126 l-8 22 l14 4 l6-22z" fill={SUN} />
      <path d="M8 152 q12-6 24 0 q12 6 24 0 M120 152 q12-6 24 0 q12 6 24 0" stroke={CLOUD} strokeWidth="2.4" fill="none" opacity=".7" />
    </g>
  ),

  mural: () => (
    <g>
      <rect x="0" y="22" width="200" height="128" rx="3" fill="#ead8be" />
      {Array.from({ length: 8 }, (_, r) => (
        <path key={r} d={`M0 ${38 + r * 16} H200`} stroke="#d7c09f" strokeWidth="1.2" />
      ))}
      <circle cx="78" cy="78" r="38" fill={SUN} />
      <path d="M8 120 C40 92 70 132 100 108 S160 96 192 118 L192 150 L8 150Z" fill="#0b5cff" />
      <path d="M8 132 C40 112 70 146 100 128 S160 118 192 134" stroke={CLOUD} strokeWidth="5" fill="none" />
      <circle cx="140" cy="58" r="14" fill={CORAL} />
      {/* ladder */}
      <g stroke={WOODD} strokeWidth="4" strokeLinecap="round">
        <line x1="168" y1="20" x2="182" y2="150" />
        <line x1="190" y1="20" x2="200" y2="150" />
        {[40, 66, 92, 118, 142].map((y) => (
          <line key={y} x1={170 + (y - 20) * 0.11} y1={y} x2={192 + (y - 20) * 0.08} y2={y} strokeWidth="3" />
        ))}
      </g>
      {/* paint can */}
      <rect x="14" y="124" width="26" height="26" rx="3" fill={STEEL} />
      <ellipse cx="27" cy="124" rx="13" ry="4" fill={CORAL} />
      <path d="M22 124 v10" stroke={CORAL} strokeWidth="3" strokeLinecap="round" />
    </g>
  ),

  torii: () => (
    <g>
      <Shadow rx={78} />
      <path d="M14 22 Q100 8 186 22 L184 32 Q100 20 16 32Z" fill={RED} />
      <rect x="22" y="31" width="156" height="8" fill={INK} />
      <rect x="30" y="54" width="140" height="9" fill={RED} />
      <rect x="44" y="34" width="12" height="116" fill={RED} />
      <rect x="144" y="34" width="12" height="116" fill={RED} />
      <rect x="94" y="39" width="12" height="16" fill={RED} />
      <rect x="40" y="140" width="20" height="10" fill={INK} />
      <rect x="140" y="140" width="20" height="10" fill={INK} />
      {[[20, 90, CORAL], [176, 104, SUN], [92, 120, CORAL], [128, 84, SUN], [64, 108, SUN]].map(([x, y, c], i) => (
        <path key={i} d={`M${x} ${y} l4 6 l7 -1 l-4 6 l3 6 l-7 -2 l-5 5 l0 -7 l-6 -4 l7 -2z`} fill={c as string} opacity=".9" />
      ))}
    </g>
  ),

  guitar: () => (
    <g>
      <Shadow rx={70} />
      {/* mic stand */}
      <line x1="150" y1="40" x2="150" y2="148" stroke={INK} strokeWidth="3.5" />
      <path d="M134 150 L150 136 L166 150" stroke={INK} strokeWidth="3.5" fill="none" />
      <rect x="143" y="22" width="14" height="24" rx="7" fill={INK2} />
      <rect x="145" y="25" width="10" height="11" rx="5" fill={STEEL} />
      <g transform="rotate(-14 80 110)">
        <rect x="74" y="8" width="12" height="78" rx="3" fill={WOODD} />
        <rect x="71" y="0" width="18" height="16" rx="4" fill={INK} />
        <ellipse cx="80" cy="98" rx="30" ry="26" fill={WOOD} />
        <ellipse cx="80" cy="128" rx="38" ry="28" fill={WOOD} />
        <circle cx="80" cy="104" r="11" fill={INK} />
        <rect x="68" y="130" width="24" height="5" rx="2" fill={INK} />
        <path d="M77 12 V128 M83 12 V128" stroke={SAND} strokeWidth=".8" opacity=".8" />
      </g>
    </g>
  ),

  lanterns: () => (
    <g>
      <path d="M-10 10 Q100 34 210 10" stroke={INK} strokeWidth="1.6" fill="none" />
      {[30, 78, 126, 174].map((x, i) => {
        const y = 22 + (i === 1 || i === 2 ? 6 : 0);
        return (
          <g key={x}>
            <line x1={x} y1={y - 8} x2={x} y2={y} stroke={INK} strokeWidth="1.4" />
            <circle cx={x} cy={y + 24} r="30" fill={SUN} opacity=".22" />
            <rect x={x - 16} y={y} width="32" height="44" rx="14" fill={i % 2 ? CORAL : RED} />
            <path d={`M${x - 15} ${y + 15} H${x + 15} M${x - 15} ${y + 29} H${x + 15}`} stroke={SUN} strokeWidth="1.4" opacity=".8" />
            <rect x={x - 8} y={y - 3} width="16" height="5" rx="1.5" fill={INK} />
            <rect x={x - 8} y={y + 42} width="16" height="5" rx="1.5" fill={INK} />
            <line x1={x} y1={y + 47} x2={x} y2={y + 58} stroke={SUN} strokeWidth="2" />
          </g>
        );
      })}
      <rect x="0" y="118" width="200" height="32" fill={INK} opacity=".55" />
      {[10, 46, 92, 140, 176].map((x, i) => (
        <rect key={x} x={x} y={124 + (i % 2) * 3} width="18" height="10" rx="2" fill={SUN} opacity=".7" />
      ))}
    </g>
  ),

  finish: () => (
    <g>
      <Shadow rx={92} />
      <rect x="10" y="20" width="7" height="130" fill={INK} />
      <rect x="183" y="20" width="7" height="130" fill={INK} />
      <rect x="6" y="14" width="188" height="34" rx="4" fill={CORAL} />
      <text x="100" y="38" textAnchor="middle" fill={CLOUD} fontFamily="'Hanken Grotesk', Arial, sans-serif" fontWeight="800" fontSize="20" letterSpacing="5">FINISH</text>
      <path d="M17 92 Q100 106 183 92" stroke={SUN} strokeWidth="3" fill="none" />
      {Array.from({ length: 12 }, (_, i) => (
        <rect key={i} x={17 + i * 13.8} y={142} width="6.9" height="8" fill={i % 2 ? INK : CLOUD} />
      ))}
      {/* runner */}
      <g fill={INK} transform="translate(92 70)">
        <circle cx="12" cy="6" r="6" />
        <path d="M8 13 L16 13 L20 36 L30 52 L25 56 L13 38 L6 56 L0 54 L7 34 Z" />
        <path d="M9 16 L-6 28 L-3 31 L11 22 Z M15 16 L28 22 L36 14 L39 17 L29 28 L16 24Z" />
      </g>
    </g>
  ),

  pottery: () => (
    <g>
      <Shadow rx={92} />
      {/* wheel */}
      <path d="M30 150 L44 108 H124 L138 150Z" fill={INK2} />
      <ellipse cx="84" cy="108" rx="48" ry="10" fill={STEEL} />
      <ellipse cx="84" cy="104" rx="44" ry="8" fill="#c9d6ea" />
      {/* vase on the wheel */}
      <path d="M66 104 C58 82 60 64 72 52 C66 44 70 36 78 34 H90 C98 36 102 44 96 52 C108 64 110 82 102 104Z" fill={CLAY} />
      <path d="M72 52 C80 56 88 56 96 52" stroke={CLAYD} strokeWidth="2" fill="none" />
      <path d="M68 78 C78 82 90 82 100 78" stroke={CLAYD} strokeWidth="1.6" fill="none" opacity=".7" />
      {/* bowls stack */}
      <path d="M140 150 C140 132 154 124 170 124 C186 124 200 132 200 150Z" fill={CLOUD} />
      <path d="M146 126 C146 112 156 104 170 104 C184 104 194 112 194 126Z" fill={SUN} />
      <path d="M152 106 C152 96 160 90 170 90 C180 90 188 96 188 106Z" fill={CLAY} />
      <path d="M140 150 H200" stroke={CLAYD} strokeWidth="2" />
    </g>
  ),

  tent: () => (
    <g>
      <Shadow rx={92} />
      <path d="M22 150 L84 30 L146 150Z" fill={SUN} />
      <path d="M84 30 L146 150 H116 Z" fill={SUND} />
      <path d="M84 70 L66 150 H102Z" fill={INK} />
      <line x1="84" y1="30" x2="84" y2="20" stroke={INK} strokeWidth="3" />
      {/* fire */}
      <g transform="translate(168 112)">
        <circle cx="0" cy="12" r="26" fill={SUN} opacity=".25" />
        <path d="M-16 36 L16 26 M-16 26 L16 36" stroke={WOODD} strokeWidth="6" strokeLinecap="round" />
        <path d="M0 0 C10 10 12 22 0 30 C-12 22 -10 10 0 0Z" fill={CORAL} />
        <path d="M0 12 C5 17 6 23 0 28 C-6 23 -5 17 0 12Z" fill={SUN} />
      </g>
    </g>
  ),

  backpack: () => (
    <g>
      <Shadow rx={80} />
      {/* trail marker */}
      <rect x="150" y="34" width="6" height="116" fill={WOODD} />
      <path d="M130 44 H182 L192 54 L182 64 H130Z" fill={WOOD} />
      <path d="M140 54 H176" stroke={CLOUD} strokeWidth="2.5" strokeLinecap="round" />
      {/* poles */}
      <line x1="34" y1="40" x2="20" y2="150" stroke={INK} strokeWidth="3" />
      <line x1="44" y1="40" x2="40" y2="150" stroke={INK} strokeWidth="3" />
      {/* pack */}
      <rect x="54" y="56" width="74" height="94" rx="18" fill={CORAL} />
      <path d="M54 82 C54 60 66 46 91 46 C116 46 128 60 128 82 Z" fill={RED} />
      <rect x="64" y="104" width="54" height="34" rx="8" fill={RED} />
      <rect x="86" y="70" width="10" height="16" rx="3" fill={SUN} />
      <rect x="58" y="40" width="66" height="14" rx="7" fill={GREEN} />
      <path d="M62 47 H120" stroke={GREEND} strokeWidth="1.5" />
    </g>
  ),

  coffee: () => (
    <g>
      <rect x="10" y="120" width="180" height="10" rx="5" fill={WOOD} />
      <rect x="92" y="130" width="16" height="20" fill={WOODD} />
      {[55, 145].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="118" rx="26" ry="5" fill={CLOUD} />
          <path d={`M${x - 18} 86 H${x + 18} L${x + 14} 116 H${x - 14}Z`} fill={i ? SUN : CLOUD} />
          <path d={`M${x + 18} 92 c12 0 12 16 -2 16`} stroke={i ? SUN : CLOUD} strokeWidth="4" fill="none" />
          <path d={`M${x - 6} 78 c-6-8 6-12 0-20 M${x + 6} 78 c-6-8 6-12 0-20`} stroke={CLOUD} strokeWidth="2" fill="none" opacity=".7" />
        </g>
      ))}
      <g>
        <rect x="6" y="6" width="84" height="38" rx="19" fill={CLOUD} />
        <path d="M30 42 l-6 14 l18 -12z" fill={CLOUD} />
        <text x="48" y="31" textAnchor="middle" fill={INK} fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize="20">¡Hola!</text>
      </g>
      <g>
        <rect x="118" y="20" width="76" height="36" rx="18" fill={INK} />
        <path d="M170 54 l8 14 l-18 -12z" fill={INK} />
        <text x="156" y="44" textAnchor="middle" fill={CLOUD} fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize="19">¿Qué tal?</text>
      </g>
    </g>
  ),

  camera: () => (
    <g>
      <Shadow rx={88} />
      {/* prints */}
      <g transform="rotate(-10 150 120)">
        <rect x="118" y="84" width="64" height="64" rx="3" fill={CLOUD} />
        <rect x="124" y="90" width="52" height="40" fill="#7ec3ff" />
        <circle cx="160" cy="104" r="8" fill={SUN} />
        <path d="M124 130 L140 112 L152 122 L164 110 L176 130Z" fill={INK2} />
      </g>
      <g transform="rotate(6 160 120)">
        <rect x="136" y="96" width="56" height="54" rx="3" fill={CLOUD} />
        <rect x="141" y="101" width="46" height="34" fill={CORAL} opacity=".85" />
        <rect x="150" y="112" width="28" height="23" fill={INK2} />
      </g>
      {/* camera */}
      <rect x="14" y="62" width="112" height="78" rx="12" fill={INK} />
      <rect x="14" y="80" width="112" height="10" fill={INK2} />
      <rect x="28" y="50" width="30" height="16" rx="4" fill={INK} />
      <rect x="100" y="54" width="18" height="10" rx="3" fill={SUN} />
      <circle cx="70" cy="102" r="30" fill={STEEL} />
      <circle cx="70" cy="102" r="22" fill={INK2} />
      <circle cx="70" cy="102" r="12" fill="#0b5cff" />
      <circle cx="64" cy="96" r="4" fill={CLOUD} opacity=".8" />
    </g>
  ),

  phone: () => (
    <g>
      <Shadow rx={70} />
      <path d="M30 150 L44 84 H156 L170 150Z" fill={CORAL} />
      <path d="M44 84 H156 L160 100 H40Z" fill={RED} />
      <circle cx="100" cy="122" r="22" fill={CLOUD} />
      {Array.from({ length: 10 }, (_, i) => {
        const a = (-200 + i * 26) * (Math.PI / 180);
        return <circle key={i} cx={100 + Math.cos(a) * 14} cy={122 + Math.sin(a) * 14} r="3" fill={INK} opacity=".75" />;
      })}
      <circle cx="100" cy="122" r="5" fill={SUN} />
      {/* handset */}
      <path d="M26 60 C26 46 42 42 50 52 L60 66 H140 L150 52 C158 42 174 46 174 60 C174 70 168 76 160 78 H40 C32 76 26 70 26 60Z" fill={RED} />
      <path d="M170 140 c14 0 10 -10 20 -10 c10 0 6 10 14 10" stroke={INK} strokeWidth="2" fill="none" />
    </g>
  ),

  sushi: () => (
    <g>
      <Shadow rx={94} />
      <rect x="6" y="116" width="188" height="20" rx="4" fill={WOOD} />
      <rect x="20" y="136" width="14" height="12" fill={WOODD} />
      <rect x="166" y="136" width="14" height="12" fill={WOODD} />
      {[40, 78, 116].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="104" rx="17" ry="14" fill={INK} />
          <rect x={x - 17} y="104" width="34" height="12" fill={INK} />
          <ellipse cx={x} cy="104" rx="13" ry="10" fill={CLOUD} />
          <ellipse cx={x} cy="104" rx="5" ry="4" fill={CORAL} />
          <circle cx={x + 3} cy="101" r="2" fill={GREEN} />
        </g>
      ))}
      <g>
        <rect x="140" y="98" width="42" height="18" rx="9" fill={CLOUD} />
        <path d="M136 100 C146 82 176 82 186 100 C176 96 146 96 136 100Z" fill={CORAL} />
        <path d="M150 90 l6 6 M162 88 l6 6 M174 90 l4 5" stroke={CLOUD} strokeWidth="2" opacity=".7" />
      </g>
      <line x1="60" y1="56" x2="186" y2="88" stroke={WOODD} strokeWidth="4" strokeLinecap="round" />
      <line x1="60" y1="66" x2="186" y2="92" stroke={WOOD} strokeWidth="4" strokeLinecap="round" />
    </g>
  ),

  film: () => (
    <g>
      <Shadow rx={92} />
      {/* clapperboard */}
      <g transform="rotate(-4 70 110)">
        <rect x="14" y="70" width="112" height="78" rx="5" fill={INK} />
        <g transform="rotate(-14 14 64)">
          <rect x="14" y="48" width="112" height="18" rx="3" fill={INK} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M${24 + i * 22} 48 L${36 + i * 22} 48 L${28 + i * 22} 66 L${16 + i * 22} 66Z`} fill={CLOUD} />
          ))}
        </g>
        {[0, 1, 2, 3, 4].map((i) => (
          <path key={i} d={`M${24 + i * 22} 70 L${36 + i * 22} 70 L${28 + i * 22} 84 L${16 + i * 22} 84Z`} fill={CLOUD} />
        ))}
        <path d="M22 100 H118 M22 122 H118 M70 100 V148" stroke={CLOUD} strokeWidth="1.2" opacity=".5" />
        <text x="26" y="116" fill={CLOUD} fontFamily="'Hanken Grotesk', Arial, sans-serif" fontWeight="700" fontSize="11">SCENE 4</text>
        <text x="76" y="116" fill={SUN} fontFamily="'Hanken Grotesk', Arial, sans-serif" fontWeight="700" fontSize="11">TAKE 3</text>
        <text x="26" y="139" fill={CLOUD} fontFamily="'Instrument Serif', Georgia, serif" fontStyle="italic" fontSize="13">The Diner</text>
      </g>
      {/* film reel */}
      <circle cx="160" cy="112" r="36" fill={STEEL} />
      <circle cx="160" cy="112" r="8" fill={INK} />
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i * 72 - 90) * (Math.PI / 180);
        return <circle key={i} cx={160 + Math.cos(a) * 21} cy={112 + Math.sin(a) * 21} r="9" fill={INK2} />;
      })}
    </g>
  ),

  vinyl: () => (
    <g>
      <Shadow rx={86} />
      <rect x="24" y="44" width="104" height="104" rx="3" fill={CORAL} />
      <circle cx="76" cy="96" r="30" fill={SUN} />
      <path d="M24 130 L128 108" stroke={CLOUD} strokeWidth="3" opacity=".6" />
      <circle cx="132" cy="96" r="54" fill={INK} />
      {[44, 36, 28].map((r) => (
        <circle key={r} cx="132" cy="96" r={r} fill="none" stroke={INK2} strokeWidth="1.4" />
      ))}
      <circle cx="132" cy="96" r="16" fill={SUN} />
      <circle cx="132" cy="96" r="3" fill={INK} />
      <path d="M100 60 C110 52 124 50 132 52" stroke="#fff" strokeWidth="2" opacity=".25" fill="none" />
    </g>
  ),

  garden: () => (
    <g>
      <Shadow rx={96} />
      {[{ x: 4, w: 110 }, { x: 122, w: 74 }].map(({ x, w }, b) => (
        <g key={x}>
          <rect x={x} y="118" width={w} height="32" fill={WOOD} />
          <path d={`M${x} 128 H${x + w} M${x} 139 H${x + w}`} stroke={WOODD} strokeWidth="1.4" />
          <rect x={x} y="114" width={w} height="6" fill="#5b3a1e" />
          {Array.from({ length: Math.floor(w / 18) }, (_, i) => {
            const cx = x + 10 + i * 18;
            const h = 18 + ((i + b) % 3) * 9;
            return (
              <g key={i}>
                <line x1={cx} y1="116" x2={cx} y2={116 - h} stroke={GREEND} strokeWidth="2" />
                <path d={`M${cx} ${116 - h + 6} c-12 -2 -14 -12 -12 -14 c8 0 12 6 12 14Z`} fill={GREEN} />
                <path d={`M${cx} ${116 - h + 2} c12 -2 14 -12 12 -14 c-8 0 -12 6 -12 14Z`} fill={GREEN} />
                {(i + b) % 3 === 1 && <circle cx={cx} cy={116 - h - 4} r="4" fill={i % 2 ? CORAL : SUN} />}
              </g>
            );
          })}
        </g>
      ))}
      {/* watering can */}
      <g transform="translate(150 66)">
        <rect x="0" y="10" width="34" height="30" rx="6" fill={SUN} />
        <path d="M34 18 L52 4 L55 8 L38 26Z" fill={SUND} />
        <path d="M4 10 C4 -4 30 -4 30 10" stroke={SUND} strokeWidth="4" fill="none" />
      </g>
    </g>
  ),

  bike: () => (
    <g>
      <Shadow rx={92} />
      <g fill="none" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="46" cy="110" r="36" stroke={INK} strokeWidth="6" />
        <circle cx="154" cy="110" r="36" stroke={INK} strokeWidth="6" />
        <circle cx="46" cy="110" r="27" stroke={STEEL} strokeWidth="1.2" />
        <circle cx="154" cy="110" r="27" stroke={STEEL} strokeWidth="1.2" />
        <path d="M46 110 L84 60 H140 L100 110 Z M100 110 L84 60 M140 60 L154 110" stroke={CORAL} strokeWidth="6" />
        <path d="M84 60 L78 46 M70 46 H92" stroke={INK} strokeWidth="5" />
        <path d="M140 60 L136 44 C148 40 156 46 154 56" stroke={INK} strokeWidth="5" />
        <circle cx="100" cy="110" r="8" stroke={INK} strokeWidth="4" />
      </g>
    </g>
  ),

  book: () => (
    <g>
      <Shadow rx={94} />
      <path d="M100 52 C76 40 30 38 8 46 V144 C30 136 76 138 100 150Z" fill={CLOUD} />
      <path d="M100 52 C124 40 170 38 192 46 V144 C170 136 124 138 100 150Z" fill="#f6f1e6" />
      <path d="M100 52 V150" stroke={SAND} strokeWidth="2" />
      {/* left page: a corner store */}
      <rect x="22" y="62" width="64" height="58" fill="#7ec3ff" />
      <rect x="28" y="80" width="52" height="40" fill={CORAL} />
      <rect x="28" y="74" width="52" height="8" fill={SUN} />
      <rect x="34" y="90" width="18" height="30" fill={INK} />
      <rect x="58" y="90" width="16" height="14" fill={CLOUD} opacity=".8" />
      <path d="M28 82 l6 6 l6 -6 l6 6 l6 -6 l6 6 l6 -6 l6 6 l4 -4" stroke={CLOUD} strokeWidth="2" fill="none" />
      {/* right page: caption */}
      <rect x="116" y="64" width="62" height="40" fill={INK2} />
      <rect x="122" y="80" width="22" height="24" fill={SUN} />
      <path d="M116 114 H172 M116 122 H160 M116 130 H168" stroke={STEEL} strokeWidth="2.4" />
    </g>
  ),

  lighthouse: () => (
    <g>
      <path d="M100 30 L-20 0 L-20 40Z" fill={SUN} opacity=".22" />
      <path d="M100 30 L220 0 L220 46Z" fill={SUN} opacity=".22" />
      <path d="M40 150 C50 124 150 124 160 150Z" fill={INK} />
      <path d="M78 136 L86 50 H114 L122 136Z" fill={CLOUD} />
      <path d="M81 108 H119 L121 124 H79Z M84 76 H116 L117 92 H83Z" fill={CORAL} />
      <rect x="82" y="40" width="36" height="12" rx="2" fill={INK} />
      <rect x="88" y="22" width="24" height="18" fill={SUN} />
      <circle cx="100" cy="31" r="16" fill={SUN} opacity=".35" />
      <path d="M84 22 L100 8 L116 22Z" fill={INK} />
    </g>
  ),

  easel: () => (
    <g>
      <Shadow rx={84} />
      <g stroke={WOODD} strokeWidth="5" strokeLinecap="round">
        <line x1="100" y1="6" x2="62" y2="150" />
        <line x1="100" y1="6" x2="138" y2="150" />
        <line x1="100" y1="6" x2="100" y2="150" />
        <line x1="66" y1="118" x2="134" y2="118" strokeWidth="6" />
      </g>
      <rect x="48" y="22" width="104" height="94" rx="2" fill={CLOUD} />
      <rect x="54" y="28" width="92" height="82" fill="#eaf3ff" />
      <circle cx="118" cy="56" r="16" fill={SUN} />
      <path d="M54 92 C76 74 96 100 118 86 S140 84 146 90 V110 H54Z" fill="#0b5cff" />
      <path d="M54 72 C70 64 84 74 96 66" stroke={CORAL} strokeWidth="5" fill="none" strokeLinecap="round" />
      {/* palette */}
      <path d="M150 138 C150 120 196 118 198 134 C200 148 186 146 180 150 H156 C150 150 150 146 150 138Z" fill={WOOD} />
      <circle cx="162" cy="134" r="4" fill={SUN} />
      <circle cx="174" cy="130" r="4" fill={CORAL} />
      <circle cx="186" cy="134" r="4" fill="#0b5cff" />
    </g>
  ),

  table: () => (
    <g>
      <Bulbs y={4} n={8} />
      <rect x="0" y="110" width="200" height="10" rx="3" fill={WOOD} />
      <rect x="14" y="120" width="8" height="30" fill={WOODD} />
      <rect x="178" y="120" width="8" height="30" fill={WOODD} />
      {[24, 64, 104, 144, 180].map((x, i) => (
        <g key={x}>
          <ellipse cx={x} cy="108" rx="14" ry="4" fill={CLOUD} />
          {i % 2 === 0 && <ellipse cx={x} cy="106" rx="8" ry="2.5" fill={i === 2 ? GREEN : CORAL} />}
        </g>
      ))}
      {[44, 124].map((x) => (
        <g key={x}>
          <rect x={x - 2} y="86" width="4" height="20" fill={CLOUD} />
          <path d={`M${x} 78 c4 4 4 8 0 9 c-4 -1 -4 -5 0 -9Z`} fill={SUN} />
        </g>
      ))}
      {[84, 162].map((x) => (
        <path key={x} d={`M${x - 5} 84 H${x + 5} L${x + 3} 98 H${x - 3}Z M${x} 98 V106 M${x - 5} 106 H${x + 5}`} fill={CORAL} stroke={CORAL} strokeWidth="1.2" opacity=".85" />
      ))}
    </g>
  ),

  volleyball: () => (
    <g>
      <ellipse cx="100" cy="146" rx="100" ry="10" fill={SAND} />
      <line x1="10" y1="30" x2="10" y2="146" stroke={INK} strokeWidth="5" />
      <line x1="190" y1="30" x2="190" y2="146" stroke={INK} strokeWidth="5" />
      <rect x="10" y="34" width="180" height="40" fill="none" stroke={INK} strokeWidth="1" opacity=".6" />
      <rect x="10" y="34" width="180" height="6" fill={CLOUD} />
      {Array.from({ length: 17 }, (_, i) => (
        <line key={i} x1={20 + i * 10} y1="40" x2={20 + i * 10} y2="74" stroke={INK} strokeWidth=".8" opacity=".45" />
      ))}
      {[50, 62].map((y) => (
        <line key={y} x1="10" y1={y} x2="190" y2={y} stroke={INK} strokeWidth=".8" opacity=".45" />
      ))}
      <g transform="translate(132 4)">
        <circle cx="0" cy="0" r="20" fill={CLOUD} />
        <path d="M-20 0 C-8 -6 8 -6 20 0 M-6 -19 C-14 -6 -12 10 -2 20 M8 -18 C2 -6 6 10 16 12" stroke={SUN} strokeWidth="3" fill="none" />
        <path d="M-18 8 C-8 4 8 6 16 12" stroke="#0b5cff" strokeWidth="2.4" fill="none" />
      </g>
    </g>
  ),

  turntable: () => (
    <g>
      <Shadow rx={96} />
      <rect x="4" y="84" width="192" height="64" rx="8" fill={INK2} />
      <rect x="4" y="84" width="192" height="8" rx="4" fill={INK} />
      <ellipse cx="62" cy="114" rx="48" ry="22" fill={INK} />
      <ellipse cx="62" cy="114" rx="38" ry="17" fill="none" stroke="#33477f" strokeWidth="1.2" />
      <ellipse cx="62" cy="114" rx="14" ry="6.5" fill={SUN} />
      <path d="M108 92 L102 108 L88 116" stroke={STEEL} strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* mixer */}
      <rect x="122" y="96" width="64" height="44" rx="5" fill={INK} />
      {[134, 152, 170].map((x) => (
        <circle key={x} cx={x} cy="108" r="5" fill={CORAL} />
      ))}
      <rect x="132" y="122" width="44" height="5" rx="2.5" fill={STEEL} />
      <rect x="148" y="119" width="10" height="11" rx="2" fill={SUN} />
      {/* records */}
      <circle cx="160" cy="50" r="28" fill={INK} />
      <circle cx="160" cy="50" r="9" fill={CORAL} />
      <rect x="112" y="34" width="38" height="44" rx="2" fill={SUN} transform="rotate(-8 130 56)" />
    </g>
  ),

  pasta: () => (
    <g>
      <Shadow rx={90} />
      <rect x="6" y="138" width="110" height="10" rx="5" fill={WOOD} transform="rotate(-6 60 143)" />
      <rect x="0" y="136" width="14" height="14" rx="7" fill={WOODD} transform="rotate(-6 60 143)" />
      <path d="M40 92 H170 C168 128 140 148 105 148 C70 148 42 128 40 92Z" fill={CLOUD} />
      <path d="M40 92 H170" stroke={SAND} strokeWidth="3" />
      <path d="M58 90 c8 -22 22 6 30 -16 c8 -22 22 8 30 -14 c8 -20 22 8 30 -10" stroke={SUN} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M62 92 c10 -12 18 4 28 -8 c10 -12 20 6 30 -6 c10 -12 18 4 26 -4" stroke={SUND} strokeWidth="4" fill="none" strokeLinecap="round" />
      <circle cx="96" cy="76" r="7" fill={RED} />
      <circle cx="128" cy="80" r="6" fill={RED} />
      <path d="M110 66 c-10 -10 0 -18 8 -12 c4 6 -2 10 -8 12Z" fill={GREEN} />
      <path d="M176 40 L150 112" stroke={STEEL} strokeWidth="4" strokeLinecap="round" />
      <path d="M170 40 L176 26 M176 40 L182 28 M182 42 L188 30" stroke={STEEL} strokeWidth="2.4" strokeLinecap="round" />
    </g>
  ),

  noodles: () => (
    <g>
      <Shadow rx={78} />
      <path d="M30 86 C40 50 120 34 150 56" stroke={CLOUD} strokeWidth="2" fill="none" opacity=".5" />
      <path d="M70 70 c-6-10 6-14 0-24 M100 66 c-6-10 6-14 0-24 M130 70 c-6-10 6-14 0-24" stroke={CLOUD} strokeWidth="2.4" fill="none" opacity=".7" />
      <path d="M26 92 H174 C172 128 142 150 100 150 C58 150 28 128 26 92Z" fill={INK2} />
      <path d="M26 92 H174" stroke={INK} strokeWidth="4" />
      <path d="M40 104 C70 112 130 112 160 104" stroke={CORAL} strokeWidth="3" fill="none" />
      <ellipse cx="100" cy="92" rx="70" ry="9" fill="#f2d9a0" />
      <path d="M50 90 c10-6 20 6 30 0 c10-6 20 6 30 0 c10-6 20 6 30 0" stroke={SUN} strokeWidth="3" fill="none" />
      <ellipse cx="70" cy="88" rx="11" ry="7" fill={CLOUD} />
      <ellipse cx="70" cy="88" rx="5" ry="4" fill={SUN} />
      <circle cx="128" cy="86" r="4" fill={GREEN} />
      <circle cx="138" cy="90" r="4" fill={GREEN} />
      <line x1="120" y1="10" x2="160" y2="96" stroke={WOOD} strokeWidth="4" strokeLinecap="round" />
      <line x1="134" y1="8" x2="168" y2="94" stroke={WOODD} strokeWidth="4" strokeLinecap="round" />
    </g>
  ),

  mic: () => (
    <g>
      <path d="M100 -40 L40 150 H160Z" fill={SUN} opacity=".22" />
      <Shadow rx={60} />
      <line x1="100" y1="48" x2="100" y2="146" stroke={INK} strokeWidth="4" />
      <path d="M80 150 L100 136 L120 150" stroke={INK} strokeWidth="4" fill="none" />
      <path d="M100 60 L118 40" stroke={INK} strokeWidth="4" />
      <rect x="110" y="14" width="20" height="36" rx="10" fill={INK2} transform="rotate(40 120 32)" />
      <rect x="112" y="16" width="16" height="17" rx="8" fill={STEEL} transform="rotate(40 120 32)" />
      {/* stool */}
      <ellipse cx="160" cy="112" rx="20" ry="5" fill={CORAL} />
      <path d="M146 114 L140 150 M174 114 L180 150 M150 134 H170" stroke={INK} strokeWidth="3" />
    </g>
  ),

  parachute: () => (
    <g>
      <path d="M30 40 C30 -6 170 -6 170 40 C150 30 130 32 116 40 C108 32 92 32 84 40 C70 32 50 30 30 40Z" fill={CORAL} />
      <path d="M58 10 C64 22 74 34 84 40 C92 32 108 32 116 40 C126 34 136 22 142 10 C116 0 84 0 58 10Z" fill={SUN} />
      <path d="M92 2 C94 16 98 30 100 38 C102 30 106 16 108 2 C102 1 98 1 92 2Z" fill={CLOUD} />
      <path d="M30 40 L96 112 M84 40 L98 112 M116 40 L102 112 M170 40 L104 112" stroke={INK} strokeWidth="1" opacity=".6" />
      <g fill={INK} transform="translate(100 112)">
        <circle cx="0" cy="0" r="5" />
        <path d="M-5 5 H5 L6 20 L10 34 H5 L1 22 L-1 22 L-5 34 H-10 L-6 20Z" />
        <path d="M-5 7 L-14 -4 M5 7 L14 -4" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
    </g>
  ),

  canoe: () => (
    <g>
      <path d="M2 116 C40 146 160 146 198 116 C150 126 50 126 2 116Z" fill={WOOD} />
      <path d="M2 116 C50 126 150 126 198 116 L190 112 C150 120 50 120 10 112Z" fill={WOODD} />
      {[50, 100, 150].map((x) => (
        <path key={x} d={`M${x} 121 C${x - 2} 130 ${x - 2} 136 ${x} 140`} stroke={WOODD} strokeWidth="1.4" opacity=".7" />
      ))}
      <line x1="40" y1="70" x2="128" y2="136" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="132" cy="140" rx="8" ry="14" fill={SUN} transform="rotate(-53 132 140)" />
      <path d="M0 150 q16-6 32 0 q16 6 32 0 M120 150 q16-6 32 0 q16 6 32 0" stroke={CLOUD} strokeWidth="2.4" fill="none" opacity=".75" />
    </g>
  ),

  barbell: () => (
    <g>
      <rect x="0" y="136" width="200" height="14" rx="2" fill={WOOD} />
      <path d="M0 143 H200" stroke={WOODD} strokeWidth="1.4" />
      <line x1="2" y1="104" x2="198" y2="104" stroke={STEEL} strokeWidth="6" strokeLinecap="round" />
      {[[22, CORAL, 34], [40, INK, 28], [160, INK, 28], [178, CORAL, 34]].map(([x, c, h]) => (
        <rect key={x as number} x={(x as number) - 7} y={104 - (h as number)} width="14" height={(h as number) * 2} rx="4" fill={c as string} />
      ))}
      <path d="M70 136 C70 124 90 120 100 120 C110 120 130 124 130 136Z" fill={CLOUD} />
      <ellipse cx="100" cy="128" rx="18" ry="3" fill="#e6e1d6" />
    </g>
  ),
};
