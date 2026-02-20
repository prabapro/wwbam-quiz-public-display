// src/config/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, signInAnonymously } from 'firebase/auth';
import { getDatabase, connectDatabaseEmulator } from 'firebase/database';

// ============================================================================
// ENVIRONMENT HELPERS
// ============================================================================

/**
 * Returns true only in local development.
 * Display app connects to the emulator started by the HOST PANEL project.
 * Run from host panel: `firebase emulators:start`
 */
const shouldUseEmulator = () => {
	return import.meta.env.VITE_ENVIRONMENT === 'development';
};

/**
 * Resolves the correct database URL per environment.
 * In development the emulator is used, so this value is ignored —
 * but it must still be present to satisfy the Firebase SDK init.
 */
const getDatabaseURL = () => {
	const url = import.meta.env.VITE_FIREBASE_DATABASE_URL;
	if (!url && !shouldUseEmulator()) {
		throw new Error(
			'VITE_FIREBASE_DATABASE_URL is required for staging/production.',
		);
	}
	// Emulator ignores this — provide a placeholder so SDK doesn't throw
	return url || 'http://localhost:9000?ns=wwbam-quiz';
};

// ============================================================================
// FIREBASE CONFIG
// ============================================================================

const firebaseConfig = {
	apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
	authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
	projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
	storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
	messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
	appId: import.meta.env.VITE_FIREBASE_APP_ID,
	databaseURL: getDatabaseURL(),
};

// Validate required fields are present
const REQUIRED_FIELDS = [
	'apiKey',
	'authDomain',
	'projectId',
	'storageBucket',
	'messagingSenderId',
	'appId',
];

const missingFields = REQUIRED_FIELDS.filter((field) => !firebaseConfig[field]);
if (missingFields.length > 0) {
	throw new Error(
		`Firebase config incomplete. Missing: ${missingFields.join(', ')}`,
	);
}

// ============================================================================
// INITIALIZE FIREBASE
// ============================================================================

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const database = getDatabase(app);

// ============================================================================
// EMULATOR CONNECTION
// ============================================================================

/**
 * Connect to Firebase Emulators in development.
 *
 * IMPORTANT: The emulator is started by the HOST PANEL project, not this one.
 * Ports must match what is configured in the host panel's firebase.json:
 *   Auth:     localhost:9099
 *   Database: localhost:9000
 */
if (shouldUseEmulator()) {
	connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
	connectDatabaseEmulator(database, 'localhost', 9000);

	console.log('🔧 Display app connected to Firebase Emulators:', {
		auth: 'localhost:9099',
		database: 'localhost:9000',
		note: 'Emulator must be started from the host panel project',
	});
}

// ============================================================================
// ANONYMOUS AUTH
// ============================================================================

/**
 * Sign in anonymously to satisfy Firebase security rules.
 * All database nodes require auth != null — anonymous auth fulfils this
 * without exposing any credentials or showing a login screen.
 *
 * Called once on app mount via useFirebaseAuth hook.
 * Returns the anonymous user credential.
 */
export const signInAnon = async () => {
	try {
		const credential = await signInAnonymously(auth);
		console.log('✅ Anonymous auth successful:', credential.user.uid);
		return { success: true, user: credential.user };
	} catch (error) {
		console.error('❌ Anonymous auth failed:', error.message);
		return { success: false, error: error.message };
	}
};

// ============================================================================
// ENVIRONMENT INFO (dev debugging)
// ============================================================================

if (import.meta.env.DEV) {
	console.log('🔥 Firebase Display App initialized:', {
		projectId: firebaseConfig.projectId,
		environment: import.meta.env.VITE_ENVIRONMENT || 'development',
		useEmulator: shouldUseEmulator(),
		databaseURL: shouldUseEmulator() ? 'Emulator' : firebaseConfig.databaseURL,
	});
}

export default app;
