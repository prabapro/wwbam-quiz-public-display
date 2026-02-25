// src/components/topbar/TeamInfoBar.jsx

import WwbamShape from '@components/ui/WwbamShape';
import { formatPrize } from '@utils/formatters';
import { formatParticipantFirstNames } from '@utils/participants';

/**
 * TeamInfoBar
 *
 * Single wide WWBAM-style shape in the GameScreen top bar.
 * Contains three info clusters separated by vertical rules:
 *
 *   [ Now Playing / Team Name / Participants ] | [ Q# ] | [ Prize ]
 *
 * Participants are shown as first names only — full names are reserved
 * for the TeamAnnouncement overlay.
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

  const participantFirstNames = formatParticipantFirstNames(
    currentTeam?.participants,
  );

  return (
    <WwbamShape
      size="wide"
      state="default"
      strokeWidth={3}
      className="flex-1"
      style={{ minHeight: '64px' }}>
      <div className="flex items-center w-full">
        {/* ── Now Playing ───────────────────────────────────────────────── */}
        <div className="flex flex-col min-w-0 flex-1 px-6 py-2">
          <span className="wwbam-label">Now Playing</span>
          <span className="wwbam-team-name truncate">
            {currentTeam?.name ?? '—'}
          </span>
          {participantFirstNames && (
            <span className="wwbam-participants truncate">
              {participantFirstNames}
            </span>
          )}
        </div>

        <div className="wwbam-sep" />

        {/* ── Question number ───────────────────────────────────────────── */}
        <div className="flex flex-col items-center shrink-0 px-8 py-2">
          <span className="wwbam-label">Question</span>
          <span className="wwbam-q-number">{currentQuestionNumber ?? '—'}</span>
        </div>

        <div className="wwbam-sep" />

        {/* ── Prize at stake ────────────────────────────────────────────── */}
        <div className="flex flex-col items-end shrink-0 px-6 py-2">
          <span className="wwbam-label">Prize</span>
          <span className="wwbam-prize-display">
            {formatPrize(currentPrize)}
          </span>
        </div>
      </div>
    </WwbamShape>
  );
}
