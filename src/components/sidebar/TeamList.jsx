// src/components/sidebar/TeamList.jsx

import { motion } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';
import { formatPrize } from '@utils/formatters';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Per-status display config.
 *
 *  active    → selected  (amber shimmer — currently playing)
 *  completed → default   (blue shimmer  — finished successfully)
 *  eliminated→ wrong     (red shimmer   — answered incorrectly)
 *  waiting   → used      (slate shimmer — not yet played)
 *
 * Shape colour communicates status — no icons needed.
 * All text colours are CSS token references — no hardcoded hex values.
 */
const STATUS_CONFIG = {
  active: {
    shapeState: 'selected',
    numberColor: 'var(--c-gold)',
    nameColor: 'var(--c-gold)',
    prizeColor: 'var(--c-gold)',
  },
  completed: {
    shapeState: 'default',
    numberColor: 'var(--c-blue-light)',
    nameColor: 'var(--c-text)',
    prizeColor: 'var(--c-blue-light)',
  },
  eliminated: {
    shapeState: 'wrong',
    numberColor: 'var(--c-red-mid)',
    nameColor: 'var(--c-text-dim)',
    prizeColor: 'var(--c-red-mid)',
  },
  waiting: {
    shapeState: 'used',
    numberColor: 'var(--c-used-text)',
    nameColor: 'var(--c-used-text)',
    prizeColor: 'var(--c-used-text)',
  },
};

const DEFAULT_STATUS = STATUS_CONFIG.waiting;

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatusConfig(status) {
  return STATUS_CONFIG[status] ?? DEFAULT_STATUS;
}

/**
 * Returns teams sorted by play queue order.
 * Teams not present in the queue are appended at the end.
 */
function sortByPlayQueue(teams, playQueue) {
  if (!playQueue?.length) return teams;
  const indexMap = Object.fromEntries(playQueue.map((id, i) => [id, i]));
  return [...teams].sort((a, b) => {
    const ai = indexMap[a.id] ?? Infinity;
    const bi = indexMap[b.id] ?? Infinity;
    return ai - bi;
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * TeamList
 *
 * Sidebar list of all teams in play order. Max 10 teams so cards have
 * generous breathing room. Shape state communicates status visually.
 *
 * Layout per card (2 rows):
 *   Row 1: [#]  [Team name]
 *   Row 2: [Prize amount]   ← only shown if prize > 0
 *
 * @param {{
 *   teams:         Array,
 *   playQueue:     string[],
 *   currentTeamId: string|null,
 * }} props
 */
export default function TeamList({ teams, playQueue }) {
  if (!teams?.length) return null;

  const orderedTeams = sortByPlayQueue(teams, playQueue);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div
        className="shrink-0 px-4 py-2 text-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">
          Teams
        </p>
      </div>

      {/* Team cards */}
      <div className="flex-1 overflow-y-auto scrollbar-none py-2 px-3 flex flex-col gap-3">
        {orderedTeams.map((team, index) => {
          const cfg = getStatusConfig(team.status);
          const hasPrize = (team.currentPrize ?? 0) > 0;

          return (
            <motion.div key={team.id} layout className="flex">
              <WwbamShape
                size="compact"
                state={cfg.shapeState}
                strokeWidth={2}
                className="flex-1"
                style={{ minHeight: hasPrize ? '60px' : '48px' }}>
                <div className="flex flex-col justify-center w-full px-4 py-2.5 gap-1">
                  {/* ── Row 1: position · team name ─────────────────────── */}
                  <div className="flex items-baseline gap-2">
                    <span
                      className="shrink-0"
                      style={{
                        fontFamily: 'var(--font-numeric)',
                        fontSize: '0.8rem',
                        color: cfg.numberColor,
                      }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p
                      className="flex-1 font-semibold truncate"
                      style={{
                        fontSize: '0.85rem',
                        color: cfg.nameColor,
                      }}>
                      {team.name}
                    </p>
                  </div>

                  {/* ── Row 2: prize amount ──────────────────────────────── */}
                  {hasPrize && (
                    <p
                      className="truncate"
                      style={{
                        fontFamily: 'var(--font-numeric)',
                        fontSize: '0.8rem',
                        color: cfg.prizeColor,
                        paddingLeft: '1.4rem', // align under team name
                      }}>
                      {formatPrize(team.currentPrize)}
                    </p>
                  )}
                </div>
              </WwbamShape>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
