// src/constants/app.js

// ── App Identity ───────────────────────────────────────────────────────────────

export const APP_NAME = 'Who Wants to Be a Millionaire';
export const APP_SHORT_NAME = 'WWBAM';

// ── Audience-facing UI copy ────────────────────────────────────────────────────
// All strings visible on the TV/projector screen, grouped by screen/phase.

// Loading screen
export const COPY_LOADING = {
  CONNECTING: 'Connecting...',
  CONNECTING_FIREBASE: 'Connecting to Firebase...',
  AUTHENTICATING: 'Authenticating...',
  AUTH_FAILED: 'Auth failed:', // suffix with `: ${errorMessage}` at call site
  CONNECTION_ERROR: 'Connection error:', // suffix with `: ${errorMessage}` at call site
};

// Idle screen — Lobby phase
export const COPY_LOBBY = {
  HEADING_WITH_TEAMS: "Tonight's Teams",
  HEADING_NO_TEAMS: 'Get Ready to Play',
  NO_TEAMS_MESSAGE: 'Waiting for teams to be registered...',
  FOOTER_NOTE: 'Team order & question sets will be assigned shortly...',
  WAITING_FOR_HOST: 'Waiting for host',
};

// Idle screen — Initializing phase (stepper)
export const COPY_STEPPER = {
  HEADING: 'Setting Up the Game',
  COMPLETE_MESSAGE: 'All set!',
};

// Idle screen — Ready phase
export const COPY_READY = {
  HEADING: 'Play Order',
  STARTING_SOON: 'Starting soon...',
};

// Game screen — Pause overlay
export const COPY_PAUSE = {
  HEADING: 'Paused',
  SUBHEADING: 'Game is on hold',
};

// Game screen — Between questions logo
export const COPY_BETWEEN_QUESTIONS = {
  LABEL: 'Get ready for the next question',
};

// Game screen — Team announcement overlay
export const COPY_ANNOUNCEMENT = {
  FIRST_UP: 'First Up',
  UP_NEXT: 'Up Next',
};

// Game screen — Team result overlay
export const COPY_TEAM_RESULT = {
  COMPLETED: 'Completed',
  ELIMINATED: 'Eliminated',
  TAKES_HOME: 'Takes Home',
};

// Game screen — Phone a Friend overlay
export const COPY_PHONE_A_FRIEND = {
  TITLE: 'Phone a Friend',
  CALL_IN_PROGRESS: 'Call in progress',
  TIMER_RUNNING: 'Connected',
};

// Results screen
export const COPY_RESULTS = {
  HEADING: 'Final Results',
};
