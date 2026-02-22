// src/screens/ResultsScreen.jsx

import { motion } from 'framer-motion';
import { formatPrize } from '@utils/formatters';
import ScreenBackground from '@components/layout/ScreenBackground';

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
          <h1
            className="text-5xl font-black tracking-widest uppercase text-white"
            style={{ textShadow: '0 0 40px rgba(245,158,11,0.5)' }}>
            Final Results
          </h1>
          {winner && (
            <p className="text-amber-400 text-xl font-semibold tracking-wide">
              Winner: {winner.name}
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
                className="flex items-center gap-5 px-6 py-4 rounded-xl"
                style={{
                  background: isFirst
                    ? 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(13,27,75,0.9) 100%)'
                    : 'rgba(13,27,75,0.7)',
                  border: isFirst
                    ? '1px solid rgba(245,158,11,0.4)'
                    : '1px solid rgba(255,255,255,0.07)',
                  boxShadow: isFirst ? '0 0 30px rgba(245,158,11,0.1)' : 'none',
                }}>
                {/* Rank / Medal */}
                <div className="w-10 flex items-center justify-center shrink-0">
                  {teamMedal ? (
                    <span className="text-2xl">{teamMedal}</span>
                  ) : (
                    <span className="text-slate-500 font-bold text-lg">
                      {team.rank}
                    </span>
                  )}
                </div>

                {/* Team info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-lg truncate">
                    {team.name}
                  </p>
                  {team.participants && (
                    <p className="text-slate-400 text-sm truncate">
                      {team.participants}
                    </p>
                  )}
                </div>

                {/* Status badge */}
                <span
                  className="shrink-0 text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full"
                  style={{
                    background: isCompleted
                      ? 'rgba(21,128,61,0.3)'
                      : 'rgba(185,28,28,0.3)',
                    color: isCompleted ? '#4ade80' : '#f87171',
                    border: isCompleted
                      ? '1px solid rgba(74,222,128,0.3)'
                      : '1px solid rgba(248,113,113,0.3)',
                  }}>
                  {isCompleted ? 'Completed' : 'Eliminated'}
                </span>

                {/* Prize */}
                <p
                  className="shrink-0 font-mono font-bold text-xl"
                  style={{ color: isCompleted ? '#f59e0b' : '#94a3b8' }}>
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
