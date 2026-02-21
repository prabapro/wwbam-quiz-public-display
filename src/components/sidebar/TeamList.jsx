// src/components/sidebar/TeamList.jsx

import { formatPrizeShort } from '@utils/formatters';

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Returns the display config for a team status badge.
 * @param {'waiting'|'active'|'eliminated'|'completed'} status
 */
function statusConfig(status) {
  switch (status) {
    case 'active':
      return {
        label: 'Playing',
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.15)',
        dot: '#f59e0b',
      };
    case 'completed':
      return {
        label: 'Done',
        color: '#4ade80',
        bg: 'rgba(74,222,128,0.12)',
        dot: '#4ade80',
      };
    case 'eliminated':
      return {
        label: 'Out',
        color: '#f87171',
        bg: 'rgba(248,113,113,0.12)',
        dot: '#f87171',
      };
    case 'waiting':
    default:
      return {
        label: 'Waiting',
        color: '#475569',
        bg: 'transparent',
        dot: '#334155',
      };
  }
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * TeamList
 *
 * Compact list of all teams shown in the lower sidebar during gameplay.
 * Highlights the currently active team. Shows status badge + prize earned.
 *
 * @param {{
 *   teams:         Array,
 *   currentTeamId: string|null,
 * }} props
 */
export default function TeamList({ teams, currentTeamId }) {
  if (!teams?.length) return null;

  return (
    <div>
      {/* Header */}
      <div
        className="px-4 py-2 text-center"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">
          Teams
        </p>
      </div>

      {/* Team rows */}
      <div>
        {teams.map((team) => {
          const isCurrent = team.id === currentTeamId;
          const cfg = statusConfig(team.status);

          return (
            <div
              key={team.id}
              className="flex items-center gap-2 px-4 py-2"
              style={{
                background: isCurrent ? 'rgba(245,158,11,0.08)' : 'transparent',
                borderLeft: isCurrent
                  ? '3px solid #f59e0b'
                  : '3px solid transparent',
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              }}>
              {/* Status dot */}
              <span
                className="shrink-0 w-2 h-2 rounded-full"
                style={{ background: cfg.dot }}
              />

              {/* Team name */}
              <p
                className="flex-1 text-xs font-semibold truncate"
                style={{ color: isCurrent ? '#f59e0b' : '#94a3b8' }}>
                {team.name}
              </p>

              {/* Prize (if earned) */}
              {(team.currentPrize ?? 0) > 0 && (
                <span
                  className="shrink-0 text-xs font-mono"
                  style={{
                    color: team.status === 'eliminated' ? '#475569' : '#64748b',
                  }}>
                  {formatPrizeShort(team.currentPrize)}
                </span>
              )}

              {/* Status badge */}
              <span
                className="shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
