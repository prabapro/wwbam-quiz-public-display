// src/screens/ResultsScreen.jsx

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle } from 'lucide-react';
import { formatPrize } from '@utils/formatters';
import ScreenBackground from '@components/layout/ScreenBackground';
import ScreenHeader from '@components/layout/ScreenHeader';
import WwbamShape from '@components/ui/WwbamShape';
import { COPY_RESULTS } from '@constants/app';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Ranks teams by their final prize (descending).
 * Teams with equal prizes share the same rank.
 * Within the same prize, completed teams rank above eliminated ones,
 * then alphabetically by name.
 *
 * @param {Array} teams
 * @returns {Array} Sorted teams with a `rank` field attached
 */
function rankTeams(teams) {
  const sorted = [...teams].sort((a, b) => {
    const prizeDiff = (b.currentPrize ?? 0) - (a.currentPrize ?? 0);
    if (prizeDiff !== 0) return prizeDiff;
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (b.status === 'completed' && a.status !== 'completed') return 1;
    return a.name.localeCompare(b.name);
  });

  let rank = 1;
  return sorted.map((team, i) => {
    if (
      i > 0 &&
      (sorted[i - 1].currentPrize ?? 0) !== (team.currentPrize ?? 0)
    ) {
      rank = i + 1;
    }
    return { ...team, rank };
  });
}

/** Medal emoji for top 3 ranks. */
function medal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

/**
 * Maps a ranked team to a WwbamShape state.
 *   rank 1  → selected  (gold shimmer — winner highlight)
 *   others  → default   (blue shimmer)
 *
 * @param {{ rank: number }} team
 * @returns {'selected'|'default'}
 */
function deriveShapeState(team) {
  if (team.rank === 1) return 'selected';
  return 'default';
}

// ── Animation variants ─────────────────────────────────────────────────────────

const sectionStaggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const rowContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * StatusIcon
 *
 * Bare lucide icon indicating team outcome — no pill/badge wrapper.
 *   completed  → CheckCircle2 (green)
 *   eliminated → XCircle      (red)
 *
 * Colours pulled from CSS badge tokens to stay consistent with the palette.
 *
 * @param {{ isCompleted: boolean }} props
 */
function StatusIcon({ isCompleted }) {
  return isCompleted ? (
    <CheckCircle2
      size={18}
      strokeWidth={2}
      style={{ color: 'var(--c-badge-completed-text)', flexShrink: 0 }}
    />
  ) : (
    <XCircle
      size={18}
      strokeWidth={2}
      style={{ color: 'var(--c-badge-eliminated-text)', flexShrink: 0 }}
    />
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * ResultsScreen
 *
 * Shown when `displayFinalResults` is true in the Firebase game-state.
 * Displays the final leaderboard — all teams ranked by prize won.
 *
 * Layout (top → bottom):
 *   ScreenHeader (logo + APP_NAME eyebrow + GoldDivider)
 *   [WwbamShape selected]  — "Final Results" heading (gold gradient)
 *   [leaderboard rows]     — WwbamShape per team, state driven by outcome
 *
 * Row layout: [Rank] [StatusIcon] [Team Name] [Prize]
 *
 * @param {{ teams: Array }} props
 */
export default function ResultsScreen({ teams }) {
  const rankedTeams = rankTeams(teams);

  return (
    <ScreenBackground>
      <div className="w-full h-full flex flex-col items-center justify-center gap-5 px-16 py-10">
        <motion.div
          className="w-full flex flex-col items-center gap-5"
          variants={sectionStaggerVariants}
          initial="hidden"
          animate="visible">
          {/* Logo + eyebrow + divider */}
          <motion.div variants={sectionVariants}>
            <ScreenHeader logoSize="w-16 h-16" />
          </motion.div>

          {/* "Final Results" heading */}
          <motion.div
            variants={sectionVariants}
            className="w-full max-w-3xl flex">
            <WwbamShape
              size="wide"
              state="selected"
              strokeWidth={3}
              className="flex-1"
              style={{ minHeight: '88px' }}>
              <div className="flex items-center justify-center py-4 w-full text-center">
                <h1 className="wwbam-screen-heading wwbam-text-gold-gradient">
                  {COPY_RESULTS.HEADING}
                </h1>
              </div>
            </WwbamShape>
          </motion.div>

          {/* ── Leaderboard ──────────────────────────────────────────────── */}
          <motion.div
            className="w-full max-w-3xl flex flex-col gap-3"
            variants={rowContainerVariants}>
            {rankedTeams.map((team) => {
              const isCompleted = team.status === 'completed';
              const isFirst = team.rank === 1;
              const teamMedal = medal(team.rank);
              const shapeState = deriveShapeState(team);

              return (
                <motion.div
                  key={team.id}
                  variants={rowVariants}
                  className="flex">
                  <WwbamShape
                    size="wide"
                    state={shapeState}
                    strokeWidth={3}
                    className="flex-1"
                    style={{ minHeight: '72px' }}>
                    <div className="flex items-center gap-5 w-full">
                      {/* ── Rank / Medal ──────────────────────────────── */}
                      <div className="w-10 flex items-center justify-center shrink-0">
                        {teamMedal ? (
                          <span className="text-2xl">{teamMedal}</span>
                        ) : (
                          <span className="wwbam-rank-number">{team.rank}</span>
                        )}
                      </div>

                      {/* ── Status icon ───────────────────────────────── */}
                      <StatusIcon isCompleted={isCompleted} />

                      {/* ── Team info ──────────────────────────────────── */}
                      <div className="flex-1 min-w-0">
                        <p className="wwbam-result-name truncate">
                          {team.name}
                        </p>
                        {team.participants && (
                          <p className="wwbam-result-participants truncate">
                            {team.participants}
                          </p>
                        )}
                      </div>

                      {/* ── Prize ──────────────────────────────────────── */}
                      <p
                        className={`wwbam-result-prize ${isFirst ? 'wwbam-result-prize--winner' : ''}`}>
                        {formatPrize(team.currentPrize ?? 0)}
                      </p>
                    </div>
                  </WwbamShape>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </ScreenBackground>
  );
}
