// src/components/game/TeamAnnouncement.jsx

import { motion } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';
import { COPY_ANNOUNCEMENT } from '@constants/app';
import { splitParticipants } from '@utils/participants';

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

const dividerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4, delay: 0.7 } },
};

const playersVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.8 },
  },
};

const playerItemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
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
 *   team:           object,    - Current team object from useTeams
 *   queuePosition:  number,    - 1-based position in the play queue
 *   queueTotal:     number,    - Total number of teams in the queue (unused, kept for API stability)
 *   prizeStructure: number[],  - Full prize structure array (unused, kept for API stability)
 * }} props
 */
export default function TeamAnnouncement({
  team,
  queuePosition,
  // eslint-disable-next-line no-unused-vars
  queueTotal,
  // eslint-disable-next-line no-unused-vars
  prizeStructure,
}) {
  if (!team) return null;

  const isFirstTeam = queuePosition === 1;
  const positionLabel = isFirstTeam
    ? COPY_ANNOUNCEMENT.FIRST_UP
    : COPY_ANNOUNCEMENT.UP_NEXT;

  const players = splitParticipants(team.participants).sort((a, b) =>
    a.localeCompare(b),
  );

  return (
    <motion.div
      className="absolute inset-0 z-40 flex items-center justify-center"
      style={{
        background: 'var(--c-screen-bg-overlay)',
        backdropFilter: 'blur(6px)',
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
        {/* ── First Up / Up Next label ───────────────────────────────────── */}
        <motion.div
          variants={labelVariants}
          className="flex items-center gap-4">
          <span
            className="h-px w-16"
            style={{
              background:
                'linear-gradient(90deg, transparent, var(--c-gold-dark))',
            }}
          />
          <span
            className="wwbam-label"
            style={{ color: 'var(--c-gold)', letterSpacing: '0.3em' }}>
            {positionLabel}
          </span>
          <span
            className="h-px w-16"
            style={{
              background:
                'linear-gradient(270deg, transparent, var(--c-gold-dark))',
            }}
          />
        </motion.div>

        {/* ── Team name ─────────────────────────────────────────────────── */}
        <motion.div variants={nameVariants} className="w-full flex">
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
        {players.length > 0 && (
          <motion.div
            variants={dividerVariants}
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
        )}

        {/* ── Players — one per row, centred ────────────────────────────── */}
        {players.length > 0 && (
          <motion.div
            variants={playersVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center gap-3 w-full"
            style={{ maxWidth: '72%' }}>
            {players.map((name) => (
              <motion.div
                key={name}
                variants={playerItemVariants}
                className="flex w-full">
                <WwbamShape
                  size="wide"
                  state="default"
                  strokeWidth={2}
                  className="flex-1"
                  style={{ minHeight: '56px' }}>
                  <div className="flex items-center justify-center py-3 w-full text-center">
                    <span className="wwbam-team-name">{name}</span>
                  </div>
                </WwbamShape>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
