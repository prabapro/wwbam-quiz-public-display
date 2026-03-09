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
const TEAM_RESULT_DELAY_MS = 5000;

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
 *   Center        — QuestionCard + OptionGrid (flex-1, always centred)
 *   Right sidebar — PrizeLadder   (w-80, hidden when showPrizeLadder is false)
 *
 * Answer lock deliberation:
 *   When `selectedOption` is set but `answerRevealed` is still false, the host
 *   has locked the answer for deliberation. OptionGrid already renders the
 *   chosen option in amber automatically. A subtle "deliberating" banner is
 *   shown below the options so the audience knows the host is considering.
 *   The banner disappears once `answerRevealed` becomes true.
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
  const teamResultKey = resultTeam
    ? `${resultTeam.id}-${resultTeam.status}`
    : null;
  const [unlockedKey, setUnlockedKey] = useState(null);
  const showTeamResult =
    overlay === 'teamResult' &&
    teamResultKey !== null &&
    unlockedKey === teamResultKey;

  useEffect(() => {
    if (overlay !== 'teamResult' || !teamResultKey) return;

    const keyToUnlock = teamResultKey;
    const timer = setTimeout(
      () => setUnlockedKey(keyToUnlock),
      TEAM_RESULT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [overlay, teamResultKey]);

  // ── Gameplay snapshot for the teamResult delay window ─────────────────────
  //
  // completeGame() clears question/options data in Firebase at the same time
  // it sets gameStatus:'completed'. We capture a snapshot synchronously during
  // render using React's "storing information from previous renders" pattern.
  const currentTeamIsTerminal =
    currentTeam?.status === 'eliminated' || currentTeam?.status === 'completed';

  const captureKey =
    gameState?.answerRevealed && currentTeamIsTerminal
      ? `${currentTeam.id}-${currentTeam.status}`
      : null;

  const [snapshotKey, setSnapshotKey] = useState(null);
  const [frozenGameplay, setFrozenGameplay] = useState(null);

  if (captureKey !== null && captureKey !== snapshotKey) {
    setSnapshotKey(captureKey);
    setFrozenGameplay({
      currentQuestion: gameState?.currentQuestion ?? null,
      selectedOption: gameState?.selectedOption ?? null,
      correctOption: gameState?.correctOption ?? null,
      answerRevealed: true,
      activeLifeline: gameState?.activeLifeline ?? null,
    });
  }

  // During the delay window, serve frozen values so question/options stay
  // visible. Outside the delay window, use live gameState.
  const activeGameplay =
    overlay === 'teamResult' && !showTeamResult && frozenGameplay
      ? {
          currentQuestion: frozenGameplay.currentQuestion,
          questionVisible: true,
          optionsVisible: true,
          selectedOption: frozenGameplay.selectedOption,
          correctOption: frozenGameplay.correctOption,
          answerRevealed: frozenGameplay.answerRevealed,
          activeLifeline: frozenGameplay.activeLifeline,
        }
      : {
          currentQuestion: gameState?.currentQuestion ?? null,
          questionVisible: gameState?.questionVisible ?? false,
          optionsVisible: gameState?.optionsVisible ?? false,
          selectedOption: gameState?.selectedOption ?? null,
          correctOption: gameState?.correctOption ?? null,
          answerRevealed: gameState?.answerRevealed ?? false,
          activeLifeline: gameState?.activeLifeline ?? null,
        };

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
          className="shrink-0 grid gap-0 px-0 py-8 items-center"
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
              className="flex flex-col shrink-0 w-80"
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
                    question={activeGameplay.currentQuestion}
                    questionVisible={activeGameplay.questionVisible}
                    currentQuestionNumber={gameState?.currentQuestionNumber}
                  />

                  <OptionGrid
                    options={activeGameplay.currentQuestion?.options}
                    optionsVisible={activeGameplay.optionsVisible}
                    selectedOption={activeGameplay.selectedOption}
                    correctOption={activeGameplay.correctOption}
                    answerRevealed={activeGameplay.answerRevealed}
                    activeLifeline={activeGameplay.activeLifeline}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right sidebar — Prize Ladder */}
          {displayConfig?.showPrizeLadder && (
            <div
              className="flex flex-col shrink-0 w-80"
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
              timerDuration={timerDuration}
              contact={currentTeam?.contact ?? null}
            />
          )}

          {overlay === 'pause' && (
            <motion.div
              key="pause"
              className="absolute inset-0 flex items-center justify-center"
              style={{ background: 'var(--c-overlay)' }}
              variants={pauseOverlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit">
              <p
                className="wwbam-label"
                style={{
                  letterSpacing: '0.35em',
                  color: 'var(--c-used-text)',
                  fontSize: '1.5rem',
                }}>
                {COPY_PAUSE.LABEL}
              </p>
            </motion.div>
          )}

          {overlay === 'announcement' && (
            <TeamAnnouncement
              key={`announcement-${currentTeam?.id}`}
              team={currentTeam}
              queuePosition={queuePosition}
              queueTotal={playQueue.length}
              prizeStructure={prizeStructure}
            />
          )}

          {showTeamResult && (
            <TeamResult
              key={`result-${resultTeam?.id}`}
              team={resultTeam}
              totalQuestions={prizeStructure?.length ?? 20}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </ScreenBackground>
  );
}
