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
 * Note: 'teamResult' is the *intent* — the card only renders after
 * readyResultTeamId matches, enforcing the delay in GameScreen.
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
 * Center column behaviour:
 *   - overlay active             → question/options visible behind overlay
 *   - questionVisible === false  → BetweenQuestionsLogo shown instead
 *   - questionVisible === true   → QuestionCard + OptionGrid shown normally
 *
 * teamResult delay:
 *   deriveOverlay returns 'teamResult' immediately when a team finishes, but
 *   the card only renders once readyResultTeamId matches the current team key.
 *   Both the immediate (game-over) and delayed (answer-reveal) paths go through
 *   setTimeout — delay 0 vs TEAM_RESULT_DELAY_MS — so no setState is ever
 *   called synchronously in the effect body, satisfying the lint rule.
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
  // Track which team's result card is ready to show, keyed by team ID.
  // The card renders only when this ID matches the current result team.
  // When overlay leaves 'teamResult' the outer condition gates rendering
  // naturally — no synchronous setState reset needed in the effect.
  const [readyResultTeamId, setReadyResultTeamId] = useState(null);

  // 'game' key is used when resultTeam is null (game-level completion)
  const resultTeamKey = resultTeam?.id ?? 'game';

  const showTeamResult =
    overlay === 'teamResult' && readyResultTeamId === resultTeamKey;

  useEffect(() => {
    if (overlay !== 'teamResult') return;

    // Both paths go through setTimeout so setState is never called
    // synchronously in the effect body (satisfies react-hooks/set-state-in-effect).
    // Game-level completion: delay 0 (no answer was just revealed to show).
    // Answer-reveal: TEAM_RESULT_DELAY_MS so audience sees green/red first.
    const delay =
      gameState?.gameStatus === 'completed' ? 0 : TEAM_RESULT_DELAY_MS;

    const timer = setTimeout(() => setReadyResultTeamId(resultTeamKey), delay);
    return () => clearTimeout(timer);
  }, [overlay, gameState?.gameStatus, resultTeamKey]);

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

          {/* Renders only after per-team delay fires via setTimeout */}
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
