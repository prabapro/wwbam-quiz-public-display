// src/components/game/PhoneAFriendOverlay.jsx

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Fixed display order for options. */
const OPTION_KEYS = ['A', 'B', 'C', 'D'];

/** WWBAM hexagon clip-path. */
const HEXAGON_CLIP =
  'polygon(2% 0%, 98% 0%, 100% 50%, 98% 100%, 2% 100%, 0% 50%)';

// ── Timestamp-based countdown hook ────────────────────────────────────────────

/**
 * useTimestampCountdown
 *
 * Derives remaining seconds from a Firebase Unix ms timestamp rather than
 * counting down from a fixed duration on mount. This means a display that
 * reconnects mid-call shows the correct remaining time instead of restarting.
 *
 * States:
 *   startedAt === null  → timer not started yet (host hasn't clicked Start Timer)
 *   startedAt is set    → compute remaining = duration - elapsed; tick every second
 *   remaining <= 0      → expired
 *
 * @param {number|null} startedAt       - Unix ms timestamp from Firebase, or null
 * @param {number}      durationSeconds - Total call duration (from config)
 */
function useTimestampCountdown(startedAt, durationSeconds) {
  const computeRemaining = () => {
    if (!startedAt) return durationSeconds;
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    return Math.max(0, durationSeconds - elapsed);
  };

  const [secondsLeft, setSecondsLeft] = useState(computeRemaining);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Recalculate immediately when startedAt changes (e.g. on reconnect)
    setSecondsLeft(computeRemaining());

    if (!startedAt) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setSecondsLeft(computeRemaining());
    }, 1000);

    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startedAt, durationSeconds]);

  const hasStarted = startedAt !== null;
  const hasExpired = hasStarted && secondsLeft <= 0;
  const isExpiring = hasStarted && secondsLeft <= 10 && !hasExpired;
  const progressPct = hasStarted ? (secondsLeft / durationSeconds) * 100 : 100;

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return {
    secondsLeft,
    display,
    progressPct,
    hasStarted,
    hasExpired,
    isExpiring,
  };
}

// ── Option display ─────────────────────────────────────────────────────────────

function OptionRow({ optionKey, optionText }) {
  if (!optionText) return null;
  return (
    <div
      className="flex items-center gap-3 px-5 py-3"
      style={{
        clipPath: HEXAGON_CLIP,
        background: 'linear-gradient(135deg, #0d1b4b 0%, #1a3a8f 100%)',
        border: '1.5px solid rgba(99,132,255,0.25)',
      }}>
      <span
        className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full text-sm font-black text-white"
        style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1.5px solid rgba(255,255,255,0.2)',
        }}>
        {optionKey}
      </span>
      <span className="text-white text-sm font-semibold">{optionText}</span>
    </div>
  );
}

// ── Animation variants ─────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 },
  },
  exit: { opacity: 0, y: -16, transition: { duration: 0.3 } },
};

// ── Timer display ──────────────────────────────────────────────────────────────

