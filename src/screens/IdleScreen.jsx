// src/screens/IdleScreen.jsx

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';
import ScreenHeader from '@components/layout/ScreenHeader';
import WwbamShape from '@components/ui/WwbamShape';
import TeamRosterCard from '@components/pregame/TeamRosterCard';
import InitializationStepper from '@components/pregame/InitializationStepper';
import { COPY_LOBBY, COPY_READY } from '@constants/app';

// ── Phase constants ────────────────────────────────────────────────────────────

const PHASE = {
  LOBBY: 'lobby',
  INITIALIZING: 'initializing',
  READY: 'ready',
};

// ── Animation variants ─────────────────────────────────────────────────────────

const phaseContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.35, ease: 'easeIn' } },
};

// Stagger container — drives sequential reveal of major sections within a phase.
const sectionStaggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.2 },
  },
};

// Each staggered section fades up into position.
const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Card stagger — orchestrates TeamRosterCards sequentially.
// Uses different keys (enter/show) to stay completely isolated from the outer
// section stagger (hidden/visible), preventing any variant name conflicts.
const cardStaggerVariants = {
  enter: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const cardItemVariants = {
  enter: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: 'easeOut' } },
};

// ── Shared sub-components ──────────────────────────────────────────────────────

/**
 * AmbientGlow
 * Soft pulsing rings centered behind the content on all phases.
 * All colours via CSS tokens — no raw rgba.
 */
function AmbientGlow() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {/* Outer gold ring */}
      <motion.div
        className="w-150 h-150 rounded-full border"
        style={{ borderColor: 'var(--c-gold-deep)' }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner blue ring */}
      <motion.div
        className="absolute w-95 h-95 rounded-full border"
        style={{ borderColor: 'var(--c-blue-deep)' }}
        animate={{ scale: [1, 1.08, 1], opacity: [0.1, 0.22, 0.1] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
    </div>
  );
}

// ── Phase: Lobby ───────────────────────────────────────────────────────────────

/**
 * LobbyPhase
 *
 * Shown when gameStatus is "not-started".
 *
 * Layout (top → bottom):
 *   ScreenHeader (logo + APP_NAME eyebrow + GoldDivider)
 *   [WwbamShape selected]  — "Tonight's Teams" / "Get Ready to Play" heading
 *   [team cards]           — TeamRosterCard × N  (or a "used" placeholder shape)
 *   [WwbamShape used]      — footer note
 *   "Waiting for host"     — dim pulsing text (no shape, truly secondary)
 *
 * The card stagger container uses `key={teams.length}` so that whenever the
 * host adds a new team, the container remounts and all cards animate in cleanly.
 */
