// src/App.jsx

import { useFirebaseAuth } from './hooks/useFirebaseAuth';
import { useGameState } from './hooks/useGameState';

/**
 * App — Root component
 *
 * Current state: confirmation scaffold
 *  - Triggers anonymous Firebase auth
 *  - Starts game-state listener once auth is ready
 *  - Renders a status message at each stage
 *
 * Next step: replace the status UI with screen routing:
 *  - not-started / initialized  → IdleScreen
 *  - active / paused            → GameScreen
 *  - displayFinalResults: true  → ResultsScreen
 */
export default function App() {
  const {
    isReady: authReady,
    isError: authError,
    errorMessage: authErrorMessage,
    uid,
  } = useFirebaseAuth();
  const {
    gameState,
    isListening,
    isError: dbError,
    errorMessage: dbErrorMessage,
  } = useGameState(authReady);

  // ── Auth connecting ────────────────────────────────────────────
  if (!authReady && !authError) {
    return <StatusScreen icon="🔐" message="Authenticating..." muted />;
  }

  // ── Auth failed ────────────────────────────────────────────────
  if (authError) {
    return (
      <StatusScreen
        icon="❌"
        message={`Auth failed: ${authErrorMessage}`}
        error
      />
    );
  }

  // ── Waiting for first Firebase snapshot ───────────────────────
  if (!isListening && !dbError) {
    return <StatusScreen icon="📡" message="Connecting to Firebase..." muted />;
  }

  // ── Database error ─────────────────────────────────────────────
  if (dbError) {
    return (
      <StatusScreen
        icon="❌"
        message={`Database error: ${dbErrorMessage}`}
        error
      />
    );
  }

  // ── Listening — show confirmation ──────────────────────────────
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-6">
      <div className="flex items-center gap-3">
        <span className="text-4xl">✅</span>
        <p className="text-white text-2xl font-bold tracking-wide">
          Listening to Firebase
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <p className="text-slate-400 text-sm uppercase tracking-widest">
          Game Status
        </p>
        <p className="text-yellow-400 text-3xl font-mono font-bold">
          {gameState?.gameStatus ?? '—'}
        </p>
      </div>

      {/* Dev-only debug info */}
      {import.meta.env.DEV && (
        <p className="text-slate-600 text-xs font-mono absolute bottom-4">
          uid: {uid}
        </p>
      )}
    </div>
  );
}

// ============================================================================
// INTERNAL HELPER
// ============================================================================

/**
 * StatusScreen — Full-screen message for loading / error states.
 * Internal to App — not exported or reused elsewhere at this stage.
 */
function StatusScreen({ icon, message, muted = false, error = false }) {
  return (
    <div className="w-full h-full flex items-center justify-center gap-4">
      <span className="text-3xl">{icon}</span>
      <p
        className={`text-xl font-semibold ${error ? 'text-red-400' : muted ? 'text-slate-500' : 'text-white'}`}>
        {message}
      </p>
    </div>
  );
}
