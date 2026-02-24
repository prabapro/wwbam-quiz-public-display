// src/components/game/PhoneAFriendOverlay.jsx

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone } from 'lucide-react';
import WwbamShape from '@components/ui/WwbamShape';
import { COPY_PHONE_A_FRIEND } from '@constants/app';

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

  return { display, progressPct, hasStarted, hasExpired, isExpiring };
}

// ── Animation variants ─────────────────────────────────────────────────────────

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

const barVariants = {
  hidden: { y: 80, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    y: 80,
    opacity: 0,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * PhoneAFriendOverlay
 *
 * Floating bar shown at the bottom of GameScreen during a Phone-a-Friend call.
 * Slides up from below with breathing room from the screen edge.
 *
 * The countdown is visualised as a fill drain inside the WwbamShape — the shape's
 * fillProgress prop renders a tinted rect clipped precisely to the shape boundary,
 * draining from right to left as time runs out.
 *
 * States:
 *   - Not started : amber (selected) shape, pulsing label, --:-- countdown
 *   - Timer running: amber (selected) shape, live MM:SS countdown, drain active
 *   - Expiring (≤10s): red (wrong) shape, pulsing countdown, red drain
 *
 * @param {{
 *   startedAt:     number|null, - Unix ms timestamp from Firebase, null if not started
 *   timerDuration: number,      - Call duration in seconds (from config)
 * }} props
 */
export default function PhoneAFriendOverlay({ startedAt, timerDuration }) {
  const { display, progressPct, hasStarted, isExpiring } =
    useTimestampCountdown(startedAt, timerDuration);

  const shapeState = isExpiring ? 'wrong' : 'selected';
  const iconColor = isExpiring ? 'var(--c-red-light)' : 'var(--c-gold)';

  // Fill tint colours — semi-transparent so the shape's own fill shows through
  const fillColor = isExpiring
    ? 'rgba(224, 48, 48, 0.28)'
    : 'rgba(232, 146, 10, 0.22)';

  return (
    <motion.div
      className="absolute inset-0 z-50 flex flex-col justify-end px-8 pb-10"
      style={{ pointerEvents: 'none' }}
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <motion.div
        className="w-full"
        variants={barVariants}
        initial="hidden"
        animate="visible"
        exit="exit">
        <WwbamShape
          size="wide"
          state={shapeState}
          strokeWidth={5}
          fillProgress={hasStarted ? progressPct : undefined}
          fillColor={fillColor}
          className="w-full"
          style={{ minHeight: '120px' }}>
          <div className="flex items-center justify-between w-full px-10 py-5">
            {/* Left — icon + label */}
            <motion.div
              className="flex items-center gap-4"
              animate={!hasStarted ? { opacity: [1, 0.5, 1] } : { opacity: 1 }}
              transition={{
                duration: 1.6,
                repeat: hasStarted ? 0 : Infinity,
                ease: 'easeInOut',
              }}>
              <span style={{ color: iconColor, display: 'flex' }}>
                <Phone size={30} strokeWidth={2} />
              </span>
              <div className="flex flex-col">
                <span
                  className="wwbam-label"
                  style={{ fontSize: '1rem', letterSpacing: '0.2em' }}>
                  {COPY_PHONE_A_FRIEND.TITLE}
                </span>
                <span
                  className="wwbam-label"
                  style={{
                    color: 'var(--c-used-text)',
                    letterSpacing: '0.2em',
                  }}>
                  {hasStarted
                    ? COPY_PHONE_A_FRIEND.TIMER_RUNNING
                    : COPY_PHONE_A_FRIEND.CALL_IN_PROGRESS}
                </span>
              </div>
            </motion.div>

            {/* Right — countdown */}
            <AnimatePresence mode="wait">
              {!hasStarted ? (
                <motion.span
                  key="waiting"
                  style={{
                    fontFamily: 'var(--font-numeric)',
                    fontSize: '3.5rem',
                    lineHeight: 1,
                    color: 'var(--c-used-text)',
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}>
                  --:--
                </motion.span>
              ) : (
                <motion.span
                  key="countdown"
                  style={{
                    fontFamily: 'var(--font-numeric)',
                    fontSize: '3.5rem',
                    lineHeight: 1,
                    color: isExpiring ? 'var(--c-red-light)' : 'var(--c-gold)',
                  }}
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
        </WwbamShape>
      </motion.div>
    </motion.div>
  );
}