function LobbyPhase({ teams }) {
  const hasTeams = teams.length > 0;

  return (
    <motion.div
      key="lobby"
      className="w-full h-full flex flex-col items-center justify-center gap-5 px-16 py-10"
      variants={phaseContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <AmbientGlow />

      {/* ── Stagger container ─────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full flex flex-col items-center gap-5"
        variants={sectionStaggerVariants}
        initial="hidden"
        animate="visible">
        {/* Logo + eyebrow + divider */}
        <motion.div variants={sectionVariants}>
          <ScreenHeader logoSize="w-20 h-20" />
        </motion.div>

        {/* Main heading — inside WwbamShape */}
        <motion.div
          variants={sectionVariants}
          className="w-full max-w-3xl flex">
          <WwbamShape
            size="wide"
            state="selected"
            strokeWidth={3}
            className="flex-1"
            style={{ minHeight: '88px' }}>
            <div className="flex items-center justify-center py-4 w-full text-center">
              <h1 className="wwbam-screen-heading wwbam-text-gold-gradient">
                {hasTeams
                  ? COPY_LOBBY.HEADING_WITH_TEAMS
                  : COPY_LOBBY.HEADING_NO_TEAMS}
              </h1>
            </div>
          </WwbamShape>
        </motion.div>

        {/* Teams list or no-teams placeholder */}
        {hasTeams ? (
          // Outer: participates in section stagger as one block.
          <motion.div variants={sectionVariants} className="w-full max-w-3xl">
            {/*
              Inner: isolated card stagger with `key={teams.length}`.

              WHY THE KEY: Framer Motion stagger containers animate their
              children on mount. Once the container has settled, newly
              inserted children don't automatically receive the stagger
              propagation — they stay at their `initial` state (invisible).

              By keying on `teams.length`, the container remounts every time
              a team is added.
            */}
            <motion.div
              key={teams.length}
              className="flex flex-col gap-3"
              initial="enter"
              animate="show"
              variants={cardStaggerVariants}>
              {teams.map((team, i) => (
                <motion.div key={team.id} variants={cardItemVariants}>
                  <TeamRosterCard team={team} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={sectionVariants}
            className="w-full max-w-3xl flex">
            <WwbamShape
              size="wide"
              state="used"
              strokeWidth={3}
              className="flex-1"
              style={{ minHeight: '72px' }}>
              <div className="flex items-center justify-center py-4 w-full">
                <p
                  className="wwbam-overlay-subheading"
                  style={{ color: 'var(--c-used-text)' }}>
                  {COPY_LOBBY.NO_TEAMS_MESSAGE}
                </p>
              </div>
            </WwbamShape>
          </motion.div>
        )}

        {/* Footer note */}
        <motion.div
          variants={sectionVariants}
          className="w-full max-w-3xl flex">
          <WwbamShape
            size="wide"
            state="selected"
            strokeWidth={2}
            className="flex-1"
            style={{ minHeight: '52px' }}>
            <div className="flex items-center justify-center py-3 w-full">
              <p
                className="wwbam-overlay-subheading"
                style={{ color: 'var(--c-text)', fontSize: '0.8rem' }}>
                {COPY_LOBBY.FOOTER_NOTE}
              </p>
            </div>
          </WwbamShape>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Phase: Initializing ────────────────────────────────────────────────────────

/**
 * InitializingPhase
 *
 * Shown during the live not-started → initialized transition.
 * The stepper itself (InitializationStepper) already uses WwbamShape per step.
 */
function InitializingPhase({ onComplete }) {
  return (
    <motion.div
      key="initializing"
      className="w-full h-full flex items-center justify-center"
      style={{
        background: 'var(--c-screen-bg-overlay)',
        backdropFilter: 'blur(2px)',
      }}
      variants={phaseContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <AmbientGlow />
      <div className="relative z-10">
        <InitializationStepper onComplete={onComplete} />
      </div>
    </motion.div>
  );
}

// ── Phase: Ready ───────────────────────────────────────────────────────────────

/**
 * ReadyPhase
 *
 * Shown after the stepper completes (or immediately if page loaded while
 * already initialized). Triumphant gold moment — everything is set.
 *
 * Layout (top → bottom):
 *   ScreenHeader (logo + APP_NAME eyebrow + GoldDivider)
 *   [WwbamShape selected]  — "Play Order" heading (gold gradient)
 *   [team cards]           — TeamRosterCard × N in play order
 *   [WwbamShape selected]  — "Starting soon..." pulsing the whole shape
 */
function ReadyPhase({ teams, gameState }) {
  const playQueue = gameState?.playQueue ?? [];
  const orderedTeams = playQueue
    .map((id) => teams.find((t) => t.id === id))
    .filter(Boolean);

  return (
    <motion.div
      key="ready"
      className="w-full h-full flex flex-col items-center justify-center gap-5 px-16 py-10"
      variants={phaseContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <AmbientGlow />

      {/* ── Stagger container ─────────────────────────────────────────── */}
      <motion.div
        className="relative z-10 w-full flex flex-col items-center gap-5"
        variants={sectionStaggerVariants}
        initial="hidden"
        animate="visible">
        {/* Logo + eyebrow + divider */}
        <motion.div variants={sectionVariants}>
          <ScreenHeader logoSize="w-16 h-16" />
        </motion.div>

        {/* "Play Order" heading */}
        <motion.div
          variants={sectionVariants}
          className="w-full max-w-3xl flex">
          <WwbamShape
            size="wide"
            state="selected"
            strokeWidth={3}
            className="flex-1"
            style={{ minHeight: '96px' }}>
            <div className="flex items-center justify-center py-5 w-full">
              <h1 className="wwbam-screen-heading wwbam-screen-heading--lg wwbam-text-gold-gradient">
                {COPY_READY.HEADING}
              </h1>
            </div>
          </WwbamShape>
        </motion.div>

        {/* Play order team cards */}
        {orderedTeams.length > 0 && (
          <motion.div
            variants={sectionVariants}
            className="w-full max-w-3xl flex flex-col gap-3">
            {/* Independent card stagger — isolated variant keys */}
            <motion.div
              className="flex flex-col gap-3"
              initial="enter"
              animate="show"
              variants={cardStaggerVariants}>
              {orderedTeams.map((team, i) => (
                <motion.div key={team.id} variants={cardItemVariants}>
                  <TeamRosterCard team={team} index={i} />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        {/* "Starting soon..." — the whole shape pulses opacity */}
        <motion.div
          variants={sectionVariants}
          className="w-full max-w-3xl flex"
          animate={{ opacity: [0.45, 1, 0.45] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
          <WwbamShape
            size="wide"
            state="selected"
            strokeWidth={3}
            className="flex-1"
            style={{ minHeight: '56px' }}>
            <div className="flex items-center justify-center py-3 w-full">
              <p className="wwbam-starting-soon">{COPY_READY.STARTING_SOON}</p>
            </div>
          </WwbamShape>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * IdleScreen
 *
 * Manages three visual phases based on gameStatus transitions:
 *
 *   LOBBY       — gameStatus: "not-started"  → team roster or waiting placeholder
 *   INITIALIZING— not-started → initialized live transition observed → stepper
 *   READY       — stepper done (or page loaded already initialized) → play order
 *
 * Phase derivation uses React's "storing information from previous renders"
 * pattern — setState called conditionally during render (not inside an effect).
 *
 * @param {{
 *   teams:     Array,
 *   gameState: object | null,
 * }} props
 */
export default function IdleScreen({ teams, gameState }) {
  const [phase, setPhase] = useState(() => {
    return gameState?.gameStatus === 'initialized' ? PHASE.READY : PHASE.LOBBY;
  });

  const [prevGameStatus, setPrevGameStatus] = useState(
    gameState?.gameStatus ?? null,
  );

  const handleStepperComplete = useCallback(() => {
    setPhase(PHASE.READY);
  }, []);

  // Detect the live not-started → initialized transition.
  // Using render-time setState ("storing information from previous renders")
  // instead of useEffect so the phase update is synchronous with the render cycle.
  const currentGameStatus = gameState?.gameStatus ?? null;
  if (currentGameStatus !== prevGameStatus) {
    setPrevGameStatus(currentGameStatus);
    if (
      prevGameStatus === 'not-started' &&
      currentGameStatus === 'initialized'
    ) {
      setPhase(PHASE.INITIALIZING);
    }
  }

  return (
    <ScreenBackground>
      <AnimatePresence mode="wait">
        {phase === PHASE.LOBBY && (
          <LobbyPhase key={PHASE.LOBBY} teams={teams} />
        )}
        {phase === PHASE.INITIALIZING && (
          <InitializingPhase
            key={PHASE.INITIALIZING}
            onComplete={handleStepperComplete}
          />
        )}
        {phase === PHASE.READY && (
          <ReadyPhase key={PHASE.READY} teams={teams} gameState={gameState} />
        )}
      </AnimatePresence>
    </ScreenBackground>
  );
}
