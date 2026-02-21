// src/hooks/useFirebaseAuth.js

import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInAnon } from '@config/firebase';

/**
 * useFirebaseAuth
 *
 * Triggers anonymous sign-in on mount and tracks auth state.
 * All database listeners should only start once `isReady` is true —
 * Firebase will reject reads if auth hasn't resolved yet.
 *
 * @returns {{
 *   isReady: boolean,          // true once anonymous auth is confirmed
 *   isError: boolean,          // true if sign-in failed
 *   errorMessage: string|null,
 *   uid: string|null,          // anonymous user UID (useful for debugging)
 * }}
 */
export function useFirebaseAuth() {
  const [isReady, setIsReady] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    // Listen for auth state changes first.
    // onAuthStateChanged fires immediately if a session already exists
    // (e.g. hot reload), avoiding an unnecessary extra signInAnonymously call.
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUid(user.uid);
        setIsReady(true);
        setIsError(false);
        console.log('🔐 Auth ready — uid:', user.uid);
      }
    });

    // Attempt anonymous sign-in.
    // If a session already exists, onAuthStateChanged above handles it.
    signInAnon().then(({ success, error }) => {
      if (!success) {
        setIsError(true);
        setErrorMessage(error);
        console.error('❌ Could not authenticate:', error);
      }
    });

    return () => unsubscribe();
  }, []);

  return { isReady, isError, errorMessage, uid };
}
