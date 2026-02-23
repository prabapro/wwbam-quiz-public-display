// src/components/ui/WwbamShape.jsx

import { useId } from 'react';

/**
 * WwbamShape
 *
 * Renders the authentic WWBAM TV show shape — a rectangle with smooth
 * rounded corners and outward pointed ends on left and right, with whisker
 * lines extending beyond each tip, and an animated gradient stroke.
 *
 * ── SIZE PRESETS ─────────────────────────────────────────────────────────────
 *
 *   wide    — full-width bars: TeamInfoBar, QuestionCard
 *   medium  — half-width elements: option buttons
 *   compact — small elements: lifeline cards, prize badge, small labels
 *
 * ── STATES ────────────────────────────────────────────────────────────────────
 *
 *   default   — blue shimmer   (available, idle)
 *   selected  — amber shimmer  (active lifeline, locked answer)
 *   correct   — green shimmer  (correct answer revealed)
 *   wrong     — red shimmer    (wrong answer revealed)
 *   used      — slate shimmer  (spent lifeline, disabled option — visible but clearly inactive)
 *   dimmed    — near-invisible (layout placeholder only — 50/50 removed options)
 *
 * ── COLOUR TOKENS ─────────────────────────────────────────────────────────────
 *
 * SHAPE_TOKENS mirrors the palette groups in src/styles/tokens.css.
 * SVG cannot consume CSS custom properties via url() gradients, so we maintain
 * a parallel JS constant object. Any colour change must be updated in BOTH files.
 *
 * ── SHAPE GEOMETRY ───────────────────────────────────────────────────────────
 *
 * Each pointed side uses two chained cubic bezier curves:
 *   CP1_RATIO = 23.80302 / 62.53058 ≈ 0.381
 *   CP2_RATIO = 36.45760 / 62.53058 ≈ 0.583
 *
 * @param {{
 *   children?:       React.ReactNode,
 *   size?:           'wide' | 'medium' | 'compact',
 *   state?:          'default' | 'selected' | 'correct' | 'wrong' | 'used' | 'dimmed',
 *   strokeWidth?:    number,
 *   pointExtRatio?:  number,
 *   whiskerRatio?:   number,
 *   className?:      string,
 *   style?:          object,
 * }} props
 */

// ── Shape colour tokens (mirrors src/styles/tokens.css palette groups) ─────
// SVG linearGradient cannot use CSS custom properties, so these JS constants
// are the single source of truth for all shape stroke and fill colours.
// When updating a colour, change it here AND in tokens.css.

const SHAPE_TOKENS = {
  // Gold / amber — selected state, active lifeline
  goldDeep: '#7c3a00', // --c-gold-deep
  goldDark: '#e8920a', // --c-gold-dark
  goldLight: '#f5c842', // --c-gold-light

  // Blue — default state
  blueDeep: '#1a4fcf', // --c-blue-deep
  blueMid: '#4a8fe8', // --c-blue-mid
  blueLight: '#8ab8ff', // --c-blue-light

  // Green — correct state
  greenDeep: '#2d8010', // --c-green-deep
  greenMid: '#5ec72a', // --c-green-mid
  greenLight: '#90e05a', // --c-green-light

  // Red — wrong state
  redDeep: '#8b0000', // --c-red-deep
  redMid: '#e03030', // --c-red-mid
  redLight: '#ff6060', // --c-red-light

  // Slate — used / spent state (visible but clearly inactive)
  usedFill: '#080c14', // --c-used-fill
  usedStrokeDeep: '#1c2738', // --c-used-stroke-deep
  usedStrokeMid: '#2a3a52', // --c-used-stroke-mid
  usedStrokeLight: '#3a5068', // --c-used-stroke-light

  // Dimmed — layout placeholder only (near invisible)
  dimmedFill: '#030508', // --c-dimmed-fill
  dimmedStroke1: '#141a24', // --c-dimmed-stroke1
  dimmedStroke2: '#1e2738', // --c-dimmed-stroke2
};

// ── Shape fills (background inside the stroke) ─────────────────────────────
// Kept as separate local constants to keep STATE_CONFIG readable.
//
// correct / wrong fills are intentionally rich and saturated so the
// background colour change is clearly visible to the audience at TV distance —
// not just the stroke colour change.

const FILLS = {
  default: '#06090f',
  selected: '#1a0e00',
  correct: '#0b2e10', // rich dark green — clearly green at TV distance
  wrong: '#2e0b0b', // rich dark red   — clearly red   at TV distance
  used: SHAPE_TOKENS.usedFill,
  dimmed: SHAPE_TOKENS.dimmedFill,
};

// ── State configurations ───────────────────────────────────────────────────
// stops: array of 5 colour values → [start, inner, peak, inner, end]
// Symmetric so the SMIL translateX animation creates a seamless shimmer loop.

