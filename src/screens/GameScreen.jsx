// src/screens/GameScreen.jsx

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';
import TeamInfoBar from '@components/topbar/TeamInfoBar';
import LifelineIndicator from '@components/topbar/LifelineIndicator';
import QuestionCard from '@components/question/QuestionCard';
import OptionGrid from '@components/question/OptionGrid';
import PrizeLadder from '@components/sidebar/PrizeLadder';
import TeamList from '@components/sidebar/TeamList';
import TeamAnnouncement from '@components/game/TeamAnnouncement';
import TeamResult from '@components/game/TeamResult';
import PhoneAFriendOverlay from '@components/game/PhoneAFriendOverlay';
import BetweenQuestionsLogo from '@components/game/BetweenQuestionsLogo';
import { COPY_PAUSE } from '@constants/app';

// ── Constants ──────────────────────────────────────────────────────────────────

/**
 * How long (ms) to show the answer highlight before the TeamResult overlay
 * appears. Gives the audience time to see the correct/wrong colours on the
 * options grid before the result card covers the screen.
 */
const TEAM_RESULT_DELAY_MS = 3000;

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
 *   4. announcement  — new team is up (currentQuestionNumber === 0)
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
 * Layout (3-column):
 *   Left sidebar  — TeamList      (w-80, hidden when showTeamList is false)
 *   Center        — QuestionCard + OptionGrid (flex-1, always centered)
 *   Right sidebar — PrizeLadder   (w-80, hidden when showPrizeLadder is false)
 *
 * Top bar proportions (fixed 3-column grid: 2fr 1fr 1fr):
 *   col 1 (50%) — TeamInfoBar
 *   col 2 (25%) — Phone a Friend lifeline
 *   col 3 (25%) — 50/50 lifeline
 *
 * teamResult delay:
 *   deriveOverlay returns 'teamResult' immediately, but the card only renders
 *   after TEAM_RESULT_DELAY_MS via a `teamResultUnlocked` boolean.
 *
 * @param {{
 *   gameState:      object,
 *   teams:          Array,
 *   prizeStructure: number[],
 *   displayConfig:  object,
 *   timerDuration:  number,
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

  const lastTeamId = playQueue[playQueue.length - 1] ?? null;
  const lastTeam = teams.find((t) => t.id === lastTeamId) ?? null;
  const resultTeam = currentTeam ?? lastTeam;

  const overlay = deriveOverlay(gameState, currentTeam);
  const queuePosition = currentTeam ? playQueue.indexOf(currentTeam.id) + 1 : 0;

  // ── Delayed teamResult ─────────────────────────────────────────────────────
  const [teamResultUnlocked, setTeamResultUnlocked] = useState(false);
  const showTeamResult = overlay === 'teamResult' && teamResultUnlocked;

  useEffect(() => {
    if (overlay === 'teamResult') {
      const timer = setTimeout(
        () => setTeamResultUnlocked(true),
        TEAM_RESULT_DELAY_MS,
      );
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => setTeamResultUnlocked(false), 0);
      return () => clearTimeout(timer);
    }
  }, [overlay]);

  // ── Between-questions logo ─────────────────────────────────────────────────
  const showBetweenQuestionsLogo =
    overlay === null && !gameState?.questionVisible;

  return (
    <ScreenBackground>
      <motion.div
        className="relative w-full h-full flex flex-col"
        variants={screenVariants}
        initial="hidden"
        animate="visible"
        exit="exit">
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div
          className="shrink-0 grid gap-3 p-3"
          style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <div className="flex">
            <TeamInfoBar
              currentTeam={currentTeam}
              currentQuestionNumber={gameState?.currentQuestionNumber}
              prizeStructure={prizeStructure}
            />
          </div>
          <LifelineIndicator
            lifelinesAvailable={currentTeam?.lifelinesAvailable ?? null}
            activeLifeline={gameState?.activeLifeline ?? null}
          />
        </div>

        {/* ── Main content area ─────────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0">
          {/* Left sidebar — Team List */}
          {displayConfig?.showTeamList && (
            <div
              className="flex flex-col shrink-0 w-80 border-r"
              style={{ borderColor: 'var(--c-border-subtle)' }}>
              <TeamList
                teams={teams}
                playQueue={playQueue}
                currentTeamId={gameState?.currentTeamId ?? null}
              />
            </div>
          )}

          {/* Center — Question + Options */}
          <div className="flex flex-col flex-1 items-center justify-center gap-6 px-8 py-6 min-w-0">
            <AnimatePresence mode="wait">
              {showBetweenQuestionsLogo ? (
                <BetweenQuestionsLogo key="between" />
              ) : (
                <motion.div
                  key="gameplay"
                  className="w-full flex flex-col items-center gap-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}>
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
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right sidebar — Prize Ladder */}
          {displayConfig?.showPrizeLadder && (
            <div
              className="flex flex-col shrink-0 w-80 border-l"
              style={{ borderColor: 'var(--c-border-subtle)' }}>
              <PrizeLadder
                prizeStructure={prizeStructure}
                currentQuestionNumber={gameState?.currentQuestionNumber}
              />
            </div>
          )}
        </div>

        {/* ── Overlays ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {overlay === 'phoneAFriend' && (
            <PhoneAFriendOverlay
              key="phone-a-friend"
              startedAt={gameState?.lifelineTimerStartedAt ?? null}
              currentTeam={currentTeam}
              timerDuration={timerDuration}
            />
          )}

          {overlay === 'pause' && (
            <motion.div
              key="pause"
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{
                background: 'var(--c-screen-bg-overlay)',
                backdropFilter: 'blur(4px)',
              }}
              variants={pauseOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit">
              <p className="wwbam-overlay-heading">{COPY_PAUSE.HEADING}</p>
              <p className="wwbam-overlay-subheading">
                {COPY_PAUSE.SUBHEADING}
              </p>
            </motion.div>
          )}

          {overlay === 'teamResult' && showTeamResult && (
            <TeamResult
              key="team-result"
              team={resultTeam}
              totalQuestions={prizeStructure?.length ?? 15}
            />
          )}

          {overlay === 'announcement' && (
            <TeamAnnouncement
              key="announcement"
              team={currentTeam}
              queuePosition={queuePosition}
              queueTotal={playQueue.length}
              prizeStructure={prizeStructure}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ScreenBackground>
  );
}
