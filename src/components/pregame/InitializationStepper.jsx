// src/components/pregame/InitializationStepper.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';
import { COPY_STEPPER } from '@constants/app';

// ── Step definitions ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Preparing teams' },
  { id: 2, label: 'Preparing question sets' },
  { id: 3, label: 'Randomizing team order' },
  { id: 4, label: 'Assigning question sets to teams' },
];

// Delay (ms) after which each step is marked as complete.
const STEP_COMPLETE_DELAYS = [900, 2000, 3300, 4700];

// Delay after the last step completes before calling onComplete.
const COMPLETION_DELAY = 5800;

// ── Shape state mapping ────────────────────────────────────────────────────────

/**
 * Maps step status to WwbamShape state.
 *   complete → 'correct'  (green shimmer)
 *   active   → 'selected' (amber shimmer)
 *   pending  → 'used'     (slate/muted — not yet reached)
 */
function shapeStateFor(isComplete, isActive) {
  if (isComplete) return 'correct';
  if (isActive) return 'selected';
  return 'used';
}

// ── Animation variants ─────────────────────────────────────────────────────────

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.25 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: 'easeOut' },
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * StepNumber
 *
 * The left-side number badge rendered inside each WwbamShape.
 * Animates between a plain number (pending/active) and a checkmark (complete).
 */
function StepNumber({ number, isComplete, isActive }) {
  return (
    <div className="flex items-center justify-center w-8 shrink-0">
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.svg
            key="check"
            width="18"
            height="18"
            viewBox="0 0 14 14"
            fill="none"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { type: 'spring', stiffness: 340, damping: 18 },
            }}
            exit={{ opacity: 0 }}>
            <path
              d="M2.5 7L5.5 10L11.5 4"
              stroke="var(--c-green-light)"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </motion.svg>
        ) : (
          <motion.span
            key="number"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              fontFamily: 'var(--font-numeric)',
              fontSize: '1rem',
              color: isActive ? 'var(--c-gold)' : 'var(--c-used-text)',
            }}>
            {number}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * StepRow
 *
 * A single initialization step rendered as a WwbamShape.
 * The shape's state (colour) transitions automatically as the step progresses.
 */
function StepRow({ step, isComplete, isActive }) {
  const shapeState = shapeStateFor(isComplete, isActive);

  const labelColor = isComplete
    ? 'var(--c-text)'
    : isActive
      ? 'var(--c-gold)'
      : 'var(--c-used-text)';

  return (
    <motion.div variants={rowVariants} className="w-full">
      <WwbamShape
        size="compact"
        state={shapeState}
        strokeWidth={3}
        style={{ minHeight: '52px', transition: 'all 0.4s ease' }}>
        <div className="flex items-center gap-4 py-2 w-full">
          <StepNumber
            number={step.id}
            isComplete={isComplete}
            isActive={isActive}
          />
          {/* Vertical rule */}
          <div
            className="w-px self-stretch"
            style={{ background: 'rgba(255,255,255,0.1)' }}
          />
          {/* Label */}
          <span
            className="text-base font-semibold tracking-wide transition-colors duration-500"
            style={{ fontFamily: 'var(--font-condensed)', color: labelColor }}>
            {step.label}
          </span>
          {/* Active pulse dot — right side */}
          {isActive && (
            <motion.span
              className="ml-auto mr-2 w-2 h-2 rounded-full shrink-0"
              style={{ background: 'var(--c-gold)' }}
              animate={{ opacity: [1, 0.2, 1] }}
              transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
            />
          )}
        </div>
      </WwbamShape>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * InitializationStepper
 *
 * Plays a timed step-by-step animation sequence when the host triggers game
 * initialization. Runs entirely on the display side — no Firebase writes.
 *
 * Each step is rendered as a WwbamShape that transitions through states:
 *   used (pending) → selected (active, amber) → correct (complete, green)
 *
 * Steps complete on a fixed schedule (STEP_COMPLETE_DELAYS). Once all steps
 * are done, fires `onComplete` after a brief final pause so the audience can
 * read the completed state before the IdleScreen transitions to "ready".
 *
 * @param {{ onComplete: () => void }} props
 */
export default function InitializationStepper({ onComplete }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    const timers = [];

    STEP_COMPLETE_DELAYS.forEach((delay, index) => {
      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => new Set([...prev, index + 1]));
        }, delay),
      );
    });

    timers.push(setTimeout(onComplete, COMPLETION_DELAY));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  const activeStepId = STEPS.find((s) => !completedSteps.has(s.id))?.id ?? null;
  const allDone = completedSteps.size === STEPS.length;

  return (
    <div className="flex flex-col items-center gap-10">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-2 text-center"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}>
        <p
          className="text-xs font-bold uppercase tracking-[0.4em]"
          style={{ color: 'var(--c-gold)' }}>
          {COPY_STEPPER.EYEBROW}
        </p>
        <h2
          className="text-4xl font-black uppercase tracking-widest text-white"
          style={{
            fontFamily: 'var(--font-condensed)',
            textShadow: '0 0 40px rgba(245,158,11,0.3)',
          }}>
          {COPY_STEPPER.HEADING}
        </h2>
      </motion.div>

      {/* Step list */}
      <motion.div
        className="flex flex-col gap-3 w-full max-w-lg"
        variants={listVariants}
        initial="hidden"
        animate="visible">
        {STEPS.map((step) => (
          <StepRow
            key={step.id}
            step={step}
            isComplete={completedSteps.has(step.id)}
            isActive={activeStepId === step.id}
          />
        ))}
      </motion.div>

      {/* "All done" confirmation */}
      <AnimatePresence>
        {allDone && (
          <motion.p
            className="text-sm font-bold tracking-[0.35em] uppercase"
            style={{ color: 'var(--c-green-mid)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}>
            {COPY_STEPPER.COMPLETE_MESSAGE}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