const STATE_CONFIG = {
  default: {
    fill: FILLS.default,
    stops: [
      SHAPE_TOKENS.blueDeep,
      SHAPE_TOKENS.blueMid,
      SHAPE_TOKENS.blueLight,
      SHAPE_TOKENS.blueMid,
      SHAPE_TOKENS.blueDeep,
    ],
    dur: '3s',
  },
  selected: {
    fill: FILLS.selected,
    stops: [
      SHAPE_TOKENS.goldDeep,
      SHAPE_TOKENS.goldDark,
      SHAPE_TOKENS.goldLight,
      SHAPE_TOKENS.goldDark,
      SHAPE_TOKENS.goldDeep,
    ],
    dur: '2s',
  },
  correct: {
    fill: FILLS.correct,
    stops: [
      SHAPE_TOKENS.greenDeep,
      SHAPE_TOKENS.greenMid,
      SHAPE_TOKENS.greenLight,
      SHAPE_TOKENS.greenMid,
      SHAPE_TOKENS.greenDeep,
    ],
    dur: '2.5s',
  },
  wrong: {
    fill: FILLS.wrong,
    stops: [
      SHAPE_TOKENS.redDeep,
      SHAPE_TOKENS.redMid,
      SHAPE_TOKENS.redLight,
      SHAPE_TOKENS.redMid,
      SHAPE_TOKENS.redDeep,
    ],
    dur: '2.5s',
  },
  // Spent lifeline, disabled option — still fully readable, clearly inactive
  used: {
    fill: FILLS.used,
    stops: [
      SHAPE_TOKENS.usedStrokeDeep,
      SHAPE_TOKENS.usedStrokeMid,
      SHAPE_TOKENS.usedStrokeLight,
      SHAPE_TOKENS.usedStrokeMid,
      SHAPE_TOKENS.usedStrokeDeep,
    ],
    dur: '6s',
  },
  // Near-invisible placeholder — preserves grid space (e.g. 50/50 removed options)
  dimmed: {
    fill: FILLS.dimmed,
    stops: [
      SHAPE_TOKENS.dimmedStroke1,
      SHAPE_TOKENS.dimmedStroke2,
      SHAPE_TOKENS.dimmedStroke1,
      SHAPE_TOKENS.dimmedStroke2,
      SHAPE_TOKENS.dimmedStroke1,
    ],
    dur: '8s',
  },
};

// ── Size presets ───────────────────────────────────────────────────────────

const SIZE_PRESETS = {
  wide: { pointExtRatio: 1.6, whiskerRatio: 0.35 },
  medium: { pointExtRatio: 1.8, whiskerRatio: 0.35 },
  compact: { pointExtRatio: 2.0, whiskerRatio: 0.35 },
};

// ── Internal SVG coordinate space ─────────────────────────────────────────

const SVG_H = 100;
const SVG_W = 600;
const MID = SVG_H / 2;

const CP1_RATIO = 23.80302 / 62.53058; // ≈ 0.381
const CP2_RATIO = 36.4576 / 62.53058; // ≈ 0.583

// ── Path builder ───────────────────────────────────────────────────────────

function buildPaths(pointExt, whiskerLen) {
  const CP1 = CP1_RATIO * pointExt;
  const CP2 = CP2_RATIO * pointExt;

  const shape = [
    `M ${SVG_W} 0`,
    `L 0 0`,
    `C ${-CP1} 0, ${-CP2} ${MID}, ${-pointExt} ${MID}`,
    `C ${-CP2} ${MID}, ${-CP1} ${SVG_H}, 0 ${SVG_H}`,
    `L ${SVG_W} ${SVG_H}`,
    `C ${SVG_W + CP1} ${SVG_H}, ${SVG_W + CP2} ${MID}, ${SVG_W + pointExt} ${MID}`,
    `C ${SVG_W + CP2} ${MID}, ${SVG_W + CP1} 0, ${SVG_W} 0`,
    'Z',
  ].join(' ');

  const whiskers = [
    `M ${-pointExt} ${MID} L ${-pointExt - whiskerLen} ${MID}`,
    `M ${SVG_W + pointExt} ${MID} L ${SVG_W + pointExt + whiskerLen} ${MID}`,
  ].join(' ');

  return { shape, whiskers };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function WwbamShape({
  children,
  size = 'wide',
  state = 'default',
  strokeWidth = 3,
  pointExtRatio,
  whiskerRatio,
  className = '',
  style = {},
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `wg-${uid}`;
  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.default;

  const preset = SIZE_PRESETS[size] ?? SIZE_PRESETS.wide;
  const pRatio = pointExtRatio ?? preset.pointExtRatio;
  const wRatio = whiskerRatio ?? preset.whiskerRatio;
  const pointExt = SVG_H * pRatio;
  const whiskerLen = pointExt * wRatio;

  const { shape, whiskers } = buildPaths(pointExt, whiskerLen);

  const pad = pointExt + whiskerLen + strokeWidth + 2;
  const vx = -pad;
  const vy = -(strokeWidth + 1);
  const vw = SVG_W + pad * 2;
  const vh = SVG_H + (strokeWidth + 1) * 2;

  const padPct = ((pad / vw) * 100).toFixed(2);

  const stops = cfg.stops.map((color, i) => ({
    offset: `${(i / (cfg.stops.length - 1)) * 100}%`,
    color,
  }));

  return (
    <div className={`relative flex ${className}`} style={style}>
      {/* Responsive SVG — absolutely fills container */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        viewBox={`${vx} ${vy} ${vw} ${vh}`}
        preserveAspectRatio="none">
        <defs>
          <linearGradient
            id={gradId}
            gradientUnits="userSpaceOnUse"
            x1="0"
            y1="0"
            x2={SVG_W}
            y2="0"
            spreadMethod="repeat">
            {stops.map(({ offset, color }) => (
              <stop key={offset} offset={offset} stopColor={color} />
            ))}
            <animateTransform
              attributeName="gradientTransform"
              type="translate"
              from="0 0"
              to={`${SVG_W} 0`}
              dur={cfg.dur}
              repeatCount="indefinite"
            />
          </linearGradient>
        </defs>

        <path
          d={shape}
          fill={cfg.fill}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        <path
          d={whiskers}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Content — padded horizontally to clear tips and whiskers */}
      <div
        className="relative z-10 flex flex-1 min-w-0 w-full"
        style={{
          paddingLeft: `${padPct}%`,
          paddingRight: `${padPct}%`,
        }}>
        {children}
      </div>
    </div>
  );
}
