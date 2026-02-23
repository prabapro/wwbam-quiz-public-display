// src/screens/ResultsScreen.jsx

import { motion } from 'framer-motion';
import { formatPrize } from '@utils/formatters';
import ScreenBackground from '@components/layout/ScreenBackground';
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
    // Same prize: completed above eliminated
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (b.status === 'completed' && a.status !== 'completed') return 1;
    // Same prize + same status: alphabetical
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

// ── Animation variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.4 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -30 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * ResultsScreen
 *
 * Shown when `displayFinalResults` is true in the Firebase game-state.
 * Displays the final leaderboard — all teams ranked by prize won.
 *
 * Row surfaces use plain rounded divs (no WwbamShape) — a deliberately
 * different visual language that signals "summary" rather than "active game".
 * Row and badge styling is driven entirely by .wwbam-result-* and
 * .wwbam-status-badge-* classes from components.css — no inline colour strings.
 *
 * @param {{
 *   teams: Array,
 * }} props
 */
export default function ResultsScreen({ teams }) {
  const rankedTeams = rankTeams(teams);
  const winner = rankedTeams[0];

  return (
    <ScreenBackground>
      <div className="w-full h-full flex flex-col items-center justify-center gap-10 px-16 py-12">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <motion.div
          className="flex flex-col items-center gap-3"
          variants={headerVariants}
          initial="hidden"
          animate="visible">
          <motion.p
            className="text-5xl"
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ delay: 0.8, duration: 0.6 }}>
            🏆
          </motion.p>
          <h1 className="wwbam-overlay-heading">{COPY_RESULTS.HEADING}</h1>
          {winner && (
            <p className="wwbam-result-winner-line">
              {COPY_RESULTS.WINNER_PREFIX} {winner.name}
            </p>
          )}
        </motion.div>

        {/* ── Leaderboard ───────────────────────────────────────────────── */}
        <motion.div
          className="w-full max-w-3xl flex flex-col gap-3"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          {rankedTeams.map((team) => {
            const isCompleted = team.status === 'completed';
            const isFirst = team.rank === 1;
            const teamMedal = medal(team.rank);

            return (
              <motion.div
                key={team.id}
                variants={rowVariants}
                className={`flex items-center gap-5 px-6 py-4 wwbam-result-row ${isFirst ? 'wwbam-result-row--winner' : ''}`}>
                {/* ── Rank / Medal ─────────────────────────────────────── */}
                <div className="w-10 flex items-center justify-center shrink-0">
                  {teamMedal ? (
                    <span className="text-2xl">{teamMedal}</span>
                  ) : (
                    <span className="wwbam-rank-number">{team.rank}</span>
                  )}
                </div>

                {/* ── Team info ────────────────────────────────────────── */}
                <div className="flex-1 min-w-0">
                  <p className="wwbam-result-name truncate">{team.name}</p>
                  {team.participants && (
                    <p className="wwbam-result-participants truncate">
                      {team.participants}
                    </p>
                  )}
                </div>

                {/* ── Status badge ─────────────────────────────────────── */}
                <span
                  className={`wwbam-status-badge ${
                    isCompleted
                      ? 'wwbam-status-badge--completed'
                      : 'wwbam-status-badge--eliminated'
                  }`}>
                  {isCompleted ? 'Completed' : 'Eliminated'}
                </span>

                {/* ── Prize ────────────────────────────────────────────── */}
                <p
                  className={`wwbam-result-prize ${isFirst ? 'wwbam-result-prize--winner' : ''}`}>
                  {formatPrize(team.currentPrize ?? 0)}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </ScreenBackground>
  );
}
