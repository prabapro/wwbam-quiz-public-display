// src/components/pregame/InitializationStepper.jsx

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  BookOpen,
  Shuffle,
  ClipboardList,
  Check,
  Loader2,
} from 'lucide-react';
import WwbamShape from '@components/ui/WwbamShape';
import { COPY_STEPPER } from '@constants/app';

// ── Step definitions ───────────────────────────────────────────────────────────

/**
 * Each step has a Lucide icon that replaces the old plain number badge.
 * The icon transitions to a Check (via Lucide) when the step completes.
 */
const STEPS = [
  { id: 1, label: 'Preparing Teams', Icon: Users },
  { id: 2, label: 'Preparing Question Sets', Icon: BookOpen },
  { id: 3, label: 'Randomizing Team Order', Icon: Shuffle },
  { id: 4, label: 'Assigning Question Sets to Teams', Icon: ClipboardList },
];

// Delay (ms) after which each step is marked as complete.
const STEP_COMPLETE_DELAYS = [1200, 2400, 3600, 4800];

// Delay after the last step completes before calling onComplete.
const COMPLETION_DELAY = 7000;

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
 * StepIcon
 *
 * Left-side icon badge rendered inside each WwbamShape.
 * Animates between the step's Lucide icon (pending / active) and
 * a Lucide Check (complete) with a spring pop transition.
 *
 * @param {{ Icon: LucideIcon, isComplete: boolean, isActive: boolean }} props
 */
function StepIcon({ Icon, isComplete, isActive }) {
  const iconColor = isComplete
    ? 'var(--c-green-light)'
    : isActive
      ? 'var(--c-gold)'
      : 'var(--c-used-text)';

  return (
    <div className="flex items-center justify-center w-10 shrink-0">
      <AnimatePresence mode="wait">
        {isComplete ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { type: 'spring', stiffness: 340, damping: 18 },
            }}
            exit={{ opacity: 0 }}>
            <Check size={26} color="var(--c-green-light)" strokeWidth={2.5} />
          </motion.div>
        ) : (
          <motion.div
            key="icon"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}>
            <Icon size={26} color={iconColor} strokeWidth={1.8} />
          </motion.div>
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
 *
 * Layout: [ StepIcon ] | [ separator ] | [ label ] | [ Loader2 if active ]
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
        size="wide"
        state={shapeState}
        strokeWidth={3}
        style={{ minHeight: '80px', transition: 'all 0.4s ease' }}>
        <div className="flex items-center gap-5 py-3 px-2 w-full">
          {/* Step Lucide icon — swaps to Check on complete */}
          <StepIcon
            Icon={step.Icon}
            isComplete={isComplete}
            isActive={isActive}
          />

          {/* Vertical separator */}
          <div
            className="w-px self-stretch"
            style={{ background: 'rgba(255,255,255,0.12)' }}
          />

          {/* Step label */}
          <span
            className="flex-1 transition-colors duration-500 uppercase"
            style={{
              fontFamily: 'var(--font-condensed)',
              fontSize: '1.6rem',
              fontWeight: 700,
              letterSpacing: '0.06em',
              lineHeight: 1.1,
              color: labelColor,
            }}>
            {step.label}
          </span>

          {/* Active spinner — Loader2 spinning on the right edge */}
          <AnimatePresence>
            {isActive && (
              <motion.div
                className="shrink-0 mr-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ color: 'var(--c-gold)' }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1.1,
                    repeat: Infinity,
                    ease: 'linear',
                  }}>
                  <Loader2 size={22} strokeWidth={2} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
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
 * Typography and layout match the LobbyPhase / ReadyPhase screens:
 *   - Eyebrow: wwbam-label + wwbam-text-gold-gradient
 *   - Heading: var(--font-condensed) at 3.4rem uppercase gold gradient
 *   - Step labels: var(--font-condensed) at 1.6rem uppercase
 *   - Icons: Lucide at 26px, colour driven by step state
 *   - "All done": WwbamShape correct + condensed uppercase text
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
    <div className="flex flex-col items-center gap-8 w-full max-w-3xl">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}>
        {/* Eyebrow — matches AppEyebrow style from IdleScreen */}
        <p
          className="wwbam-label wwbam-text-gold-gradient"
          style={{ letterSpacing: '0.4em' }}>
          {COPY_STEPPER.EYEBROW}
        </p>

        {/* Main heading — matches LobbyPhase / ReadyPhase heading scale */}
        <h2
          className="wwbam-text-gold-gradient"
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '3.4rem',
            fontWeight: 900,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}>
          {COPY_STEPPER.HEADING}
        </h2>
      </motion.div>

      {/* ── Step list ────────────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col gap-3 w-full"
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

      {/* ── "All done" confirmation — WwbamShape correct ─────────────────── */}
      <AnimatePresence>
        {allDone && (
          <motion.div
            className="w-full flex"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
            exit={{ opacity: 0 }}>
            <WwbamShape
              size="wide"
              state="correct"
              strokeWidth={3}
              className="flex-1"
              style={{ minHeight: '64px' }}>
              <div className="flex items-center justify-center gap-3 py-3 w-full">
                <Check
                  size={22}
                  color="var(--c-green-light)"
                  strokeWidth={2.5}
                />
                <p
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: '1.4rem',
                    fontWeight: 700,
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    color: 'var(--c-green-light)',
                  }}>
                  {COPY_STEPPER.COMPLETE_MESSAGE}
                </p>
              </div>
            </WwbamShape>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
