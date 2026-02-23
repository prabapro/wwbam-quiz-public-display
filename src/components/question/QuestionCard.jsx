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
 * Displays the current question text inside a WwbamShape (wide, default).
 * Animates in when `questionVisible` becomes true and re-animates on
 * each new question (keyed on question id / number).
 *
 * Renders an invisible placeholder when hidden to keep the layout stable
 * so the option grid below does not shift position.
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
    <div className="w-full max-w-3xl">
      <AnimatePresence mode="wait">
        {questionVisible && question ? (
          <motion.div
            // Re-animate whenever the question changes
            key={question.id ?? currentQuestionNumber}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full flex">
            <WwbamShape
              size="wide"
              state="default"
              strokeWidth={3}
              className="flex-1">
              <div className="flex flex-col items-center justify-center gap-3 py-6 w-full text-center">
                {/* Question number label */}
                <span
                  className="wwbam-label"
                  style={{
                    color: 'var(--c-diamond)',
                    letterSpacing: '0.25em',
                  }}>
                  Question {currentQuestionNumber}
                </span>

                {/* Question text */}
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: '1.55rem',
                    fontWeight: 700,
                    color: 'var(--c-text)',
                    lineHeight: 1.35,
                  }}>
                  {question.text}
                </p>
              </div>
            </WwbamShape>
          </motion.div>
        ) : (
          // Invisible placeholder — preserves layout height while hidden
          <div key="placeholder" style={{ minHeight: '7rem', opacity: 0 }} />
        )}
      </AnimatePresence>
    </div>
  );
}
