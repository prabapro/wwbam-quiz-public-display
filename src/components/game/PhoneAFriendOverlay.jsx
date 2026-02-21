// src/components/game/PhoneAFriendOverlay.jsx

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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

// ── Animation variants ─────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
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
 * Semi-transparent overlay shown during a Phone-a-Friend call.
 * The question and options remain visible behind it (rendered in GameScreen)
 * so participants can read them out without this overlay duplicating them.
 *
 * Only the timer is shown — anchored to the right side so it doesn't
 * obscure the question card on the left.
 *
 * @param {{
 *   startedAt:       number|null, - Unix ms timestamp from Firebase, null if not started
 *   durationSeconds: number,      - Call duration in seconds (from config)
 * }} props
 */
export default function PhoneAFriendOverlay({ startedAt, durationSeconds }) {
  return (
    <motion.div
      className="absolute inset-0 z-50 flex items-start justify-center pt-50 pr-72"
      style={{ background: 'rgba(10,10,46,0.20)' }}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <TimerDisplay startedAt={startedAt} durationSeconds={durationSeconds} />
    </motion.div>
  );
}
