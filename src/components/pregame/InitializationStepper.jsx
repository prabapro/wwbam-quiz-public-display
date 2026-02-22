// src/components/pregame/InitializationStepper.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Step definitions ───────────────────────────────────────────────────────────

const STEPS = [
  { id: 1, label: 'Preparing teams', icon: '👥' },
  { id: 2, label: 'Preparing question sets', icon: '📋' },
  { id: 3, label: 'Randomizing team order', icon: '🔀' },
  { id: 4, label: 'Assigning question sets to teams', icon: '✅' },
];

// Delay (ms) after which each step is marked as complete.
// Must finish comfortably before the host presses "Start Game".
const STEP_COMPLETE_DELAYS = [900, 2000, 3300, 4700];

// Delay after the last step completes before calling onComplete.
const COMPLETION_DELAY = 5800;

// ── Animation variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18, delayChildren: 0.2 },
  },
};

const stepRowVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const checkVariants = {
  hidden: { opacity: 0, scale: 0.4 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 320, damping: 18 },
  },
};

const pulseRingVariants = {
  animate: {
    scale: [1, 1.5, 1],
    opacity: [0.6, 0, 0.6],
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeOut' },
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * StepRow — renders a single initialization step with its status indicator.
 */
function StepRow({ step, isComplete, isActive }) {
  return (
    <motion.div variants={stepRowVariants} className="flex items-center gap-5">
      {/* Status indicator */}
      <div className="relative flex items-center justify-center w-8 h-8 shrink-0">
        <AnimatePresence mode="wait">
          {isComplete ? (
            // Checkmark
            <motion.div
              key="check"
              variants={checkVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center justify-center w-8 h-8 rounded-full"
              style={{
                background: 'rgba(46,128,16,0.25)',
                border: '1.5px solid rgba(94,199,42,0.6)',
              }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M2.5 7L5.5 10L11.5 4"
                  stroke="#5ec72a"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.div>
          ) : isActive ? (
            // Pulsing ring for the in-progress step
            <motion.div
              key="active"
              className="relative flex items-center justify-center">
              <motion.div
                className="absolute w-8 h-8 rounded-full"
                style={{ border: '1.5px solid rgba(245,158,11,0.5)' }}
                variants={pulseRingVariants}
                animate="animate"
              />
              <div
                className="w-5 h-5 rounded-full"
                style={{
                  background: 'rgba(245,158,11,0.3)',
                  border: '1.5px solid rgba(245,158,11,0.7)',
                }}
              />
            </motion.div>
          ) : (
            // Pending (not yet reached)
            <motion.div
              key="pending"
              className="w-5 h-5 rounded-full"
              style={{
                border: '1.5px solid rgba(255,255,255,0.15)',
                background: 'transparent',
              }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* Step icon + label */}
      <div className="flex items-center gap-3">
        <span className="text-lg" role="img" aria-hidden="true">
          {step.icon}
        </span>
        <span
          className="text-lg font-semibold tracking-wide transition-colors duration-300"
          style={{
            fontFamily: 'var(--font-condensed)',
            color: isComplete
              ? 'rgba(255,255,255,0.9)'
              : isActive
                ? 'var(--c-gold)'
                : 'rgba(255,255,255,0.3)',
          }}>
          {step.label}
        </span>
      </div>
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
 * Steps complete on a fixed schedule (STEP_COMPLETE_DELAYS). Once all steps
 * are done, fires `onComplete` after a brief final pause so the audience can
 * read the completed state before transitioning to the "ready" phase.
 *
 * @param {{ onComplete: () => void }} props
 */
export default function InitializationStepper({ onComplete }) {
  const [completedSteps, setCompletedSteps] = useState(new Set());

  useEffect(() => {
    const timers = [];

    // Schedule each step completion
    STEP_COMPLETE_DELAYS.forEach((delay, index) => {
      timers.push(
        setTimeout(() => {
          setCompletedSteps((prev) => new Set([...prev, index + 1]));
        }, delay),
      );
    });

    // Fire completion callback after final pause
    timers.push(setTimeout(onComplete, COMPLETION_DELAY));

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  // The "active" step is the first one not yet complete
  const activeStepId = STEPS.find((s) => !completedSteps.has(s.id))?.id ?? null;

  return (
    <div className="flex flex-col items-center gap-12">
      {/* Header */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}>
        <p
          className="text-sm font-bold uppercase tracking-[0.35em]"
          style={{ color: 'var(--c-gold)' }}>
          Initializing
        </p>
        <h2
          className="text-4xl font-black uppercase tracking-widest text-white"
          style={{
            fontFamily: 'var(--font-condensed)',
            textShadow: '0 0 40px rgba(245,158,11,0.3)',
          }}>
          Setting Up the Game
        </h2>
      </motion.div>

      {/* Step list */}
      <motion.div
        className="flex flex-col gap-6"
        variants={containerVariants}
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

      {/* "All done" flash when last step completes */}
      <AnimatePresence>
        {completedSteps.size === STEPS.length && (
          <motion.p
            className="text-base font-semibold tracking-widest uppercase"
            style={{ color: 'var(--c-green-mid)' }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}>
            ✦ &nbsp; Ready to play &nbsp; ✦
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
