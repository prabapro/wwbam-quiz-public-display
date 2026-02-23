// src/components/sidebar/PrizeLadder.jsx

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';
import { formatPrize } from '@utils/formatters';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Maps a row's logical state to a WwbamShape visual state.
 *
 *  current   → selected  (amber shimmer — active question)
 *  completed → default   (blue shimmer  — already answered)
 *  upcoming  → used      (slate shimmer — not yet reached)
 */
const SHAPE_STATE = {
  current: 'selected',
  completed: 'default',
  upcoming: 'used',
};

/** Derive which logical state a row is in. */
function deriveRowState(questionNumber, currentQuestionNumber) {
  if (questionNumber === currentQuestionNumber) return 'current';
  if (currentQuestionNumber !== null && questionNumber < currentQuestionNumber)
    return 'completed';
  return 'upcoming';
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * PrizeLadder
 *
 * Vertical prize ladder displayed in the sidebar during gameplay.
 * Renders prize rows top-to-bottom (highest question first) using WwbamShape,
 * consistent with the rest of the WWBAM design system.
 *
 * Visual states per row:
 *  - current   → amber shimmer (selected)
 *  - completed → blue shimmer  (default — already answered)
 *  - upcoming  → slate shimmer (used    — not yet reached)
 *
 * Auto-scrolls so the current question row is always in view.
 *
 * @param {{
 *   prizeStructure:        number[],    // index 0 = Q1 prize
 *   currentQuestionNumber: number|null,
 * }} props
 */
export default function PrizeLadder({ prizeStructure, currentQuestionNumber }) {
  const currentRef = useRef(null);

  // Scroll current question into view whenever it changes
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentQuestionNumber]);

  if (!prizeStructure?.length) return null;

  // Build rows top-to-bottom: highest question number first
  const rows = prizeStructure
    .map((prize, index) => ({ questionNumber: index + 1, prize }))
    .reverse();

  return (
    <div className="h-full flex flex-col overflow-hidden pt-6">
      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scrollbar-none py-2 flex flex-col gap-1.5">
        {rows.map(({ questionNumber, prize }) => {
          const rowState = deriveRowState(
            questionNumber,
            currentQuestionNumber,
          );
          const isCurrent = rowState === 'current';
          const isCompleted = rowState === 'completed';

          return (
            <motion.div
              key={questionNumber}
              ref={isCurrent ? currentRef : null}
              layout
              className="flex">
              <WwbamShape
                size="compact"
                state={SHAPE_STATE[rowState]}
                strokeWidth={2}
                className="flex-1"
                style={{ minHeight: '40px' }}>
                <div className="flex items-center justify-between w-full px-4 py-1.5">
                  {/* Question number */}
                  <span
                    className="wwbam-label shrink-0"
                    style={{
                      color: isCurrent
                        ? 'var(--c-gold)'
                        : isCompleted
                          ? 'var(--c-text-dim)'
                          : 'var(--c-used-text)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.08em',
                    }}>
                    Q{questionNumber}
                  </span>

                  {/* Prize amount */}
                  <span
                    style={{
                      fontFamily: 'var(--font-numeric)',
                      fontSize: '0.85rem',
                      color: isCurrent
                        ? 'var(--c-gold)'
                        : isCompleted
                          ? 'var(--c-text)'
                          : 'var(--c-used-text)',
                    }}>
                    {formatPrize(prize)}
                  </span>
                </div>
              </WwbamShape>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
