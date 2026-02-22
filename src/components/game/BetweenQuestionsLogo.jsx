// src/components/game/BetweenQuestionsLogo.jsx

import { motion } from 'framer-motion';
import { COPY_BETWEEN_QUESTIONS } from '@constants/app';

// ── Animation variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.3, ease: 'easeIn' } },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * BetweenQuestionsLogo
 *
 * Shown in the GameScreen center column when the game is active but no
 * question is visible yet — i.e. the host has either just revealed an answer
 * and hasn't loaded the next question, or the question is loaded but not yet
 * shown to the audience.
 *
 * Renders a spinning WWBAM logo (Y-axis west→east rotation) with a subtle
 * label, keeping the screen alive and branded during host transitions.
 *
 * Intentionally rendered inside the center column (not as an absolute overlay)
 * so the PrizeLadder and TeamList sidebars remain visible throughout.
 */
export default function BetweenQuestionsLogo() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center gap-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      {/* Spinning logo */}
      <div style={{ perspective: '800px' }}>
        <motion.img
          src="/images/wwbam-logo.svg"
          alt="WWBAM Logo"
          className="w-72 h-72 drop-shadow-[0_0_30px_rgba(245,158,11,0.35)]"
          animate={{ rotateY: [0, 360] }}
          transition={{
            duration: 2.5,
            ease: 'easeInOut',
            repeat: Infinity,
            repeatDelay: 2,
          }}
        />
      </div>

      {/* Label */}
      <motion.p
        className="text-slate-500 text-sm uppercase tracking-[0.35em]"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        {COPY_BETWEEN_QUESTIONS.LABEL}
      </motion.p>
    </motion.div>
  );
}
