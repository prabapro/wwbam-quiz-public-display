// src/hooks/usePrizeStructure.js

import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '@config/firebase';

/**
 * usePrizeStructure
 *
 * Attaches a real-time listener to the `prize-structure` Firebase node.
 * The node is a plain array of numbers where index 0 = Question 1 prize,
 * index 19 = Question 20 prize — no key conversion needed.
 *
 * Only starts listening once `authReady` is true.
 *
 * @param {boolean} authReady - Pass `isReady` from useFirebaseAuth
 *
 * @returns {{
 *   prizeStructure: number[],  // e.g. [500, 1000, 1500, …]
 *   isListening: boolean,
 *   isError: boolean,
 *   errorMessage: string|null,
 * }}
 */
export function usePrizeStructure(authReady) {
  const [prizeStructure, setPrizeStructure] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    if (!authReady) return;

    console.log('📡 Starting prize-structure listener...');

    const prizeRef = ref(database, 'prize-structure');

    const unsubscribe = onValue(
      prizeRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const raw = snapshot.val();

          // Firebase may return a sparse object instead of a dense array
          // if entries were deleted. Object.values restores the correct order.
          const normalized = Array.isArray(raw) ? raw : Object.values(raw);

          setPrizeStructure(normalized);
          console.log(
            '💰 prize-structure updated — levels:',
            normalized.length,
          );
        } else {
          setPrizeStructure([]);
          console.warn('⚠️ prize-structure node is empty in Firebase');
        }
        setIsListening(true);
        setIsError(false);
      },
      (error) => {
        console.error('❌ prize-structure listener error:', error.message);
        setIsError(true);
        setErrorMessage(error.message);
        setIsListening(false);
      },
    );

    return () => {
      console.log('🛑 prize-structure listener stopped');
      unsubscribe();
    };
  }, [authReady]);

  return { prizeStructure, isListening, isError, errorMessage };
}
