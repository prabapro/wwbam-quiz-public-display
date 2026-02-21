// src/screens/GameScreen.jsx

import { AnimatePresence, motion } from 'framer-motion';
import TeamInfoBar from '@components/topbar/TeamInfoBar';
import LifelineIndicator from '@components/topbar/LifelineIndicator';
import QuestionCard from '@components/question/QuestionCard';
import OptionGrid from '@components/question/OptionGrid';
import PrizeLadder from '@components/sidebar/PrizeLadder';
import TeamList from '@components/sidebar/TeamList';
import TeamAnnouncement from '@components/game/TeamAnnouncement';
import TeamResult from '@components/game/TeamResult';

// ── Animation variants ─────────────────────────────────────────────────────────

const screenVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

const pauseOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.3 } },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Derives which overlay (if any) should be shown on top of the game layout.
 *
 * Priority (highest → lowest):
 *   1. pause       — always beats everything else
 *   2. teamResult  — team just finished (eliminated or completed)
 *   3. announcement — new team is up, no question loaded yet
 *   4. none        — normal gameplay
 *
 * TeamResult detection covers two cases:
 *   A) Normal:   answerRevealed && team.status is eliminated/completed
 *   B) Last team: gameStatus === 'completed' (completeGame() nulls currentTeamId
 *                 and clears answerRevealed, so we fall back to the last team
 *                 in the play queue)
 *
 * @returns {'pause'|'teamResult'|'announcement'|null}
 */
function deriveOverlay(gameState, currentTeam) {
  const { gameStatus, answerRevealed, currentQuestionNumber } = gameState ?? {};

  if (gameStatus === 'paused') return 'pause';

  // Last-team edge case: completeGame() fires, resetting currentTeamId + answerRevealed.
  // We detect this via gameStatus === 'completed' and show the last team's result.
  if (gameStatus === 'completed') return 'teamResult';

  // Normal finish: answer revealed and team status has updated
  const teamFinished =
    currentTeam?.status === 'eliminated' || currentTeam?.status === 'completed';
  if (answerRevealed && teamFinished) return 'teamResult';

  // Between-teams window: active team, no question loaded yet
  const isBetweenTeams =
    gameStatus === 'active' &&
    (currentQuestionNumber === 0 || currentQuestionNumber == null);
  if (isBetweenTeams) return 'announcement';

  return null;
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * GameScreen
 *
 * The main gameplay display. Shown when gameStatus is:
 *   "active"    → normal gameplay, TeamAnnouncement, or TeamResult overlay
 *   "paused"    → same layout with a pause overlay
 *   "completed" → TeamResult for the last team (until displayFinalResults)
 *
 * Overlay state machine (see deriveOverlay):
 *   pause        → semi-transparent pause screen
 *   teamResult   → team elimination / completion card
 *   announcement → upcoming team intro card
 *   null         → no overlay, normal gameplay visible
 *
 * @param {{
 *   gameState:      object,
 *   teams:          Array,
 *   prizeStructure: number[],
 *   displayConfig:  object,
 * }} props
 */
export default function GameScreen({
  gameState,
  teams,
  prizeStructure,
  displayConfig,
}) {
  // ── Derived state ────────────────────────────────────────────────────────────

  const playQueue = gameState?.playQueue ?? [];
  const currentTeam =
    teams.find((t) => t.id === gameState?.currentTeamId) ?? null;

  // Fallback for the last-team edge case: completeGame() nulls currentTeamId,
  // so we look up the last team in the play queue directly from the teams array.
  const lastTeamId = playQueue[playQueue.length - 1] ?? null;
  const lastTeam = teams.find((t) => t.id === lastTeamId) ?? null;

  // The team to show in TeamResult: current if present, otherwise last team
  const resultTeam = currentTeam ?? lastTeam;

  const overlay = deriveOverlay(gameState, currentTeam, lastTeam);

  // Queue position for TeamAnnouncement (1-based)
  const queuePosition = currentTeam ? playQueue.indexOf(currentTeam.id) + 1 : 0;

  return (
    <motion.div
      className="relative w-full h-full flex flex-col"
      style={{ background: '#0a0a2e' }}
      variants={screenVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-3 shrink-0"
        style={{
          background: 'linear-gradient(180deg, #0d1b4b 0%, #0a0a2e 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
        <TeamInfoBar
          currentTeam={currentTeam}
          currentQuestionNumber={gameState?.currentQuestionNumber}
          prizeStructure={prizeStructure}
        />
        <LifelineIndicator
          lifelinesAvailable={currentTeam?.lifelinesAvailable}
          activeLifeline={gameState?.activeLifeline}
        />
      </div>

      {/* ── Main area ───────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">
        {/* Left: Question + Options */}
        <div className="flex flex-col flex-1 min-w-0 items-center justify-center gap-6 px-8 py-6">
          <QuestionCard
            question={gameState?.currentQuestion}
            questionVisible={gameState?.questionVisible}
            currentQuestionNumber={gameState?.currentQuestionNumber}
          />
          <OptionGrid
            options={gameState?.currentQuestion?.options}
            optionsVisible={gameState?.optionsVisible}
            selectedOption={gameState?.selectedOption}
            correctOption={gameState?.correctOption}
            answerRevealed={gameState?.answerRevealed}
            activeLifeline={gameState?.activeLifeline}
          />
        </div>

        {/* Right: Sidebar */}
        <div
          className="flex flex-col shrink-0 w-72 border-l"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          {displayConfig?.showPrizeLadder && (
            <div className="flex-1 min-h-0">
              <PrizeLadder
                prizeStructure={prizeStructure}
                currentQuestionNumber={gameState?.currentQuestionNumber}
              />
            </div>
          )}

          {displayConfig?.showTeamList && (
            <div
              className="shrink-0 border-t"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <TeamList
                teams={teams}
                currentTeamId={gameState?.currentTeamId}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Overlays ─────────────────────────────────────────────────────── */}

      <AnimatePresence>
        {/* Team announcement — new team is up, no question loaded yet */}
        {overlay === 'announcement' && (
          <TeamAnnouncement
            key={`announce-${currentTeam?.id}`}
            team={currentTeam}
            queuePosition={queuePosition}
            queueTotal={playQueue.length}
            prizeStructure={prizeStructure}
          />
        )}

        {/* Team result — team just finished (eliminated or completed) */}
        {overlay === 'teamResult' && (
          <TeamResult
            key={`result-${resultTeam?.id}`}
            team={resultTeam}
            totalQuestions={prizeStructure?.length ?? 20}
          />
        )}

        {/* Pause overlay — always on top */}
        {overlay === 'pause' && (
          <motion.div
            key="pause-overlay"
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-50"
            style={{
              background: 'rgba(10,10,46,0.85)',
              backdropFilter: 'blur(4px)',
            }}
            variants={pauseOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
              <p className="text-6xl">⏸</p>
            </motion.div>
            <p className="text-white text-3xl font-bold tracking-widest uppercase">
              Game Paused
            </p>
            <p className="text-slate-400 text-sm tracking-widest uppercase">
              Waiting for host to resume
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
