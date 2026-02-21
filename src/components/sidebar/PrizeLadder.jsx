// src/components/sidebar/PrizeLadder.jsx

import { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatPrizeShort } from '@utils/formatters';

// ── Constants ──────────────────────────────────────────────────────────────────

/** Safe-haven milestone question numbers. */
const MILESTONES = new Set([5, 10, 15, 20]);

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * PrizeLadder
 *
 * Vertical prize ladder displayed in the sidebar during gameplay.
 * Shows all prize levels top-to-bottom (Q20 → Q1), with:
 *   - Current question highlighted in amber
 *   - Milestone questions (Q5, Q10, Q15, Q20) in gold with a trophy icon
 *   - Completed levels dimmed
 *   - Auto-scrolls so the current question is always in view
 *
 * @param {{
 *   prizeStructure:        number[],  // index 0 = Q1 prize
 *   currentQuestionNumber: number|null,
 * }} props
 */
export default function PrizeLadder({ prizeStructure, currentQuestionNumber }) {
  const currentRef = useRef(null);

  // Auto-scroll to keep current question visible whenever it changes
  useEffect(() => {
    if (currentRef.current) {
      currentRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentQuestionNumber]);

  if (!prizeStructure?.length) return null;

  // Build rows top-to-bottom: highest question first
  const rows = prizeStructure
    .map((prize, index) => ({ questionNumber: index + 1, prize }))
    .reverse();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="shrink-0 px-4 py-2 text-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">
          Prize Ladder
        </p>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {rows.map(({ questionNumber, prize }) => {
          const isCurrent = questionNumber === currentQuestionNumber;
          const isMilestone = MILESTONES.has(questionNumber);
          const isCompleted =
            currentQuestionNumber !== null &&
            questionNumber < currentQuestionNumber;

          return (
            <div key={questionNumber} ref={isCurrent ? currentRef : null}>
              <motion.div
                layout
                className="flex items-center gap-2 px-4 py-2"
                style={{
                  background: isCurrent
                    ? 'rgba(245,158,11,0.15)'
                    : 'transparent',
                  borderLeft: isCurrent
                    ? '3px solid #f59e0b'
                    : '3px solid transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}
                transition={{ duration: 0.3 }}>
                {/* Milestone icon or question number */}
                <span
                  className="shrink-0 w-6 text-center text-xs font-bold"
                  style={{
                    color: isCurrent
                      ? '#f59e0b'
                      : isMilestone
                        ? '#fbbf24'
                        : isCompleted
                          ? '#1e293b'
                          : '#475569',
                  }}>
                  {isMilestone ? '🏆' : questionNumber}
                </span>

                {/* Prize amount */}
                <span
                  className="flex-1 text-right text-xs font-mono font-semibold"
                  style={{
                    color: isCurrent
                      ? '#f59e0b'
                      : isMilestone
                        ? '#fbbf24'
                        : isCompleted
                          ? '#1e293b'
                          : '#64748b',
                    textShadow: isCurrent
                      ? '0 0 12px rgba(245,158,11,0.5)'
                      : 'none',
                  }}>
                  {formatPrizeShort(prize)}
                </span>

                {/* Current indicator arrow */}
                {isCurrent && (
                  <motion.span
                    className="text-amber-400 text-xs shrink-0"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}>
                    ◀
                  </motion.span>
                )}
              </motion.div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
