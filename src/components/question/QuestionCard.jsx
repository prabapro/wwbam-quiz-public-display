// src/components/question/QuestionCard.jsx

import { motion, AnimatePresence } from 'framer-motion';

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
 * Displays the question text. Animates in when `questionVisible` becomes true.
 * When the question changes (new question loaded), the card re-animates.
 *
 * Renders nothing visible when `questionVisible` is false — keeps the
 * layout stable so the option grid area doesn't collapse.
 *
 * @param {{
 *   question:              object|null,
 *   questionVisible:       boolean,
 *   currentQuestionNumber: number|null,
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
            // Key on question id so card re-animates when question changes
            key={question.id ?? currentQuestionNumber}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full px-8 py-6 rounded-2xl text-center"
            style={{
              background: 'linear-gradient(135deg, #0d1b4b 0%, #0a1535 100%)',
              border: '1px solid rgba(99,132,255,0.25)',
              boxShadow:
                '0 0 40px rgba(26,58,143,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}>
            {/* Question number badge */}
            <span
              className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{
                background: 'linear-gradient(90deg, #1a3a8f, #2563eb)',
                border: '1px solid rgba(99,132,255,0.4)',
                color: '#93c5fd',
              }}>
              Question {currentQuestionNumber}
            </span>

            <p className="text-white text-2xl font-bold leading-snug mt-2">
              {question.text}
            </p>
          </motion.div>
        ) : (
          // Invisible placeholder preserves layout height
          <motion.div
            key="placeholder"
            className="w-full px-8 py-6 rounded-2xl"
            style={{ minHeight: '5rem', opacity: 0 }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
