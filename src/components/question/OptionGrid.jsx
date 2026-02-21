// src/components/question/OptionGrid.jsx

import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Fixed display order for the 4 options. */
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

/** WWBAM hexagon shape — wide elongated diamond. */
const HEXAGON_CLIP =
  'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Looks up an option value from the Firebase options object.
 *
 * The host panel writes option keys as lowercase ('a', 'b', 'c', 'd'),
 * but we display them as uppercase ('A', 'B', 'C', 'D'). This helper
 * handles both cases so we're resilient to either format in Firebase.
 *
 * @param {{ [key: string]: string|null }} options
 * @param {string} key - Uppercase key e.g. 'A'
 * @returns {string|null|undefined}
 */
function getOptionText(options, key) {
  // Prefer lowercase (what the host panel writes), fall back to uppercase
  return options[key.toLowerCase()] ?? options[key];
}

// ── Option state derivation ────────────────────────────────────────────────────

/**
 * Derives the visual state for a single option.
 *
 * States (per brief):
 *   'default'  → dark blue, no highlight
 *   'selected' → amber/orange — host locked this answer, awaiting reveal
 *   'correct'  → green — answerRevealed, this is the correct option
 *   'wrong'    → red  — answerRevealed, this was selected but is wrong
 *   'dimmed'   → grey — answerRevealed, neither selected nor correct
 *   'removed'  → hidden — 50/50 lifeline removed this option
 *
 * @param {string}      key           - 'A' | 'B' | 'C' | 'D'
 * @param {string|null} optionText    - null / undefined means 50/50 removed it
 * @param {boolean}     answerRevealed
 * @param {string|null} correctOption
 * @param {string|null} selectedOption
 * @returns {'default'|'selected'|'correct'|'wrong'|'dimmed'|'removed'}
 */
function deriveOptionState(
  key,
  optionText,
  answerRevealed,
  correctOption,
  selectedOption,
) {
  // 50/50 removed — null value means this option was stripped
  if (optionText === null || optionText === undefined) return 'removed';

  if (answerRevealed) {
    if (key === correctOption) return 'correct';
    if (key === selectedOption) return 'wrong';
    return 'dimmed';
  }

  if (key === selectedOption) return 'selected';

  return 'default';
}

// ── Style map ──────────────────────────────────────────────────────────────────

const STATE_STYLES = {
  default: {
    background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 100%)',
    border: '1.5px solid rgba(99,132,255,0.35)',
    color: '#ffffff',
    opacity: 1,
  },
  selected: {
    background: 'linear-gradient(135deg, #92400e 0%, #b45309 100%)',
    border: '1.5px solid rgba(245,158,11,0.7)',
    color: '#ffffff',
    opacity: 1,
    boxShadow: '0 0 24px rgba(180,83,9,0.5)',
  },
  correct: {
    background: 'linear-gradient(135deg, #14532d 0%, #15803d 100%)',
    border: '1.5px solid rgba(74,222,128,0.6)',
    color: '#ffffff',
    opacity: 1,
    boxShadow: '0 0 28px rgba(21,128,61,0.5)',
  },
  wrong: {
    background: 'linear-gradient(135deg, #7f1d1d 0%, #b91c1c 100%)',
    border: '1.5px solid rgba(248,113,113,0.6)',
    color: '#ffffff',
    opacity: 1,
    boxShadow: '0 0 24px rgba(185,28,28,0.4)',
  },
  dimmed: {
    background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 100%)',
    border: '1.5px solid rgba(99,132,255,0.1)',
    color: '#334155',
    opacity: 0.4,
  },
  removed: {
    opacity: 0,
    pointerEvents: 'none',
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
 * Single option button. Handles its own state-driven styling and animations.
 */
function OptionButton({ optionKey, optionText, state }) {
  const style = STATE_STYLES[state] ?? STATE_STYLES.default;

  // Pulse animation for 'selected' (suspense) and flash for reveal states
  const pulseAnimate =
    state === 'selected'
      ? { scale: [1, 1.02, 1], transition: { duration: 1.4, repeat: Infinity } }
      : state === 'correct' || state === 'wrong'
        ? { scale: [1, 1.03, 1], transition: { duration: 0.35, repeat: 2 } }
        : {};

  if (state === 'removed') return <div className="w-full" />;

  return (
    <motion.div
      variants={optionVariants}
      animate={pulseAnimate}
      className="w-full flex items-center"
      style={{ clipPath: HEXAGON_CLIP }}>
      <div
        className="w-full flex items-center gap-4 px-6 py-4 cursor-default select-none"
        style={{
          ...style,
          transition:
            'background 0.4s ease, border-color 0.4s ease, opacity 0.4s ease',
        }}>
        {/* Label badge */}
        <span
          className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-sm font-black"
          style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1.5px solid rgba(255,255,255,0.2)',
          }}>
          {optionKey}
        </span>

        {/* Option text */}
        <span className="text-base font-semibold leading-snug">
          {optionText}
        </span>
      </div>
    </motion.div>
  );
}

// ── OptionGrid ─────────────────────────────────────────────────────────────────

/**
 * OptionGrid
 *
 * Renders a 2×2 grid of WWBAM-style hexagon option buttons.
 * Each option's visual state is derived from Firebase game-state fields.
 * Options stagger in A → B → C → D with 150 ms between each.
 *
 * Renders nothing when `optionsVisible` is false.
 *
 * @param {{
 *   options:        { A: string, B: string, C: string, D: string } | null,
 *   optionsVisible: boolean,
 *   selectedOption: string|null,
 *   correctOption:  string|null,
 *   answerRevealed: boolean,
 *   activeLifeline: string|null,
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
          // Invisible placeholder keeps the layout from collapsing
          <div key="placeholder" style={{ minHeight: '10rem', opacity: 0 }} />
        )}
      </AnimatePresence>
    </div>
  );
}
