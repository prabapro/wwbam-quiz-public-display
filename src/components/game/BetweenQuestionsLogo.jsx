// src/components/game/BetweenQuestionsLogo.jsx

import { motion } from 'framer-motion';
import ScreenHeader from '@components/layout/ScreenHeader';
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
 * Delegates branding (spinning logo + APP_NAME eyebrow + gold divider) to
 * ScreenHeader for consistency with all other display screens. Only adds
 * the pulsing "get ready" label below.
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
      {/* Branding — spinning logo + APP_NAME + gold divider */}
      <ScreenHeader logoSize="w-48 h-48" />

      {/* Pulsing label */}
      <motion.p
        className="wwbam-label"
        style={{ letterSpacing: '0.35em', color: 'var(--c-used-text)' }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}>
        {COPY_BETWEEN_QUESTIONS.LABEL}
      </motion.p>
    </motion.div>
  );
}
