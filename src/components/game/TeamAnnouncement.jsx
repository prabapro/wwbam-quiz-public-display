// src/components/game/TeamAnnouncement.jsx

import { motion } from 'framer-motion';
import { formatPrize } from '@utils/formatters';

// ── Animation variants ─────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.35 } },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut', delay: 0.15 },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -20,
    transition: { duration: 0.35, ease: 'easeIn' },
  },
};

const labelVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, delay: 0.4 } },
};

const nameVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.55 } },
};

const detailVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 0.75 } },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * TeamAnnouncement
 *
 * Full-screen overlay displayed in GameScreen when a team is active but
 * hasn't started their questions yet (currentQuestionNumber === 0).
 *
 * Triggered by the host calling nextTeam() or at game start — both reset
 * currentQuestionNumber to 0 and clear questionVisible, giving the display
 * a clean window to introduce the upcoming team before gameplay begins.
 *
 * Dismisses automatically once the host loads the first question
 * (currentQuestionNumber advances to 1).
 *
 * @param {{
 *   team:          object,         - Current team object from useTeams
 *   queuePosition: number,         - 1-based position in the play queue
 *   queueTotal:    number,         - Total number of teams in the queue
 *   prizeStructure: number[],      - Full prize structure array
 * }} props
 */
export default function TeamAnnouncement({
  team,
  queuePosition,
  queueTotal,
  prizeStructure,
}) {
  if (!team) return null;

  const topPrize = prizeStructure?.length
    ? prizeStructure[prizeStructure.length - 1]
    : null;

  const isFirstTeam = queuePosition === 1;

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{ background: 'rgba(10,10,46,0.92)', backdropFilter: 'blur(6px)' }}
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <motion.div
        className="flex flex-col items-center gap-8 text-center px-16"
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        exit="exit">
        {/* Queue position pill */}
        <motion.div
          variants={labelVariants}
          className="flex items-center gap-3">
          <span className="h-px w-12 bg-amber-400/30" />
          <span
            className="text-xs font-bold uppercase tracking-[0.3em]"
            style={{ color: '#f59e0b' }}>
            {isFirstTeam
              ? 'First Up'
              : `Team ${queuePosition} of ${queueTotal}`}
          </span>
          <span className="h-px w-12 bg-amber-400/30" />
        </motion.div>

        {/* Team name */}
        <motion.div
          variants={nameVariants}
          className="flex flex-col items-center gap-3">
          <p className="text-slate-400 text-sm uppercase tracking-widest">
            Now Playing
          </p>
          <h2
            className="text-7xl font-black tracking-wide text-white leading-tight"
            style={{ textShadow: '0 0 60px rgba(245,158,11,0.3)' }}>
            {team.name}
          </h2>
        </motion.div>

        {/* Participants */}
        {team.participants && (
          <motion.div
            variants={detailVariants}
            className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs uppercase tracking-widest">
              Players
            </p>
            <p className="text-slate-200 text-xl font-medium">
              {team.participants}
            </p>
          </motion.div>
        )}

        {/* Divider */}
        <motion.div
          variants={detailVariants}
          className="flex items-center gap-4 w-64">
          <span className="flex-1 h-px bg-linear-to-r from-transparent to-amber-400/30" />
          <span className="text-amber-400/40 text-sm">✦</span>
          <span className="flex-1 h-px bg-linear-to-l from-transparent to-amber-400/30" />
        </motion.div>

        {/* Top prize */}
        {topPrize && (
          <motion.div
            variants={detailVariants}
            className="flex flex-col items-center gap-2">
            <p className="text-slate-500 text-xs uppercase tracking-widest">
              Playing for
            </p>
            <p
              className="text-4xl font-black font-mono"
              style={{
                color: '#f59e0b',
                textShadow: '0 0 30px rgba(245,158,11,0.4)',
              }}>
              {formatPrize(topPrize)}
            </p>
          </motion.div>
        )}

        {/* Waiting indicator */}
        <motion.p
          variants={detailVariants}
          className="text-slate-500 text-xs uppercase tracking-[0.3em]"
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          Waiting for host...
        </motion.p>
      </motion.div>
    </motion.div>
  );
}
