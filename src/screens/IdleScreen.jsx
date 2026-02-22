// src/screens/IdleScreen.jsx

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';
import TeamRosterCard from '@components/pregame/TeamRosterCard';
import InitializationStepper from '@components/pregame/InitializationStepper';

// ── Phase constants ────────────────────────────────────────────────────────────

/**
 * 'lobby'       — gameStatus is "not-started"; teams are registered, waiting.
 * 'initializing'— host just triggered init; stepper animation plays locally.
 * 'ready'       — stepper done (or page loaded while already initialized).
 */
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

const teamGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' },
  },
};

const queueItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.1 },
  }),
};

// ── Sub-components ─────────────────────────────────────────────────────────────

/** Shared ambient glow rings shown on all phases. */
function AmbientGlow() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="w-150 h-150 rounded-full border border-amber-400/5"
        animate={{ scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-100 h-100 rounded-full border border-blue-400/10"
        animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.7, 0.3] }}
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

/** Small spinning WWBAM logo used in lobby + ready phases. */
function SpinningLogo({ size = 'w-24 h-24' }) {
  return (
    <div style={{ perspective: '800px' }}>
      <motion.img
        src="/images/wwbam-logo.svg"
        alt="WWBAM Logo"
        className={`${size} drop-shadow-[0_0_30px_rgba(245,158,11,0.35)]`}
        animate={{ rotateY: [0, 360] }}
        transition={{
          duration: 2.5,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 3,
        }}
      />
    </div>
  );
}

