// src/hooks/useDisplayConfig.js

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@config/firebase';
import { kebabToCamel } from '@utils/transforms';

// ── Defaults ───────────────────────────────────────────────────────────────────

const DEFAULT_DISPLAY_CONFIG = {
  showPrizeLadder: true,
  showTeamList: true,
  animationDuration: 500,
};

/** Mirrors PHONE_A_FRIEND_DURATION from the host panel constants. */
const DEFAULT_TIMER_DURATION = 30;

// ── Hook ───────────────────────────────────────────────────────────────────────

/**
 * useDisplayConfig
 *
 * Listens to the `config` Firebase node (parent of `display-settings`)
 * so we can read both display toggles and the phone-a-friend timer duration
 * with a single listener.
 *
 * Previously listened to `config/display-settings`. Moved up one level to
 * also capture `config/timer-duration`, which the display app needs to
 * correctly compute the phone-a-friend countdown from the Firebase timestamp.
 *
 * Returns:
 *   displayConfig  — show-prize-ladder, show-team-list, animation-duration
 *   timerDuration  — phone-a-friend call duration in seconds (e.g. 30)
 *
 * @param {boolean} authReady - Gate: only start listener once auth is ready
 */
export function useDisplayConfig(authReady) {
  const [displayConfig, setDisplayConfig] = useState(DEFAULT_DISPLAY_CONFIG);
  const [timerDuration, setTimerDuration] = useState(DEFAULT_TIMER_DURATION);
  const [isListening, setIsListening] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!authReady) return;

    // Listen to the config parent node so we get display-settings AND
    // timer-duration in one snapshot.
    const configRef = ref(database, 'config');

    const unsubscribe = onValue(
      configRef,
      (snapshot) => {
        setIsListening(true);
        setIsError(false);

        if (!snapshot.exists()) {
          // No config in Firebase yet — use defaults
          setDisplayConfig(DEFAULT_DISPLAY_CONFIG);
          setTimerDuration(DEFAULT_TIMER_DURATION);
          return;
        }

        const raw = snapshot.val();

        // display-settings sub-node (convert kebab keys → camelCase)
        const rawDisplaySettings = raw['display-settings'] ?? {};
        const converted = Object.fromEntries(
          Object.entries(rawDisplaySettings).map(([k, v]) => [
            kebabToCamel(k),
            v,
          ]),
        );
        setDisplayConfig({ ...DEFAULT_DISPLAY_CONFIG, ...converted });

        // timer-duration is a scalar at config/timer-duration
        const duration = raw['timer-duration'];
        setTimerDuration(
          typeof duration === 'number' && duration > 0
            ? duration
            : DEFAULT_TIMER_DURATION,
        );
      },
      (error) => {
        setIsError(true);
        setErrorMessage(error.message);
        console.error('useDisplayConfig error:', error);
      },
    );

    return () => unsubscribe();
  }, [authReady]);

  return { displayConfig, timerDuration, isListening, isError, errorMessage };
}
