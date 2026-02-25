// src/App.jsx

import { AnimatePresence } from 'framer-motion';
import { useFirebaseAuth } from '@hooks/useFirebaseAuth';
import { useGameState } from '@hooks/useGameState';
import { useTeams } from '@hooks/useTeams';
import { usePrizeStructure } from '@hooks/usePrizeStructure';
import { useDisplayConfig } from '@hooks/useDisplayConfig';
import LoadingScreen from '@screens/LoadingScreen';
import IdleScreen from '@screens/IdleScreen';
import GameScreen from '@screens/GameScreen';
import ResultsScreen from '@screens/ResultsScreen';
import { COPY_LOADING } from '@constants/app';

/**
 * App — Root component
 *
 * Owns all Firebase hooks and handles screen routing based on game state.
 * Screens receive only the data they need as props — no hooks inside screens.
 *
 * Routing logic:
 *   auth pending / db connecting          → LoadingScreen
 *   gameStatus: not-started / initialized → IdleScreen  (manages its own phase internally)
 *   gameStatus: active / paused / completed → GameScreen
 *   displayFinalResults: true             → ResultsScreen
 *
 * IdleScreen receives `teams` and `gameState` so it can display:
 *   - Team roster cards in the lobby phase (not-started)
 *   - Initialization stepper (transition-triggered, local animation)
 *   - Play order in the ready phase (initialized)
 */
export default function App() {
  // ── Auth ────────────────────────────────────────────────────────────────────
  const {
    isReady: authReady,
    isError: authError,
    errorMessage: authErrorMessage,
  } = useFirebaseAuth();

  // ── Data listeners (all gated on authReady) ─────────────────────────────────
  const {
    gameState,
    isListening,
    isError: dbError,
    errorMessage: dbErrorMessage,
  } = useGameState(authReady);

  const { teams } = useTeams(authReady);
  const { prizeStructure } = usePrizeStructure(authReady);
  const { displayConfig, timerDuration } = useDisplayConfig(authReady);

  // ── Loading states ──────────────────────────────────────────────────────────
  if (!authReady && !authError) {
    return <LoadingScreen message={COPY_LOADING.AUTHENTICATING} />;
  }

  if (authError) {
    return (
      <LoadingScreen
        message={`${COPY_LOADING.AUTH_FAILED} ${authErrorMessage}`}
      />
    );
  }

  if (!isListening && !dbError) {
    return <LoadingScreen message={COPY_LOADING.CONNECTING_FIREBASE} />;
  }

  if (dbError) {
    return (
      <LoadingScreen
        message={`${COPY_LOADING.CONNECTION_ERROR} ${dbErrorMessage}`}
      />
    );
  }

  // ── Screen routing ─────────────────────────────────────────────────────────
  const { gameStatus, displayFinalResults } = gameState ?? {};

  if (displayFinalResults) {
    return <ResultsScreen teams={teams} />;
  }

  if (
    gameStatus === 'active' ||
    gameStatus === 'paused' ||
    gameStatus === 'completed'
  ) {
    return (
      <AnimatePresence mode="wait">
        <GameScreen
          key="game"
          gameState={gameState}
          teams={teams}
          prizeStructure={prizeStructure}
          displayConfig={displayConfig}
          timerDuration={timerDuration}
        />
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <IdleScreen key="idle" gameState={gameState} teams={teams} />
    </AnimatePresence>
  );
}
