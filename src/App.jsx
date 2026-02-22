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
    return <LoadingScreen message="Authenticating..." />;
  }

  if (authError) {
    return <LoadingScreen message={`Auth failed: ${authErrorMessage}`} />;
  }

  if (!isListening && !dbError) {
    return <LoadingScreen message="Connecting to Firebase..." />;
  }

  if (dbError) {
    return <LoadingScreen message={`Connection error: ${dbErrorMessage}`} />;
  }

  // ── Screen routing ─────────────────────────────────────────────────────────
  const { gameStatus, displayFinalResults } = gameState ?? {};

  // Results screen takes priority
  if (displayFinalResults) {
    return (
      <AnimatePresence mode="wait">
        <ResultsScreen key="results" teams={teams} />
      </AnimatePresence>
    );
  }

  // Active gameplay (including paused and completed-but-not-yet-results)
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

  // Fallback: not-started / initialized / unknown
  // Pass teams + gameState so IdleScreen can render the lobby roster,
  // the initialization stepper, and the ready-state play order.
  return (
    <AnimatePresence mode="wait">
      <IdleScreen
        key="idle"
        gameStatus={gameStatus}
        teams={teams}
        gameState={gameState}
      />
    </AnimatePresence>
  );
}
