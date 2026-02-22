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
 *             generous point extension, long whiskers
 *
 *   medium  — half-width elements: option buttons
 *             moderate point extension
 *
 *   compact — small elements: lifeline cards, prize badge, small labels
 *             reduced extension so tips don't dominate the narrow width
 *
 * Use the `size` prop. Override individual geometry via raw props if needed.
 *
 * ── SHAPE GEOMETRY ───────────────────────────────────────────────────────────
 *
 * Each pointed side uses two chained cubic bezier curves:
 *   Curve 1: corner → tip  (tangent is horizontal at corner)
 *   Curve 2: tip → corner  (tangent is horizontal at tip)
 *
 * Control point ratios extracted from the original WWBAM SVG asset:
 *   CP1_RATIO = 23.80302 / 62.53058 ≈ 0.381
 *   CP2_RATIO = 36.45760 / 62.53058 ≈ 0.583
 *
 * ── SVG TECHNIQUE ────────────────────────────────────────────────────────────
 *
 * - preserveAspectRatio="none"     → stretches to any container width
 * - vector-effect="non-scaling-stroke" → keeps stroke visually uniform
 * - SMIL animateTransform          → seamless gradient flow loop
 * - overflow: visible              → whiskers render outside SVG bounds
 *
 * ── USAGE ─────────────────────────────────────────────────────────────────────
 *
 *   // Named size preset (recommended)
 *   <WwbamShape size="wide" state="default">...</WwbamShape>
 *   <WwbamShape size="medium" state="selected">...</WwbamShape>
 *   <WwbamShape size="compact" state="default">...</WwbamShape>
 *
 *   // Custom geometry override
 *   <WwbamShape pointExtRatio={0.5} whiskerRatio={0.4}>...</WwbamShape>
 *
 * ── STATES ────────────────────────────────────────────────────────────────────
 *   default   — blue shimmer
 *   selected  — amber shimmer
 *   correct   — green shimmer
 *   wrong     — red shimmer
 *   dimmed    — near invisible
 *
 * @param {{
 *   children?:       React.ReactNode,
 *   size?:           'wide' | 'medium' | 'compact',
 *   state?:          'default' | 'selected' | 'correct' | 'wrong' | 'dimmed',
 *   strokeWidth?:    number,
 *   pointExtRatio?:  number,  — point extension as ratio of SVG_H (overrides preset)
 *   whiskerRatio?:   number,  — whisker length as ratio of pointExt (overrides preset)
 *   className?:      string,
 *   style?:          object,
 * }} props
 */

// ── Control point ratios from original WWBAM SVG ───────────────────────────

const CP1_RATIO = 23.80302 / 62.53058; // ≈ 0.381
const CP2_RATIO = 36.4576 / 62.53058; // ≈ 0.583

// ── Size presets ───────────────────────────────────────────────────────────
// pointExtRatio: how far the tip extends, as a multiple of SVG_H
// whiskerRatio:  whisker length as a fraction of pointExt

const SIZE_PRESETS = {
  wide: {
    pointExtRatio: 0.86, // generous — tips are bold and prominent
    whiskerRatio: 0.73, // long whiskers extend well beyond tip
  },
  medium: {
    pointExtRatio: 0.55, // moderate — balanced for half-width elements
    whiskerRatio: 0.55,
  },
  compact: {
    pointExtRatio: 0.32, // subtle — tips visible but don't dominate
    whiskerRatio: 0.4,
  },
};

// ── Internal SVG coordinate space ─────────────────────────────────────────

const SVG_H = 100; // height units (width is nominal; scaled by preserveAspectRatio)
const SVG_W = 600; // nominal width
const MID = SVG_H / 2;

// ── State configurations ───────────────────────────────────────────────────

const STATE_CONFIG = {
  default: {
    fill: '#06090f',
    stops: ['#1a4fcf', '#4a8fe8', '#8ab8ff', '#4a8fe8', '#1a4fcf'],
    dur: '3s',
  },
  selected: {
    fill: '#080500',
    stops: ['#7c3a00', '#e8920a', '#f5c842', '#e8920a', '#7c3a00'],
    dur: '2s',
  },
  correct: {
    fill: '#051802',
    stops: ['#2d8010', '#5ec72a', '#90e05a', '#5ec72a', '#2d8010'],
    dur: '2.5s',
  },
  wrong: {
    fill: '#130101',
    stops: ['#8b0000', '#e03030', '#ff6060', '#e03030', '#8b0000'],
    dur: '2.5s',
  },
  dimmed: {
    fill: '#030508',
    stops: ['#141a24', '#1e2738', '#141a24', '#1e2738', '#141a24'],
    dur: '8s',
  },
};

// ── Path builder ───────────────────────────────────────────────────────────

function buildPaths(pointExt, whiskerLen) {
  const CP1 = CP1_RATIO * pointExt;
  const CP2 = CP2_RATIO * pointExt;

  // Main shape: flat top/bottom, smooth cubic bezier pointed sides
  const shape = [
    `M ${SVG_W} 0`,
    `L 0 0`,
    // Left side: top-left → left tip → bottom-left
    `C ${-CP1} 0, ${-CP2} ${MID}, ${-pointExt} ${MID}`,
    `C ${-CP2} ${MID}, ${-CP1} ${SVG_H}, 0 ${SVG_H}`,
    `L ${SVG_W} ${SVG_H}`,
    // Right side: bottom-right → right tip → top-right
    `C ${SVG_W + CP1} ${SVG_H}, ${SVG_W + CP2} ${MID}, ${SVG_W + pointExt} ${MID}`,
    `C ${SVG_W + CP2} ${MID}, ${SVG_W + CP1} 0, ${SVG_W} 0`,
    'Z',
  ].join(' ');

  // Whisker lines extending beyond each tip
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
  pointExtRatio, // override preset if provided
  whiskerRatio, // override preset if provided
  className = '',
  style = {},
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `wg-${uid}`;
  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.default;

  // Resolve geometry — prop overrides take priority over preset
  const preset = SIZE_PRESETS[size] ?? SIZE_PRESETS.wide;
  const pRatio = pointExtRatio ?? preset.pointExtRatio;
  const wRatio = whiskerRatio ?? preset.whiskerRatio;
  const pointExt = SVG_H * pRatio;
  const whiskerLen = pointExt * wRatio;

  const { shape, whiskers } = buildPaths(pointExt, whiskerLen);

  // ViewBox expands to include stroke overflow + whiskers on both sides
  const pad = pointExt + whiskerLen + strokeWidth + 2;
  const vx = -pad;
  const vy = -(strokeWidth + 1);
  const vw = SVG_W + pad * 2;
  const vh = SVG_H + (strokeWidth + 1) * 2;

  // Content padding as % of viewBox width — keeps children clear of tips
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
          {/*
            Gradient spans SVG_W units, tiles via spreadMethod="repeat".
            SMIL animateTransform shifts by SVG_W per cycle → seamless loop.
          */}
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

        {/* Filled shape with animated neon border */}
        <path
          d={shape}
          fill={cfg.fill}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Whisker lines */}
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
