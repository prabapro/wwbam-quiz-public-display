// src/components/topbar/TeamInfoBar.jsx

import { formatPrize } from '@utils/formatters';

/**
 * TeamInfoBar
 *
 * Displays the currently playing team's name, participants,
 * current question number and the prize at stake for that question.
 *
 * Rendered in the top bar of GameScreen.
 *
 * @param {{
 *   currentTeam:          object|null,
 *   currentQuestionNumber: number|null,
 *   prizeStructure:       number[],
 * }} props
 */
export default function TeamInfoBar({
  currentTeam,
  currentQuestionNumber,
  prizeStructure,
}) {
  // Prize for the current question (index = questionNumber - 1)
  const currentPrize =
    currentQuestionNumber && prizeStructure?.length
      ? (prizeStructure[currentQuestionNumber - 1] ?? 0)
      : 0;

  return (
    <div className="flex items-center gap-8">
      {/* Team identity */}
      <div className="flex flex-col gap-0.5">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">
          Now Playing
        </p>
        <p className="text-white text-xl font-bold leading-tight">
          {currentTeam?.name ?? '—'}
        </p>
        {currentTeam?.participants && (
          <p className="text-slate-400 text-xs truncate max-w-xs">
            {currentTeam.participants}
          </p>
        )}
      </div>

      {/* Divider */}
      <span className="w-px h-10 bg-white/10 shrink-0" />

      {/* Question number */}
      <div className="flex flex-col items-center gap-0.5">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">
          Question
        </p>
        <p className="text-white text-2xl font-black font-mono leading-tight">
          {currentQuestionNumber ?? '—'}
        </p>
      </div>

      {/* Divider */}
      <span className="w-px h-10 bg-white/10 shrink-0" />

      {/* Prize at stake */}
      <div className="flex flex-col gap-0.5">
        <p className="text-slate-400 text-xs uppercase tracking-widest font-medium">
          Prize
        </p>
        <p
          className="text-2xl font-black font-mono leading-tight"
          style={{
            color: '#f59e0b',
            textShadow: '0 0 20px rgba(245,158,11,0.4)',
          }}>
          {formatPrize(currentPrize)}
        </p>
      </div>
    </div>
  );
}
