// src/components/question/OptionGrid.jsx

import { motion, AnimatePresence } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Fixed display order for the four options. */
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Reads an option value from the Firebase options object.
 * Handles both lowercase keys (host panel normalises to lowercase) and uppercase.
 */
function getOptionText(options, key) {
  return options[key.toLowerCase()] ?? options[key];
}

// ── Option state derivation ────────────────────────────────────────────────────

/**
 * Derives the logical visual state for a single option button.
 *
 *   'default'  — idle, no selection yet
 *   'selected' — host has locked this answer, awaiting reveal
 *   'correct'  — answerRevealed + this is the correct option  → green
 *   'wrong'    — answerRevealed + this was selected incorrectly → red
 *   'dimmed'   — answerRevealed + neither selected nor correct (post-reveal bystanders)
 *   'removed'  — 50/50 lifeline eliminated this option
 */
function deriveOptionState(
  key,
  optionText,
  answerRevealed,
  correctOption,
  selectedOption,
) {
  if (optionText === null || optionText === undefined) return 'removed';

  if (answerRevealed) {
    if (key === correctOption) return 'correct';
    if (key === selectedOption) return 'wrong';
    return 'dimmed';
  }

  if (key === selectedOption) return 'selected';

  return 'default';
}

// ── WwbamShape state mapping ───────────────────────────────────────────────────

/**
 * Maps the logical option state to a WwbamShape `state` prop.
 *
 *   dimmed  → 'used'   — post-reveal bystanders: visible but clearly inactive
 *                        (slate shimmer, mirrors spent lifelines)
 *   removed → 'dimmed' — 50/50 eliminated: near-invisible layout placeholder
 *                        (WwbamShape "dimmed" is reserved for this exact purpose)
 */
const SHAPE_STATE = {
  default: 'default',
  selected: 'selected',
  correct: 'correct',
  wrong: 'wrong',
  dimmed: 'used', // post-reveal bystander
  removed: 'dimmed', // 50/50 placeholder
};

// ── Per-state text & badge colours (token-driven) ──────────────────────────────

const TEXT_COLOR = {
  default: 'var(--c-text)',
  selected: 'var(--c-text)',
  correct: 'var(--c-text)',
  wrong: 'var(--c-text)',
  dimmed: 'var(--c-used-text)',
  removed: 'transparent',
};

const BADGE_STYLE = {
  default: {
    background: 'rgba(255,255,255,0.12)',
    border: '1.5px solid rgba(255,255,255,0.2)',
    color: 'var(--c-text)',
  },
  selected: {
    background: 'rgba(245,158,11,0.2)',
    border: '1.5px solid rgba(245,158,11,0.45)',
    color: 'var(--c-gold-light)',
  },
  correct: {
    background: 'rgba(94,199,42,0.18)',
    border: '1.5px solid rgba(94,199,42,0.4)',
    color: 'var(--c-green-light)',
  },
  wrong: {
    background: 'rgba(224,48,48,0.18)',
    border: '1.5px solid rgba(224,48,48,0.4)',
    color: 'var(--c-red-light)',
  },
  dimmed: {
    background: 'rgba(255,255,255,0.04)',
    border: '1.5px solid rgba(255,255,255,0.07)',
    color: 'var(--c-used-text)',
  },
  removed: {
    background: 'transparent',
    border: 'none',
    color: 'transparent',
  },
};

// ── Animation variants ─────────────────────────────────────────────────────────

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const optionVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 12 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
};

// ── Option button ──────────────────────────────────────────────────────────────

/**
 * Single option button backed by WwbamShape.
 * Handles state-driven shape colour, text colour, badge colour, and Framer
 * Motion pulse animations (selected: continuous; correct/wrong: brief flash).
 */
function OptionButton({ optionKey, optionText, state }) {
  const shapeState = SHAPE_STATE[state] ?? 'default';
  const textColor = TEXT_COLOR[state] ?? 'var(--c-text)';
  const badgeStyle = BADGE_STYLE[state] ?? BADGE_STYLE.default;

  const pulseAnimate =
    state === 'selected'
      ? {
          scale: [1, 1.025, 1],
          transition: { duration: 1.4, repeat: Infinity },
        }
      : state === 'correct' || state === 'wrong'
        ? { scale: [1, 1.03, 1], transition: { duration: 0.35, repeat: 2 } }
        : {};

  return (
    <motion.div
      variants={optionVariants}
      animate={pulseAnimate}
      className="w-full flex">
      <WwbamShape
        size="medium"
        state={shapeState}
        strokeWidth={3}
        className="flex-1">
        {/* Skip rendering inner content for near-invisible removed placeholders */}
        {state !== 'removed' && (
          <div
            className="flex items-center gap-4 w-full py-4 cursor-default select-none"
            style={{ color: textColor, transition: 'color 0.4s ease' }}>
            {/* Option label badge (A / B / C / D) */}
            <span
              className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-sm font-black"
              style={{
                ...badgeStyle,
                transition:
                  'background 0.4s ease, border-color 0.4s ease, color 0.4s ease',
              }}>
              {optionKey}
            </span>

            {/* Option text */}
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '1.05rem',
                fontWeight: 600,
                lineHeight: 1.35,
                transition: 'color 0.4s ease',
              }}>
              {optionText}
            </span>
          </div>
        )}
      </WwbamShape>
    </motion.div>
  );
}

// ── OptionGrid ─────────────────────────────────────────────────────────────────

/**
 * OptionGrid
 *
 * Renders a 2×2 grid of WWBAM option buttons, each backed by WwbamShape.
 * Options stagger in A → B → C → D with 150 ms between each.
 *
 * State → WwbamShape mapping:
 *   default  → blue shimmer   (idle)
 *   selected → amber shimmer  (host locked answer, awaiting reveal)
 *   correct  → green shimmer  (answer revealed correct)
 *   wrong    → red shimmer    (answer revealed wrong)
 *   dimmed   → slate shimmer  (post-reveal bystander — visible but inactive)
 *   removed  → near-invisible (50/50 lifeline placeholder, preserves grid space)
 *
 * @param {{
 *   options:        { A: string, B: string, C: string, D: string } | null,
 *   optionsVisible: boolean,
 *   selectedOption: string | null,
 *   correctOption:  string | null,
 *   answerRevealed: boolean,
 *   activeLifeline: string | null,
 * }} props
 */
export default function OptionGrid({
  options,
  optionsVisible,
  selectedOption,
  correctOption,
  answerRevealed,
}) {
  return (
    <div className="w-full max-w-3xl">
      <AnimatePresence mode="wait">
        {optionsVisible && options ? (
          <motion.div
            key="options"
            variants={gridVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-2 gap-3">
            {OPTION_KEYS.map((key) => {
              const text = getOptionText(options, key);
              const state = deriveOptionState(
                key,
                text,
                answerRevealed,
                correctOption,
                selectedOption,
              );

              return (
                <OptionButton
                  key={key}
                  optionKey={key}
                  optionText={text}
                  state={state}
                />
              );
            })}
          </motion.div>
        ) : (
          <div key="placeholder" style={{ minHeight: '10rem', opacity: 0 }} />
        )}
      </AnimatePresence>
    </div>
  );
}