function TimerDisplay({ startedAt, durationSeconds }) {
  const { secondsLeft, progressPct, hasStarted, isExpiring } =
    useTimestampCountdown(startedAt, durationSeconds);

  const RADIUS = 54;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const strokeDashoffset = CIRCUMFERENCE - (progressPct / 100) * CIRCUMFERENCE;
  const ringColor = isExpiring ? '#f87171' : '#3b82f6';
  const timeColor = isExpiring ? '#f87171' : '#ffffff';

  return (
    <div className="shrink-0 flex flex-col items-center justify-center gap-5">
      {/* Top: 📞 Call in progress — always visible, pulses until timer starts */}
      <motion.div
        className="flex items-center gap-2"
        animate={!hasStarted ? { opacity: [1, 0.45, 1] } : { opacity: 1 }}
        transition={{
          duration: 2,
          repeat: hasStarted ? 0 : Infinity,
          ease: 'easeInOut',
        }}>
        <span className="text-xl">📞</span>
        <p className="text-slate-300 text-sm font-semibold tracking-wide">
          Call in progress
        </p>
      </motion.div>

      {/* Middle: ring with seconds (or dash before timer starts) */}
      <div className="relative w-44 h-44">
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="8"
          />
          <circle
            cx="64"
            cy="64"
            r={RADIUS}
            fill="none"
            stroke={ringColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            style={{
              transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease',
            }}
          />
        </svg>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.p
                key="dash"
                className="text-4xl font-black font-mono leading-none text-slate-600"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                —
              </motion.p>
            ) : (
              <motion.p
                key="countdown"
                className="font-black font-mono leading-none"
                style={{
                  color: timeColor,
                  fontSize: secondsLeft >= 10 ? '3.5rem' : '4rem',
                }}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={
                  isExpiring
                    ? { opacity: 1, scale: [1, 1.06, 1] }
                    : { opacity: 1, scale: 1 }
                }
                transition={{
                  duration: 1,
                  repeat: isExpiring ? Infinity : 0,
                  ease: 'easeInOut',
                }}>
                {secondsLeft}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom: "seconds" label — only once timer is running */}
      <div className="h-5 flex items-center justify-center">
        <AnimatePresence mode="wait">
          {hasStarted && (
            <motion.p
              key="unit"
              className="text-xs uppercase tracking-[0.3em]"
              style={{ color: isExpiring ? '#f87171' : '#64748b' }}
              initial={{ opacity: 0, y: 4 }}
              animate={
                isExpiring
                  ? { opacity: [1, 0.4, 1], y: 0 }
                  : { opacity: 1, y: 0 }
              }
              exit={{ opacity: 0 }}
              transition={
                isExpiring
                  ? { duration: 0.8, repeat: Infinity }
                  : { duration: 0.3 }
              }>
              {isExpiring ? 'seconds left!' : 'seconds'}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * PhoneAFriendOverlay
 *
 * Full-screen overlay shown when `activeLifeline === 'phone-a-friend'` and
 * `gameStatus === 'paused'`. Replaces the generic pause screen.
 *
 * Timer sync strategy:
 *   - Host activates lifeline → overlay appears (timer ring shows "waiting")
 *   - Host clicks "Start Timer" → host panel writes `lifelineTimerStartedAt`
 *     (Unix ms) to Firebase game-state
 *   - This component reads `startedAt` and derives remaining seconds via:
 *       remaining = duration - floor((now - startedAt) / 1000)
 *   - Reconnects show the correct remaining time automatically — no restart
 *   - Host resumes (manual or timer expiry) → `lifelineTimerStartedAt` set
 *     to null + `activeLifeline` cleared → overlay exits via AnimatePresence
 *
 * @param {{
 *   question:        object|null,  - currentQuestion from game-state
 *   options:         object|null,  - question.options { a, b, c, d }
 *   startedAt:       number|null,  - Unix ms from Firebase, null if not started
 *   durationSeconds: number,       - Phone-a-friend call duration (from config)
 * }} props
 */
export default function PhoneAFriendOverlay({
  question,
  options,
  startedAt,
  durationSeconds,
}) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-center justify-center gap-12 px-12"
      style={{ background: 'rgba(10,10,46,0.92)', backdropFilter: 'blur(6px)' }}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <motion.div
        className="flex items-start gap-10 w-full max-w-5xl"
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="exit">
        {/* ── Left: Question + Options ───────────────────────────────────── */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Header */}
          <div className="flex items-center gap-3">
            <span className="text-2xl">📞</span>
            <p className="text-blue-400 text-sm font-bold uppercase tracking-[0.3em]">
              Phone-a-Friend
            </p>
          </div>

          {/* Question text */}
          {question?.text && (
            <div
              className="px-6 py-5 rounded-xl"
              style={{
                background: 'linear-gradient(135deg, #0d1b4b 0%, #0a1535 100%)',
                border: '1px solid rgba(99,132,255,0.25)',
                boxShadow: '0 0 30px rgba(26,58,143,0.2)',
              }}>
              <p className="text-white text-xl font-bold leading-snug text-center">
                {question.text}
              </p>
            </div>
          )}

          {/* Options */}
          {options && (
            <div className="grid grid-cols-2 gap-2">
              {OPTION_KEYS.map((key) => {
                const text = options[key.toLowerCase()] ?? options[key];
                return (
                  <OptionRow key={key} optionKey={key} optionText={text} />
                );
              })}
            </div>
          )}
        </div>

        {/* ── Right: Timer ──────────────────────────────────────────────── */}
        <TimerDisplay startedAt={startedAt} durationSeconds={durationSeconds} />
      </motion.div>
    </motion.div>
  );
}
