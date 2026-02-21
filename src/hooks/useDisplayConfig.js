// src/hooks/useDisplayConfig.js

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@config/firebase';
import { kebabToCamel } from '@utils/transforms';

/**
 * Default display settings — used as fallback if the Firebase node is
 * absent or partially populated. Keeps the UI stable even before the
 * host panel has written config to the database.
 */
const DEFAULT_DISPLAY_CONFIG = {
  showPrizeLadder: true,
  showTeamList: true,
  animationDuration: 500,
};

/**
 * useDisplayConfig
 *
 * Attaches a real-time listener to the `config/display-settings` Firebase node.
 * Falls back to DEFAULT_DISPLAY_CONFIG if the node doesn't exist yet.
 *
 * Only starts listening once `authReady` is true.
 *
 * @param {boolean} authReady - Pass `isReady` from useFirebaseAuth
 *
 * @returns {{
 *   displayConfig: {
 *     showPrizeLadder: boolean,
 *     showTeamList: boolean,
 *     animationDuration: number,
 *   },
 *   isListening: boolean,
 *   isError: boolean,
 *   errorMessage: string|null,
 * }}
 */
export function useDisplayConfig(authReady) {
  const [displayConfig, setDisplayConfig] = useState(DEFAULT_DISPLAY_CONFIG);
  const [isListening, setIsListening] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!authReady) return;

    console.log('📡 Starting display-config listener...');

    const configRef = ref(database, 'config/display-settings');

    const unsubscribe = onValue(
      configRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const converted = kebabToCamel(snapshot.val());

          // Merge with defaults so missing keys never cause undefined issues
          setDisplayConfig({ ...DEFAULT_DISPLAY_CONFIG, ...converted });
          console.log('⚙️ display-config updated:', converted);
        } else {
          // Node not yet written by host — use defaults silently
          setDisplayConfig(DEFAULT_DISPLAY_CONFIG);
          console.warn('⚠️ display-settings node absent — using defaults');
        }
        setIsListening(true);
        setIsError(false);
      },
      (error) => {
        console.error('❌ display-config listener error:', error.message);
        setIsError(true);
        setErrorMessage(error.message);
        setIsListening(false);
      },
    );

    return () => {
      console.log('🛑 display-config listener stopped');
      unsubscribe();
    };
  }, [authReady]);

  return { displayConfig, isListening, isError, errorMessage };
}
