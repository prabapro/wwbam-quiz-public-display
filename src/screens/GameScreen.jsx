// src/screens/GameScreen.jsx

import { AnimatePresence, motion } from 'framer-motion';
import TeamInfoBar from '@components/topbar/TeamInfoBar';
import LifelineIndicator from '@components/topbar/LifelineIndicator';
import QuestionCard from '@components/question/QuestionCard';
import OptionGrid from '@components/question/OptionGrid';
import PrizeLadder from '@components/sidebar/PrizeLadder';
import TeamList from '@components/sidebar/TeamList';
import TeamAnnouncement from '@components/game/TeamAnnouncement';

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

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * GameScreen
 *
 * The main gameplay display. Shown when gameStatus is:
 *   "active"    → normal gameplay, or TeamAnnouncement overlay if between teams
 *   "paused"    → same layout with a semi-transparent pause overlay
 *   "completed" → same layout until displayFinalResults flips to true
 *
 * Between-teams detection:
 *   currentQuestionNumber === 0 means the host has moved to a new team
 *   but hasn't loaded a question yet — the perfect window for TeamAnnouncement.
 *
 * Layout (16:9, full screen):
 * ┌──────────────────────────────────────────────────────┐
 * │  TOP BAR: team info + lifelines                      │
 * ├─────────────────────────────────┬────────────────────┤
 * │                                 │                    │
 * │   QUESTION CARD                 │   PRIZE LADDER     │
 * │   OPTION GRID                   │                    │
 * │                                 ├────────────────────┤
 * │                                 │   TEAM LIST        │
 * └─────────────────────────────────┴────────────────────┘
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
  const isPaused = gameState?.gameStatus === 'paused';

  // Derive current team from teams array
  const currentTeam =
    teams.find((t) => t.id === gameState?.currentTeamId) ?? null;

  // Between-teams window: team is active but no question loaded yet
  const isBetweenTeams =
    gameState?.gameStatus === 'active' &&
    (gameState?.currentQuestionNumber === 0 ||
      gameState?.currentQuestionNumber == null);

  // Queue position for the announcement (1-based)
  const playQueue = gameState?.playQueue ?? [];
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

      {/* ── Team announcement overlay ─────────────────────────────────────
          Shown when a team is active but no question has been loaded yet.
          Sits above the game layout (absolute), dismisses automatically
          once the host loads question 1 (currentQuestionNumber → 1).    */}
      <AnimatePresence>
        {isBetweenTeams && !isPaused && (
          <TeamAnnouncement
            key={currentTeam?.id}
            team={currentTeam}
            queuePosition={queuePosition}
            queueTotal={playQueue.length}
            prizeStructure={prizeStructure}
          />
        )}
      </AnimatePresence>

      {/* ── Pause overlay ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isPaused && (
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
