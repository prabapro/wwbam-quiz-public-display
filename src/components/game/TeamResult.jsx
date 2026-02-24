// src/components/game/TeamResult.jsx

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import WwbamShape from '@components/ui/WwbamShape';
import { formatPrize } from '@utils/formatters';
import { COPY_TEAM_RESULT } from '@constants/app';

// ── Outcome config ─────────────────────────────────────────────────────────────

const OUTCOME = {
  completed: {
    shapeState: 'correct',
    Icon: CheckCircle2,
    label: COPY_TEAM_RESULT.COMPLETED,
    iconColor: 'var(--c-green-light)',
  },
  eliminated: {
    shapeState: 'wrong',
    Icon: XCircle,
    label: COPY_TEAM_RESULT.ELIMINATED,
    iconColor: 'var(--c-red-light)',
  },
};

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
 *   team:           object,  - The team that just finished
 *   totalQuestions: number,  - Total questions in the prize structure (kept for API stability)
 * }} props
 */
export default function TeamResult({ team }) {
  if (!team) return null;

  const isCompleted = team.status === 'completed';
  const outcome = isCompleted ? OUTCOME.completed : OUTCOME.eliminated;
  const { Icon, iconColor } = outcome;
  const prize = team.currentPrize ?? 0;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{
        background: 'var(--c-screen-bg-overlay)',
        backdropFilter: 'blur(8px)',
      }}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <motion.div
        className="flex flex-col items-center gap-6 w-full max-w-3xl px-8"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit">
        {/* ── Status — icon + label ──────────────────────────────────────── */}
        <motion.div
          custom={0.3}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex">
          <WwbamShape
            size="compact"
            state={outcome.shapeState}
            strokeWidth={3}
            style={{ minHeight: '64px' }}>
            <div className="flex items-center justify-center gap-3 px-20 py-4 w-full text-center">
              <span style={{ color: iconColor, display: 'flex' }}>
                <Icon size={28} strokeWidth={2.5} />
              </span>
              <span
                className="wwbam-label"
                style={{ fontSize: '1rem', letterSpacing: '0.25em' }}>
                {outcome.label}
              </span>
            </div>
          </WwbamShape>
        </motion.div>

        {/* ── Team name ─────────────────────────────────────────────────── */}
        <motion.div
          custom={0.45}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex">
          <WwbamShape
            size="wide"
            state="selected"
            strokeWidth={4}
            className="flex-1"
            style={{ minHeight: '108px' }}>
            <div className="flex items-center justify-center py-5 w-full text-center">
              <h2 className="wwbam-overlay-heading">{team.name}</h2>
            </div>
          </WwbamShape>
        </motion.div>

        {/* ── Gold divider ───────────────────────────────────────────────── */}
        <motion.div
          custom={0.58}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex items-center gap-4 w-48">
          <span
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--c-gold-dark))',
            }}
          />
          <span
            style={{
              color: 'var(--c-gold)',
              fontFamily: 'var(--font-body)',
              fontSize: '0.85rem',
            }}>
            ✦
          </span>
          <span
            className="flex-1 h-px"
            style={{
              background:
                'linear-gradient(270deg, transparent, var(--c-gold-dark))',
            }}
          />
        </motion.div>

        {/* ── Takes Home + prize ─────────────────────────────────────────── */}
        <motion.div
          custom={0.7}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="flex"
          style={{ maxWidth: '72%', width: '100%' }}>
          <WwbamShape
            size="wide"
            state={outcome.shapeState}
            strokeWidth={2}
            className="flex-1"
            style={{ minHeight: '80px' }}>
            <div className="flex flex-col items-center justify-center gap-1 py-4 w-full text-center">
              <span className="wwbam-label" style={{ letterSpacing: '0.25em' }}>
                {COPY_TEAM_RESULT.TAKES_HOME}
              </span>
              <span
                className="wwbam-prize-display"
                style={{ fontSize: '2.2rem', whiteSpace: 'nowrap' }}>
                {formatPrize(prize)}
              </span>
            </div>
          </WwbamShape>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
