// src/hooks/useTeams.js

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@config/firebase';
import { kebabToCamel } from '@utils/transforms';

/**
 * useTeams
 *
 * Attaches a real-time listener to the `teams` Firebase node.
 * Returns an array of team objects sorted by their key (team-1, team-2, …)
 * so the order is deterministic regardless of Firebase insertion order.
 *
 * Only starts listening once `authReady` is true.
 *
 * @param {boolean} authReady - Pass `isReady` from useFirebaseAuth
 *
 * @returns {{
 *   teams: Array<{
 *     id: string,
 *     name: string,
 *     participants: string,
 *     status: 'waiting'|'active'|'eliminated'|'completed',
 *     currentPrize: number,
 *     lifelinesAvailable: { phoneAFriend: boolean, fiftyFifty: boolean },
 *   }>,
 *   isListening: boolean,
 *   isError: boolean,
 *   errorMessage: string|null,
 * }}
 */
export function useTeams(authReady) {
  const [teams, setTeams] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!authReady) return;

    console.log('📡 Starting teams listener...');

    const teamsRef = ref(database, 'teams');

    const unsubscribe = onValue(
      teamsRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.val();

          // Convert each team's keys from kebab-case to camelCase,
          // then flatten into a sorted array with the team ID attached.
          const converted = Object.entries(raw)
            .map(([id, team]) => ({ id, ...kebabToCamel(team) }))
            .sort((a, b) => a.id.localeCompare(b.id));

          setTeams(converted);
          console.log('👥 teams updated — count:', converted.length);
        } else {
          setTeams([]);
          console.warn('⚠️ teams node is empty in Firebase');
        }
        setIsListening(true);
        setIsError(false);
      },
      (error) => {
        console.error('❌ teams listener error:', error.message);
        setIsError(true);
        setErrorMessage(error.message);
        setIsListening(false);
      },
    );

    return () => {
      console.log('🛑 teams listener stopped');
      unsubscribe();
    };
  }, [authReady]);

  return { teams, isListening, isError, errorMessage };
}
