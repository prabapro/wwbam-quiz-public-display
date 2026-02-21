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
import PhoneAFriendOverlay from '@components/game/PhoneAFriendOverlay';

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

// ── Overlay state machine ──────────────────────────────────────────────────────

/**
 * Derives which overlay (if any) to render on top of the game layout.
 *
 * Priority (highest → lowest):
 *   1. phoneAFriend  — paused for a phone-a-friend call (beats generic pause)
 *   2. pause         — generic game pause
 *   3. teamResult    — team just finished (eliminated or completed)
 *   4. announcement  — new team is up, no question loaded yet
 *   5. null          — normal gameplay, no overlay
 *
 * @returns {'phoneAFriend'|'pause'|'teamResult'|'announcement'|null}
 */
function deriveOverlay(gameState, currentTeam) {
  const { gameStatus, activeLifeline, answerRevealed, currentQuestionNumber } =
    gameState ?? {};

  if (gameStatus === 'paused' && activeLifeline === 'phone-a-friend')
    return 'phoneAFriend';
  if (gameStatus === 'paused') return 'pause';
  if (gameStatus === 'completed') return 'teamResult';

  const teamFinished =
    currentTeam?.status === 'eliminated' || currentTeam?.status === 'completed';
  if (answerRevealed && teamFinished) return 'teamResult';

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
 * The main gameplay display. Shown when gameStatus is active/paused/completed.
 *
 * Overlay state machine (see deriveOverlay):
 *   phoneAFriend  → question recap + synced countdown timer
 *   pause         → generic pause screen
 *   teamResult    → elimination / completion card
 *   announcement  → upcoming team intro card
 *   null          → normal gameplay
 *
 * @param {{
 *   gameState:      object,
 *   teams:          Array,
 *   prizeStructure: number[],
 *   displayConfig:  object,
 *   timerDuration:  number,   - phone-a-friend duration in seconds (from config)
 * }} props
 */
export default function GameScreen({
  gameState,
  teams,
  prizeStructure,
  displayConfig,
  timerDuration,
}) {
  const playQueue = gameState?.playQueue ?? [];
  const currentTeam =
    teams.find((t) => t.id === gameState?.currentTeamId) ?? null;

  // Last-team fallback: completeGame() nulls currentTeamId
  const lastTeamId = playQueue[playQueue.length - 1] ?? null;
  const lastTeam = teams.find((t) => t.id === lastTeamId) ?? null;
  const resultTeam = currentTeam ?? lastTeam;

  const overlay = deriveOverlay(gameState, currentTeam);
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
        {overlay === 'phoneAFriend' && (
          <PhoneAFriendOverlay
            key="phone-a-friend"
            question={gameState?.currentQuestion}
            options={gameState?.currentQuestion?.options}
            startedAt={gameState?.lifelineTimerStartedAt ?? null}
            durationSeconds={timerDuration}
          />
        )}

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

        {overlay === 'teamResult' && (
          <TeamResult
            key={`result-${resultTeam?.id}`}
            team={resultTeam}
            totalQuestions={prizeStructure?.length ?? 20}
          />
        )}

        {overlay === 'announcement' && (
          <TeamAnnouncement
            key={`announce-${currentTeam?.id}`}
            team={currentTeam}
            queuePosition={queuePosition}
            queueTotal={playQueue.length}
            prizeStructure={prizeStructure}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
