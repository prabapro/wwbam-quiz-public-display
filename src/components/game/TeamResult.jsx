// src/components/game/TeamResult.jsx

import { motion } from 'framer-motion';
import { formatPrize } from '@utils/formatters';

// ── Animation variants ─────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.88, y: 40 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.1 },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -24,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (delay) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay },
  }),
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const OUTCOME = {
  completed: {
    icon: '🏆',
    label: 'Completed!',
    labelColor: '#4ade80',
    glowColor: 'rgba(74,222,128,0.2)',
    borderColor: 'rgba(74,222,128,0.35)',
    background:
      'linear-gradient(160deg, rgba(21,128,61,0.3) 0%, rgba(10,10,46,0.95) 60%)',
    prizeColor: '#f59e0b',
  },
  eliminated: {
    icon: '💔',
    label: 'Eliminated',
    labelColor: '#f87171',
    glowColor: 'rgba(248,113,113,0.15)',
    borderColor: 'rgba(248,113,113,0.3)',
    background:
      'linear-gradient(160deg, rgba(185,28,28,0.25) 0%, rgba(10,10,46,0.95) 60%)',
    prizeColor: '#94a3b8',
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * TeamResult
 *
 * Full-screen overlay shown in GameScreen after a team finishes their run —
 * either eliminated (wrong answer) or completed (all questions answered).
 *
 * Timing: appears when `answerRevealed === true` AND `team.status` is
 * `eliminated` or `completed`. Dismissed automatically when the host
 * moves to the next team (currentTeamId changes / answerRevealed resets).
 *
 * Also handles the last-team edge case where `completeGame()` clears
 * `currentTeamId` — GameScreen passes the last team from the play queue.
 *
 * @param {{
 *   team:            object,   - The team that just finished
 *   totalQuestions:  number,   - Total questions in the prize structure
 * }} props
 */
export default function TeamResult({ team, totalQuestions }) {
  if (!team) return null;

  const isCompleted = team.status === 'completed';
  const outcome = isCompleted ? OUTCOME.completed : OUTCOME.eliminated;
  const prize = team.currentPrize ?? 0;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{
        background: 'rgba(10,10,46,0.88)',
        backdropFilter: 'blur(8px)',
      }}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <motion.div
        className="flex flex-col items-center gap-7 text-center px-20 py-14 rounded-3xl"
        style={{
          background: outcome.background,
          border: `1px solid ${outcome.borderColor}`,
          boxShadow: `0 0 80px ${outcome.glowColor}, inset 0 1px 0 rgba(255,255,255,0.05)`,
          minWidth: '580px',
        }}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit">
        {/* Outcome icon */}
        <motion.div
          custom={0.3}
          variants={itemVariants}
          initial="hidden"
          animate="visible">
          <motion.span
            className="text-7xl block"
            animate={
              isCompleted
                ? { rotate: [0, -8, 8, -5, 5, 0] }
                : { scale: [1, 0.9, 1.05, 0.97, 1] }
            }
            transition={{ delay: 0.6, duration: 0.7 }}>
            {outcome.icon}
          </motion.span>
        </motion.div>

        {/* Outcome label */}
        <motion.div
          custom={0.45}
          variants={itemVariants}
          initial="hidden"
          animate="visible">
          <span
            className="text-sm font-bold uppercase tracking-[0.4em]"
            style={{ color: outcome.labelColor }}>
            {outcome.label}
          </span>
        </motion.div>

        {/* Team name */}
        <motion.div
          custom={0.55}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-2">
          <h2
            className="text-6xl font-black tracking-wide text-white leading-tight"
            style={{ textShadow: '0 0 40px rgba(255,255,255,0.1)' }}>
            {team.name}
          </h2>

          {team.participants && (
            <p className="text-slate-400 text-lg font-medium">
              {team.participants}
            </p>
          )}
        </motion.div>

        {/* Divider */}
        <motion.div
          custom={0.65}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 w-56">
          <span
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${outcome.borderColor})`,
            }}
          />
          <span
            className="text-xs"
            style={{ color: outcome.labelColor, opacity: 0.5 }}>
            ✦
          </span>
          <span
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to left, transparent, ${outcome.borderColor})`,
            }}
          />
        </motion.div>

        {/* Prize won */}
        <motion.div
          custom={0.75}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-2">
          <p className="text-slate-500 text-xs uppercase tracking-widest">
            {isCompleted ? 'Prize Won' : 'Takes Home'}
          </p>
          <p
            className="text-5xl font-black font-mono"
            style={{
              color: outcome.prizeColor,
              textShadow: isCompleted
                ? '0 0 30px rgba(245,158,11,0.5)'
                : 'none',
            }}>
            {prize > 0 ? formatPrize(prize) : 'Rs. 0'}
          </p>
        </motion.div>

        {/* Questions answered (completed only) */}
        {isCompleted && totalQuestions && (
          <motion.div
            custom={0.85}
            variants={itemVariants}
            initial="hidden"
            animate="visible">
            <span
              className="text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{
                background: 'rgba(74,222,128,0.12)',
                color: '#4ade80',
                border: '1px solid rgba(74,222,128,0.25)',
              }}>
              All {totalQuestions} questions answered!
            </span>
          </motion.div>
        )}

        {/* Waiting indicator — entrance via variants, pulse via animate on inner element */}
        <motion.div
          custom={0.95}
          variants={itemVariants}
          initial="hidden"
          animate="visible">
          <motion.p
            className="text-slate-600 text-xs uppercase tracking-[0.3em]"
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1,
            }}>
            Waiting for host...
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
