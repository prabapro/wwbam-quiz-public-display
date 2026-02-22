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
 * @param {number|null} startedAt       - Unix ms timestamp from Firebase, or null
 * @param {number}      durationSeconds - Total call duration in seconds (from config)
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

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

const barVariants = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * PhoneAFriendOverlay
 *
 * Full-width bottom bar shown during a Phone-a-Friend call.
 * Slides up from the bottom with an orange background and a large
 * MM:SS countdown. Turns red when expiring (≤10 s).
 *
 * Before the host starts the timer, the bar is visible but shows
 * "—:—" with a pulsing "Call in progress" label so the audience
 * knows a call is happening even without the countdown.
 *
 * Prop alignment note:
 *   GameScreen passes `timerDuration` — this component accepts `timerDuration`
 *   and forwards it internally as `durationSeconds` to the hook.
 *
 * @param {{
 *   startedAt:     number|null, - Unix ms timestamp from Firebase, null if not started
 *   timerDuration: number,      - Call duration in seconds (from config)
 * }} props
 */
export default function PhoneAFriendOverlay({ startedAt, timerDuration }) {
  const { display, hasStarted, isExpiring, progressPct } =
    useTimestampCountdown(startedAt, timerDuration);

  // Colour shifts from orange → red as time runs out
  const bgColor = isExpiring
    ? 'linear-gradient(90deg, #b91c1c 0%, #dc2626 50%, #b91c1c 100%)'
    : 'linear-gradient(90deg, #c2410c 0%, #ea580c 50%, #c2410c 100%)';

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ pointerEvents: 'none' }}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <motion.div
        className="w-full flex flex-col"
        variants={barVariants}
        initial="hidden"
        animate="visible"
        exit="exit">
        {/* Progress bar — thin strip above the bar, drains left to right */}
        <div className="w-full h-1 bg-black/20">
          <motion.div
            className="h-full bg-white/40"
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, ease: 'linear' }}
          />
        </div>

        {/* Main bar */}
        <div
          className="w-full flex items-center justify-between px-16 py-5"
          style={{ background: bgColor, transition: 'background 1s ease' }}>
          {/* Left — label */}
          <motion.div
            className="flex items-center gap-3"
            animate={!hasStarted ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
            transition={{
              duration: 1.6,
              repeat: hasStarted ? 0 : Infinity,
              ease: 'easeInOut',
            }}>
            <span className="text-2xl">📞</span>
            <div className="flex flex-col">
              <span className="text-white font-black text-lg uppercase tracking-widest">
                Phone a Friend
              </span>
              <span className="text-orange-200 text-xs uppercase tracking-[0.3em]">
                {hasStarted ? 'Timer running' : 'Call in progress'}
              </span>
            </div>
          </motion.div>

          {/* Right — countdown */}
          <AnimatePresence mode="wait">
            {!hasStarted ? (
              <motion.span
                key="waiting"
                className="font-black font-mono text-white/40"
                style={{ fontSize: '4rem', lineHeight: 1 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}>
                --:--
              </motion.span>
            ) : (
              <motion.span
                key="countdown"
                className="font-black font-mono text-white tabular-nums"
                style={{ fontSize: '4rem', lineHeight: 1 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={
                  isExpiring
                    ? { opacity: 1, scale: [1, 1.05, 1] }
                    : { opacity: 1, scale: 1 }
                }
                transition={{
                  duration: isExpiring ? 0.6 : 0.3,
                  repeat: isExpiring ? Infinity : 0,
                  ease: 'easeInOut',
                }}>
                {display}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