/** Divider used between sections. */
function GoldDivider() {
  return (
    <div className="flex items-center gap-4 w-full max-w-xs">
      <span
        className="flex-1 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(245,158,11,0.4))',
        }}
      />
      <span style={{ color: 'rgba(245,158,11,0.6)', fontSize: '0.9rem' }}>
        ✦
      </span>
      <span
        className="flex-1 h-px"
        style={{
          background:
            'linear-gradient(270deg, transparent, rgba(245,158,11,0.4))',
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
 * Displays registered teams with participant names and a note that
 * team order & question sets will be assigned automatically.
 *
 * Note: The display app cannot read the `question-sets` Firebase node
 * (restricted to allowed-hosts only). So we don't show a question set count
 * here — that information becomes available in the "ready" phase via
 * gameState.questionSetAssignments after initialization.
 */
function LobbyPhase({ teams }) {
  const hasTeams = teams.length > 0;

  // Determine number of columns based on team count
  const gridCols =
    teams.length <= 2
      ? 'grid-cols-2'
      : teams.length <= 4
        ? 'grid-cols-2'
        : teams.length <= 6
          ? 'grid-cols-3'
          : 'grid-cols-4';

  return (
    <motion.div
      key="lobby"
      className="w-full h-full flex flex-col items-center justify-center gap-8 px-16 py-10"
      variants={phaseContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <AmbientGlow />

      {/* Header */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        variants={teamGridVariants}
        initial="hidden"
        animate="visible">
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center gap-2">
          <SpinningLogo size="w-16 h-16" />
          <p
            className="text-sm font-bold uppercase tracking-[0.4em]"
            style={{ color: 'var(--c-gold)' }}>
            Who Wants to Be a Millionaire
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <GoldDivider />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-5xl font-black uppercase tracking-widest text-white text-center"
          style={{
            fontFamily: 'var(--font-condensed)',
            textShadow: '0 0 60px rgba(245,158,11,0.2)',
          }}>
          {hasTeams ? "Tonight's Teams" : 'Get Ready to Play'}
        </motion.h1>
      </motion.div>

      {/* Team grid */}
      {hasTeams ? (
        <motion.div
          className={`relative z-10 grid ${gridCols} gap-4 w-full max-w-5xl`}
          variants={teamGridVariants}
          initial="hidden"
          animate="visible">
          {teams.map((team, index) => (
            <TeamRosterCard key={team.id} team={team} index={index} />
          ))}
        </motion.div>
      ) : (
        <motion.p
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          className="text-xl"
          style={{
            color: 'rgba(255,255,255,0.4)',
            fontFamily: 'var(--font-body)',
          }}>
          Waiting for teams to be registered...
        </motion.p>
      )}

      {/* Footer note */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-2 text-center"
        variants={itemVariants}
        initial="hidden"
        animate="visible">
        <p
          className="text-sm font-semibold tracking-widest uppercase"
          style={{ color: 'rgba(255,255,255,0.25)' }}>
          Team order &amp; question sets will be assigned automatically
        </p>
        <motion.p
          className="text-xs tracking-[0.3em] uppercase"
          style={{ color: 'rgba(255,255,255,0.15)' }}
          animate={{ opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
          Waiting for host
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

// ── Phase: Initializing ────────────────────────────────────────────────────────

function InitializingPhase({ onComplete }) {
  return (
    <motion.div
      key="initializing"
      className="w-full h-full flex items-center justify-center"
      style={{ background: 'rgba(5,5,28,0.6)', backdropFilter: 'blur(2px)' }}
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
 * Shown after the stepper completes (or immediately on page load when already
 * initialized). Shows the finalized play order from gameState.playQueue,
 * with question set assignments if available.
 */
function ReadyPhase({ teams, gameState }) {
  const playQueue = gameState?.playQueue ?? [];
  const assignments = gameState?.questionSetAssignments ?? {};

  // Build ordered team list from playQueue
  const orderedTeams = playQueue
    .map((id) => teams.find((t) => t.id === id))
    .filter(Boolean);

  const setCount = Object.values(assignments).filter(Boolean).length;

  return (
    <motion.div
      key="ready"
      className="w-full h-full flex flex-col items-center justify-center gap-8 px-16 py-10"
      variants={phaseContainerVariants}
      initial="hidden"
      animate="visible"
      exit="exit">
      <AmbientGlow />

      {/* Header */}
      <motion.div
        className="relative z-10 flex flex-col items-center gap-4"
        initial={{ opacity: 0, y: -16 }}
        animate={{
          opacity: 1,
          y: 0,
          transition: { duration: 0.6, ease: 'easeOut' },
        }}>
        <SpinningLogo size="w-16 h-16" />

        <p
          className="text-sm font-bold uppercase tracking-[0.4em]"
          style={{ color: 'var(--c-gold)' }}>
          Who Wants to Be a Millionaire
        </p>

        <GoldDivider />

        <h1
          className="text-5xl font-black uppercase tracking-widest text-white text-center"
          style={{
            fontFamily: 'var(--font-condensed)',
            textShadow: '0 0 60px rgba(245,158,11,0.25)',
          }}>
          Game Ready
        </h1>

        {setCount > 0 && (
          <p
            className="text-sm tracking-widest uppercase"
            style={{ color: 'rgba(255,255,255,0.4)' }}>
            {setCount} question {setCount === 1 ? 'set' : 'sets'} assigned
          </p>
        )}
      </motion.div>

      {/* Play order */}
      {orderedTeams.length > 0 && (
        <motion.div
          className="relative z-10 flex flex-col gap-3 w-full max-w-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 0.3 } }}>
          <p
            className="text-xs font-bold uppercase tracking-[0.3em] text-center mb-1"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Play Order
          </p>

          {orderedTeams.map((team, i) => (
            <motion.div
              key={team.id}
              custom={i}
              variants={queueItemVariants}
              initial="hidden"
              animate="visible"
              className="flex items-center gap-4 px-4 py-3 rounded-sm"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
              {/* Position number */}
              <span
                className="text-sm font-black tabular-nums shrink-0"
                style={{
                  color: 'var(--c-gold)',
                  fontFamily: 'var(--font-numeric)',
                  minWidth: '1.5rem',
                }}>
                {i + 1}
              </span>

              {/* Team info */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-white font-bold truncate"
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    letterSpacing: '0.04em',
                  }}>
                  {team.name}
                </p>
                {team.participants && (
                  <p
                    className="text-xs truncate"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {team.participants}
                  </p>
                )}
              </div>

              {/* Question set badge */}
              {assignments[team.id] && (
                <span
                  className="text-xs font-semibold px-2 py-1 rounded-sm shrink-0"
                  style={{
                    color: 'var(--c-blue-light)',
                    background: 'rgba(26,79,207,0.2)',
                    border: '1px solid rgba(74,143,232,0.25)',
                    fontFamily: 'var(--font-condensed)',
                    letterSpacing: '0.05em',
                  }}>
                  {assignments[team.id]}
                </span>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Starting soon pulse */}
      <motion.p
        className="relative z-10 text-base font-semibold tracking-[0.35em] uppercase"
        style={{ color: 'rgba(255,255,255,0.4)' }}
        animate={{ opacity: [0.4, 0.85, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}>
        Starting soon...
      </motion.p>
    </motion.div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

/**
 * IdleScreen
 *
 * Manages three visual phases based on gameStatus transitions:
 *
 *   'lobby'       — gameStatus: "not-started"  → shows team roster
 *   'initializing'— transition detected locally → stepper animation plays
 *   'ready'       — stepper done (or page loaded while already initialized)
 *                   → shows play order, pulsing "Starting soon…"
 *
 * Phase is derived during render using React's "storing information from
 * previous renders" pattern — setState called conditionally during render
 * (not inside an effect), which React supports and the linter accepts.
 *
 *   prevGameStatus    — mirrors gameStatus in state so we can compare renders.
 *   stepperTriggered  — set true when the not-started → initialized live
 *                       transition is observed; never resets within a session.
 *   stepperDone       — set true when the stepper calls onComplete.
 *
 * Derived phase table:
 *   gameStatus !== 'initialized'                               → LOBBY
 *   gameStatus === 'initialized' && !stepperTriggered          → READY  (loaded mid-game)
 *   gameStatus === 'initialized' && triggered && !done         → INITIALIZING
 *   gameStatus === 'initialized' && triggered && done          → READY
 *
 * @param {{
 *   gameStatus: string,
 *   teams:      Array,
 *   gameState:  object | null,
 * }} props
 */
export default function IdleScreen({ gameStatus, teams, gameState }) {
  // Whether the stepper animation has fully completed.
  const [stepperDone, setStepperDone] = useState(false);

  // Whether the live not-started → initialized transition was observed.
  // Pages that load while already initialized never set this — they skip
  // straight to READY without playing the stepper.
  const [stepperTriggered, setStepperTriggered] = useState(false);

  // Previous gameStatus stored in state — the React-sanctioned pattern for
  // "storing information from previous renders" (no refs, no effects).
  // See: react.dev/reference/react/useState#storing-information-from-previous-renders
  const [prevGameStatus, setPrevGameStatus] = useState(gameStatus);

  // Conditional setState during render: React immediately re-renders without
  // a browser paint, and the linter is satisfied because this is not inside
  // an effect body.
  if (prevGameStatus !== gameStatus) {
    setPrevGameStatus(gameStatus);
    if (prevGameStatus === 'not-started' && gameStatus === 'initialized') {
      setStepperTriggered(true);
    }
  }

  // Derive the current phase — pure calculation, nothing asynchronous.
  const phase = (() => {
    if (gameStatus !== 'initialized') return PHASE.LOBBY;
    if (stepperTriggered && !stepperDone) return PHASE.INITIALIZING;
    return PHASE.READY;
  })();

  // Called by InitializationStepper when all steps are complete.
  const handleStepperComplete = useCallback(() => {
    setStepperDone(true);
  }, []);

  return (
    <ScreenBackground>
      <AnimatePresence mode="wait">
        {phase === PHASE.LOBBY && <LobbyPhase key="lobby" teams={teams} />}

        {phase === PHASE.INITIALIZING && (
          <InitializingPhase
            key="initializing"
            onComplete={handleStepperComplete}
          />
        )}

        {phase === PHASE.READY && (
          <ReadyPhase key="ready" teams={teams} gameState={gameState} />
        )}
      </AnimatePresence>
    </ScreenBackground>
  );
}
