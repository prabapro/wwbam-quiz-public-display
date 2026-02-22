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
 *   Left sidebar  — TeamList      (w-72, hidden when showTeamList is false)
 *   Center        — QuestionCard + OptionGrid (flex-1, always centered)
 *   Right sidebar — PrizeLadder   (w-72, hidden when showPrizeLadder is false)
 *
 * teamResult delay:
 *   deriveOverlay returns 'teamResult' immediately, but the card only renders
 *   after TEAM_RESULT_DELAY_MS via a `teamResultUnlocked` boolean.
 *
 *   Previous approaches (readyResultTeamId) were fragile because:
 *   - For wrong-answer eliminations, completeGame() fires automatically right
 *     after eliminateTeam(), causing a brief intermediate render where
 *     deriveOverlay returns null (currentTeamId cleared, gameStatus not yet
 *     'completed'). This cancelled the in-flight timer via the effect cleanup.
 *     When 'teamResult' resumed, readyResultTeamId already matched, so the
 *     card showed immediately.
 *
 *   Current approach:
 *   - `teamResultUnlocked` is a plain boolean, always reset to false when
 *     overlay leaves 'teamResult', and unlocked after TEAM_RESULT_DELAY_MS
 *     when it enters 'teamResult'.
 *   - Both effect branches use setTimeout so setState is never synchronous
 *     (satisfies react-hooks/set-state-in-effect lint rule).
 *   - If overlay briefly flickers null → 'teamResult' → null → 'teamResult'
 *     (race condition during completeGame), the reset (0 ms) and new delay
 *     timer are both non-blocking and independently correct.
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
  // Simple boolean: true only after the delay has elapsed since entering
  // the 'teamResult' overlay state. Resets (via setTimeout 0) when overlay
  // leaves 'teamResult', ready for the next team.
  const [teamResultUnlocked, setTeamResultUnlocked] = useState(false);
  const showTeamResult = overlay === 'teamResult' && teamResultUnlocked;

  useEffect(() => {
    if (overlay === 'teamResult') {
      // Unlock after delay — setTimeout keeps this out of the effect body
      const timer = setTimeout(
        () => setTeamResultUnlocked(true),
        TEAM_RESULT_DELAY_MS,
      );
      return () => clearTimeout(timer);
    } else {
      // Reset for next team — setTimeout 0 is still async, satisfies lint rule
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
          className="flex items-center justify-between px-6 py-3 shrink-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(13,27,75,0.85) 0%, rgba(10,10,46,0.6) 100%)',
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

        {/* ── Main area (3-column) ──────────────────────────────────────── */}
        <div className="flex flex-1 min-h-0">
          {/* Left sidebar — Teams */}
          {displayConfig?.showTeamList && (
            <div
              className="flex flex-col shrink-0 w-72 border-r"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <TeamList
                teams={teams}
                currentTeamId={gameState?.currentTeamId}
              />
            </div>
          )}

          {/* Center — Question, Options, or Between-Questions Logo */}
          <div className="flex flex-col flex-1 min-w-0 items-center justify-center gap-6 px-8 py-6">
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
              className="flex flex-col shrink-0 w-72 border-l"
              style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
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
              timerDuration={timerDuration}
            />
          )}

          {overlay === 'pause' && (
            <motion.div
              key="pause"
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{
                background: 'rgba(5,5,28,0.75)',
                backdropFilter: 'blur(4px)',
              }}
              variants={pauseOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit">
              <p
                className="text-5xl font-black tracking-widest uppercase text-white"
                style={{ textShadow: '0 0 40px rgba(245,158,11,0.4)' }}>
                Paused
              </p>
              <p className="text-slate-400 text-base tracking-widest uppercase">
                Game is on hold
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
