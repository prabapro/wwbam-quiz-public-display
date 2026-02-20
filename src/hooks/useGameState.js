// src/hooks/useGameState.js

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../config/firebase';
import { kebabToCamel } from '../utils/transforms';

// ============================================================================
// HOOK
// ============================================================================

/**
 * useGameState
 *
 * Attaches a real-time listener to the `game-state` Firebase node.
 * Only starts listening once `authReady` is true — passing false
 * keeps the hook idle (avoids permission errors before auth resolves).
 *
 * All keys are converted from kebab-case to camelCase automatically.
 *
 * @param {boolean} authReady - Pass `isReady` from useFirebaseAuth
 *
 * @returns {{
 *   gameState: object | null,
 *   isListening: boolean,
 *   isError: boolean,
 *   errorMessage: string | null,
 * }}
 */
export function useGameState(authReady) {
  const [gameState, setGameState] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    // Don't start until anonymous auth is confirmed
    if (!authReady) return;

    console.log('📡 Starting game-state listener...');

    const gameStateRef = ref(database, 'game-state');

    const unsubscribe = onValue(
      gameStateRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.val();
          const converted = kebabToCamel(raw);
          setGameState(converted);
          console.log('🎮 game-state updated:', converted.gameStatus);
        } else {
          // Node exists but is empty — treat as default state
          setGameState({ gameStatus: 'not-started' });
          console.warn('⚠️ game-state node is empty in Firebase');
        }
        setIsListening(true);
        setIsError(false);
      },
      (error) => {
        console.error('❌ game-state listener error:', error.message);
        setIsError(true);
        setErrorMessage(error.message);
        setIsListening(false);
      },
    );

    return () => {
      console.log('🛑 game-state listener stopped');
      unsubscribe();
    };
  }, [authReady]);

  return { gameState, isListening, isError, errorMessage };
}
