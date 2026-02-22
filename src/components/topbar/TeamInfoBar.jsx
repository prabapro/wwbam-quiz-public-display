// src/components/topbar/TeamInfoBar.jsx

import { formatPrize } from '@utils/formatters';

/**
 * TeamInfoBar
 *
 * Single wide WWBAM-style chamfered hexagon displayed in the GameScreen
 * top bar. Contains three info clusters separated by vertical rules:
 *
 *   [ Now Playing / Team Name / Participants ] | [ Q# ] | [ Prize ]
 *
 * Styling comes entirely from:
 *   src/styles/tokens.css       — design tokens (--hex-cut, --c-gold, etc.)
 *   src/styles/components.css   — .wwbam-hex-border, .wwbam-hex-fill, typography
 *
 * The --hex-cut override (14px) makes the corner cuts slightly smaller
 * than the option buttons (16px) so the top bar reads as a distinct element.
 *
 * @param {{
 *   currentTeam:           object|null,
 *   currentQuestionNumber: number|null,
 *   prizeStructure:        number[],
 * }} props
 */
export default function TeamInfoBar({
  currentTeam,
  currentQuestionNumber,
  prizeStructure,
}) {
  const currentPrize =
    currentQuestionNumber && prizeStructure?.length
      ? (prizeStructure[currentQuestionNumber - 1] ?? 0)
      : 0;

  return (
    <div className="wwbam-hex-border flex-1" style={{ '--hex-cut': '14px' }}>
      <div className="wwbam-hex-fill flex items-center gap-0 w-full px-1 py-0">
        {/* ── Now Playing ─────────────────────────────────────────────── */}
        <div className="flex flex-col min-w-0 flex-1 px-7 py-3">
          <span className="wwbam-label">Now Playing</span>
          <span className="wwbam-team-name truncate">
            {currentTeam?.name ?? '—'}
          </span>
          {currentTeam?.participants && (
            <span className="wwbam-participants truncate">
              {currentTeam.participants}
            </span>
          )}
        </div>

        <div className="wwbam-sep" />

        {/* ── Question number ─────────────────────────────────────────── */}
        <div className="flex flex-col items-center shrink-0 px-7 py-3">
          <span className="wwbam-label">Question</span>
          <span className="wwbam-q-number">{currentQuestionNumber ?? '—'}</span>
        </div>

        <div className="wwbam-sep" />

        {/* ── Prize at stake ──────────────────────────────────────────── */}
        <div className="flex flex-col items-end shrink-0 px-7 py-3">
          <span className="wwbam-label">Prize</span>
          <span className="wwbam-prize-display">
            {formatPrize(currentPrize)}
          </span>
        </div>
      </div>
    </div>
  );
}
