// src/components/question/QuestionCard.jsx

import { motion, AnimatePresence } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';

// ── Animation variants ─────────────────────────────────────────────────────────

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.3, ease: 'easeIn' } },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * QuestionCard
 *
 * Displays the current question number in its own compact WwbamShape badge
 * (gold shimmer, centered) above the question text in a wide WwbamShape.
 *
 * Both elements animate together as a single unit on question change.
 * Renders an invisible placeholder when hidden to keep the layout stable.
 *
 * @param {{
 *   question:              object | null,
 *   questionVisible:       boolean,
 *   currentQuestionNumber: number | null,
 * }} props
 */
export default function QuestionCard({
  question,
  questionVisible,
  currentQuestionNumber,
}) {
  return (
    <div className="w-full max-w-7xl">
      <AnimatePresence mode="wait">
        {questionVisible && question ? (
          <motion.div
            key={question.id ?? currentQuestionNumber}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full flex flex-col items-center gap-3">
            {/* ── Question number badge ────────────────────────────────────── */}
            <div className="flex" style={{ minWidth: '14rem' }}>
              <WwbamShape
                size="compact"
                state="selected"
                strokeWidth={1}
                className="flex-1"
                style={{ minHeight: '44px' }}>
                <div className="flex items-center justify-center gap-2 px-6 py-2 w-full">
                  <span
                    className="wwbam-label"
                    style={{ letterSpacing: '0.25em' }}>
                    Question
                  </span>
                  <span
                    className="wwbam-text-gold-gradient"
                    style={{
                      fontFamily: 'var(--font-numeric)',
                      fontSize: '1.3rem',
                      lineHeight: 1,
                    }}>
                    {currentQuestionNumber}
                  </span>
                </div>
              </WwbamShape>
            </div>

            {/* ── Question text card ───────────────────────────────────────── */}
            <div className="w-full flex">
              <WwbamShape
                size="wide"
                state="default"
                strokeWidth={6}
                className="flex-1">
                <div className="flex items-center justify-center py-7 w-full text-center">
                  <p className="wwbam-question-text">{question.text}</p>
                </div>
              </WwbamShape>
            </div>
          </motion.div>
        ) : (
          // Invisible placeholder — preserves layout height while hidden
          <div key="placeholder" style={{ minHeight: '7rem', opacity: 0 }} />
        )}
      </AnimatePresence>
    </div>
  );
}
