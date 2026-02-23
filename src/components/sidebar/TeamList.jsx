// src/components/sidebar/TeamList.jsx

import { motion } from 'framer-motion';
import { Play, CheckCircle2, Clock } from 'lucide-react';
import WwbamShape from '@components/ui/WwbamShape';
import { formatPrize } from '@utils/formatters';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * Shape + text colour config per display state.
 *
 *  active → selected  (amber shimmer — currently playing)
 *  dim    → used      (slate shimmer — completed, eliminated, waiting)
 *
 * Colours reference CSS tokens — no raw values.
 */
const STATUS_CONFIG = {
  active: {
    shapeState: 'selected',
    numberColor: 'var(--c-gold)',
    nameColor: 'var(--c-gold)',
  },
  dim: {
    shapeState: 'used',
    numberColor: 'var(--c-used-text)',
    nameColor: 'var(--c-used-text)',
  },
};

// ── Sub-component ──────────────────────────────────────────────────────────────

/**
 * StatusRow
 *
 * Row 2 content per team status:
 *   active    → ▶ Now Playing        (gold)
 *   completed → ✓ Rs. X,XXX.00       (dim — prize earned)
 *   eliminated→ ✓ Rs. X,XXX.00       (dim — last safe-haven prize, or "Done")
 *   waiting   → ⏱ Waiting            (dim)
 *
 * All colours reference CSS tokens via JS constants or var() — no raw values.
 */
function StatusRow({ status, currentPrize }) {
  const hasPrize = (currentPrize ?? 0) > 0;
  const dimColor = 'var(--c-used-text)';
  const iconSize = 11;

  if (status === 'active') {
    return (
      <div
        className="flex items-center gap-1.5"
        style={{ color: 'var(--c-gold)' }}>
        <Play size={iconSize} fill="currentColor" strokeWidth={0} />
        <span
          className="wwbam-label"
          style={{ color: 'var(--c-gold)', letterSpacing: '0.18em' }}>
          Now Playing
        </span>
      </div>
    );
  }

  if (status === 'completed' || status === 'eliminated') {
    return (
      <div className="flex items-center gap-1.5" style={{ color: dimColor }}>
        <CheckCircle2 size={iconSize} strokeWidth={2} />
        <span
          style={{
            fontFamily: hasPrize ? 'var(--font-numeric)' : 'var(--font-body)',
            fontSize: '0.78rem',
            color: dimColor,
            letterSpacing: hasPrize ? '0.02em' : '0.18em',
            textTransform: hasPrize ? 'none' : 'uppercase',
          }}>
          {hasPrize ? formatPrize(currentPrize) : 'Done'}
        </span>
      </div>
    );
  }

  // waiting (default fallback)
  return (
    <div className="flex items-center gap-1.5" style={{ color: dimColor }}>
      <Clock size={iconSize} strokeWidth={2} />
      <span
        className="wwbam-label"
        style={{ color: dimColor, letterSpacing: '0.18em' }}>
        Waiting
      </span>
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getStatusConfig(status) {
  return status === 'active' ? STATUS_CONFIG.active : STATUS_CONFIG.dim;
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
 * Sidebar list of all teams in play order.
 *
 * Only the active team gets amber shimmer emphasis. All others (completed,
 * eliminated, waiting) use dim/slate shimmer so the current team always
 * stands out clearly.
 *
 * Layout per card:
 *   Row 1: [##]  [Team Name]
 *   Row 2:       [StatusRow]  ← always shown
 *
 * @param {{
 *   teams:     Array,
 *   playQueue: string[],
 * }} props
 */
export default function TeamList({ teams, playQueue }) {
  if (!teams?.length) return null;

  const orderedTeams = sortByPlayQueue(teams, playQueue);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-4 py-2 text-center wwbam-sep--horizontal">
        <p className="wwbam-sidebar-header">Teams</p>
      </div>

      {/* ── Team cards ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto scrollbar-none py-2 px-2 flex flex-col gap-8">
        {orderedTeams.map((team, index) => {
          const cfg = getStatusConfig(team.status);

          return (
            <motion.div key={team.id} layout className="flex">
              <WwbamShape
                size="compact"
                state={cfg.shapeState}
                strokeWidth={2}
                className="flex-1"
                style={{ minHeight: '60px' }}>
                <div className="flex flex-col justify-center w-full px-2 py-2.5 gap-1">
                  {/* ── Row 1: position · team name ───────────────────── */}
                  <div className="flex items-baseline gap-2">
                    {/* Team number — class supplies font/size, inline supplies colour */}
                    <span
                      className="wwbam-team-number shrink-0"
                      style={{
                        fontSize: '0.8rem',
                        color: cfg.numberColor,
                      }}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p
                      className="flex-1 font-semibold truncate"
                      style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.85rem',
                        color: cfg.nameColor,
                      }}>
                      {team.name}
                    </p>
                  </div>

                  {/* ── Row 2: status indicator ───────────────────────── */}
                  <div style={{ paddingLeft: '1.4rem' }}>
                    <StatusRow
                      status={team.status}
                      currentPrize={team.currentPrize}
                    />
                  </div>
                </div>
              </WwbamShape>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
