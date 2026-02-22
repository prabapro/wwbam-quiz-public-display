// src/components/ui/WwbamShape.jsx

import { useId } from 'react';

/**
 * WwbamShape
 *
 * Renders the authentic WWBAM TV show shape using an SVG path derived
 * directly from the original show SVG asset.
 *
 * ── SHAPE ANATOMY ───────────────────────────────────────────────────────────
 *
 *         whisker ◄──────── flat top edge ────────► whisker
 *     ────────────╮                               ╭────────────
 *                  ╲                             ╱
 *    ◄── tip ───────◄  (left pointed side)       (right pointed side)  ► tip ─────►
 *                  ╱                             ╲
 *     ────────────╯                               ╰────────────
 *
 * Each pointed side is made of TWO chained cubic bezier curves:
 *   - Curve 1: from corner → tip  (starts tangentially horizontal at corner)
 *   - Curve 2: from tip → corner  (also tangentially horizontal at tip)
 *
 * This gives:
 *   - Soft rounded-feel at corners (tangent is flat → no sharp angle)
 *   - Clean smooth point at the tip (both curves arrive/leave horizontally)
 *
 * Control point ratios are taken directly from the original SVG file:
 *   CP1_RATIO = 23.80302 / 62.53058 ≈ 0.381
 *   CP2_RATIO = 36.45760 / 62.53058 ≈ 0.583
 *
 * ── SVG TECHNIQUE ───────────────────────────────────────────────────────────
 *
 * The SVG is absolutely positioned over the container (position: absolute).
 * overflow: visible allows whiskers and stroke to render outside bounds.
 * preserveAspectRatio="none" stretches the path to any container width.
 * vector-effect="non-scaling-stroke" keeps stroke visually consistent.
 *
 * The animated gradient uses SMIL animateTransform to translate the gradient
 * by one full pattern width per loop — creating a seamless flowing shimmer.
 *
 * ── USAGE ────────────────────────────────────────────────────────────────────
 *
 *   <WwbamShape state="default">
 *     <div className="flex items-center px-6 py-3">content</div>
 *   </WwbamShape>
 *
 * ── STATES ───────────────────────────────────────────────────────────────────
 *   default   — blue shimmer  (question card, option buttons, top bar)
 *   selected  — amber shimmer (option chosen by team)
 *   correct   — green static  (correct answer reveal)
 *   wrong     — red static    (wrong answer)
 *   dimmed    — near invisible (other options after reveal)
 *
 * @param {{
 *   children:      React.ReactNode,
 *   state?:        'default'|'selected'|'correct'|'wrong'|'dimmed',
 *   strokeWidth?:  number,  — visual stroke thickness in px (default 3)
 *   className?:    string,
 *   style?:        object,
 * }} props
 */

// ── Shape constants from original WWBAM SVG ────────────────────────────────

// Control point ratios extracted from the original SVG path data
const CP1_RATIO = 23.80302 / 62.53058; // ≈ 0.381
const CP2_RATIO = 36.4576 / 62.53058; // ≈ 0.583

// Internal SVG coordinate space
// H is fixed; W is nominal (preserveAspectRatio="none" stretches to container)
const SVG_H = 100; // height units
const SVG_W = 600; // nominal width (scales to container)
const POINT_EXT = SVG_H * 0.866; // point extension ≈ P/H ratio from original SVG
const WHISKER_LEN = POINT_EXT * 0.73; // whisker ratio from original SVG
const MID = SVG_H / 2;

// Pre-computed control point offsets
const CP1 = CP1_RATIO * POINT_EXT; // ≈ 33.1
const CP2 = CP2_RATIO * POINT_EXT; // ≈ 50.5

// ── SVG paths ─────────────────────────────────────────────────────────────

/**
 * Main filled shape path.
 * Goes: top-right → top-left → left-tip → bottom-left → bottom-right → right-tip → close
 *
 * Starts at top-right corner (W, 0) and traces counter-clockwise.
 * Left side uses two chained cubics via the 'C' command.
 * Right side mirrors the left.
 */
const SHAPE_PATH = [
  `M ${SVG_W} 0`,
  `L 0 0`,
  // Left side: top-left corner → left tip → bottom-left corner
  `C ${-CP1} 0, ${-CP2} ${MID}, ${-POINT_EXT} ${MID}`,
  `C ${-CP2} ${MID}, ${-CP1} ${SVG_H}, 0 ${SVG_H}`,
  `L ${SVG_W} ${SVG_H}`,
  // Right side: bottom-right corner → right tip → top-right corner
  `C ${SVG_W + CP1} ${SVG_H}, ${SVG_W + CP2} ${MID}, ${SVG_W + POINT_EXT} ${MID}`,
  `C ${SVG_W + CP2} ${MID}, ${SVG_W + CP1} 0, ${SVG_W} 0`,
  'Z',
].join(' ');

/** Whisker lines extending beyond each tip */
const LEFT_WHISKER = `M ${-POINT_EXT} ${MID} L ${-POINT_EXT - WHISKER_LEN} ${MID}`;
const RIGHT_WHISKER = `M ${SVG_W + POINT_EXT} ${MID} L ${SVG_W + POINT_EXT + WHISKER_LEN} ${MID}`;

// ── ViewBox (includes stroke and whisker overflow) ─────────────────────────

const PADDING = POINT_EXT + WHISKER_LEN + 4; // extra 4 for stroke overflow
const VIEWBOX = {
  x: -PADDING,
  y: -4,
  w: SVG_W + PADDING * 2,
  h: SVG_H + 8,
};

// Content horizontal padding as % of rendered width so children clear the tips
const CONTENT_PAD_PCT = (
  ((POINT_EXT + WHISKER_LEN + 4) / VIEWBOX.w) *
  100
).toFixed(2);

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
    stops: ['#1a2030', '#1a2030', '#1a2030', '#1a2030', '#1a2030'],
    dur: '999s',
  },
};

// ── Component ──────────────────────────────────────────────────────────────

export default function WwbamShape({
  children,
  state = 'default',
  strokeWidth = 3,
  className = '',
  style = {},
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gradId = `wg-${uid}`;
  const cfg = STATE_CONFIG[state] ?? STATE_CONFIG.default;

  const stops = cfg.stops.map((color, i) => ({
    offset: `${(i / (cfg.stops.length - 1)) * 100}%`,
    color,
  }));

  return (
    <div className={`relative flex ${className}`} style={style}>
      {/* SVG border + fill — absolutely overlaid on the container */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 w-full h-full overflow-visible pointer-events-none"
        viewBox={`${VIEWBOX.x} ${VIEWBOX.y} ${VIEWBOX.w} ${VIEWBOX.h}`}
        preserveAspectRatio="none">
        <defs>
          {/*
            Gradient spans SVG_W units with spreadMethod="repeat" so it tiles.
            animateTransform shifts it by SVG_W each cycle → seamless loop.
            gradientUnits="userSpaceOnUse" anchors coords in SVG space.
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

        {/* Filled shape with neon border */}
        <path
          d={SHAPE_PATH}
          fill={cfg.fill}
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {/* Whisker lines — same animated gradient stroke */}
        <path
          d={`${LEFT_WHISKER} ${RIGHT_WHISKER}`}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      {/* Content — sits above the SVG, padded to clear pointed ends + whiskers */}
      <div
        className="relative z-10 flex flex-1 min-w-0 w-full"
        style={{
          paddingLeft: `${CONTENT_PAD_PCT}%`,
          paddingRight: `${CONTENT_PAD_PCT}%`,
        }}>
        {children}
      </div>
    </div>
  );
}
