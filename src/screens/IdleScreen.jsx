// src/screens/IdleScreen.jsx

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';
import WwbamShape from '@components/ui/WwbamShape';
import TeamRosterCard from '@components/pregame/TeamRosterCard';
import InitializationStepper from '@components/pregame/InitializationStepper';
import { APP_NAME, COPY_LOBBY, COPY_READY } from '@constants/app';

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
        className="w-[600px] h-[600px] rounded-full border"
        style={{ borderColor: 'var(--c-gold-deep)' }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.12, 0.28, 0.12] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner blue ring */}
      <motion.div
        className="absolute w-[380px] h-[380px] rounded-full border"
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

/**
 * SpinningLogo
 * WWBAM logo with a slow Y-axis rotation loop and gold drop-shadow.
 */
function SpinningLogo({ size = 'w-20 h-20' }) {
  return (
    <div style={{ perspective: '800px' }}>
      <motion.img
        src="/images/wwbam-logo.svg"
        alt="WWBAM Logo"
        className={`${size}`}
        style={{ filter: 'drop-shadow(0 0 28px var(--c-gold-dark))' }}
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

/**
 * GoldDivider
 * Horizontal rule with a ✦ centrepiece — all colours via tokens.
 */
function GoldDivider() {
  return (
    <div className="flex items-center gap-4 w-56">
      <span
        className="flex-1 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--c-gold-dark))',
        }}
      />
      <span
        style={{
          color: 'var(--c-gold)',
          fontFamily: 'var(--font-condensed)',
          fontSize: '0.85rem',
        }}>
        ✦
      </span>
      <span
        className="flex-1 h-px"
        style={{
          background:
            'linear-gradient(270deg, transparent, var(--c-gold-dark))',
        }}
      />
    </div>
  );
}

/**
 * AppEyebrow
 * Show title displayed above the main heading — animated gold shimmer text.
 */
function AppEyebrow() {
  return (
    <p
      className="wwbam-label wwbam-text-gold-gradient"
      style={{ letterSpacing: '0.28em' }}>
      {APP_NAME}
    </p>
  );
}

// ── Phase: Lobby ───────────────────────────────────────────────────────────────

/**
 * LobbyPhase
 *
 * Shown when gameStatus is "not-started".
 *
 * Layout (top → bottom):
 *   Logo + APP_NAME eyebrow (gold shimmer) + GoldDivider
 *   [WwbamShape default]  — "Tonight's Teams" / "Get Ready to Play" heading
 *   [team cards]          — TeamRosterCard × N  (or a "used" placeholder shape)
 *   [WwbamShape used]     — footer note
 *   "Waiting for host"    — dim pulsing text (no shape, truly secondary)
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
        <motion.div
          variants={sectionVariants}
          className="flex flex-col items-center gap-3">
          <SpinningLogo size="w-20 h-20" />
          <AppEyebrow />
          <GoldDivider />
        </motion.div>

        {/* Main heading — inside WwbamShape */}
        <motion.div
          variants={sectionVariants}
          className="w-full max-w-3xl flex">
          <WwbamShape
            size="wide"
            state="default"
            strokeWidth={3}
            className="flex-1"
            style={{ minHeight: '88px' }}>
            <div className="flex items-center justify-center py-4 w-full">
              <h1
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: '3.4rem',
                  fontWeight: 900,
                  color: 'var(--c-text)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textShadow: '0 0 40px rgba(74, 143, 232, 0.25)',
                  lineHeight: 1,
                }}>
                {hasTeams
                  ? COPY_LOBBY.HEADING_WITH_TEAMS
                  : COPY_LOBBY.HEADING_NO_TEAMS}
              </h1>
            </div>
          </WwbamShape>
        </motion.div>

        {/* Teams list or no-teams placeholder */}
        {hasTeams ? (
          // Outer: participates in section stagger as one block
          <motion.div variants={sectionVariants} className="w-full max-w-3xl">
            {/* Inner: isolated card stagger — different variant keys (enter/show)
                avoid any conflict with the outer hidden/visible stagger */}
            <motion.div
              className="flex flex-col gap-3"
              initial="enter"
              animate="show"
              variants={cardStaggerVariants}>
              {teams.map((team, index) => (
                <motion.div key={team.id} variants={cardItemVariants}>
                  <TeamRosterCard team={team} index={index} />
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
                  className="wwbam-team-name"
                  style={{ color: 'var(--c-used-text)' }}>
                  {COPY_LOBBY.NO_TEAMS_MESSAGE}
                </p>
              </div>
            </WwbamShape>
          </motion.div>
        )}

        {/* Footer section — note in shape + dim pulse below */}
        <motion.div
          variants={sectionVariants}
          className="w-full max-w-3xl flex flex-col items-center gap-3">
          {/* Footer note in a used-state shape */}
          <div className="w-full flex">
            <WwbamShape
              size="wide"
              state="used"
              strokeWidth={3}
              className="flex-1"
              style={{ minHeight: '52px' }}>
              <div className="flex items-center justify-center py-3 w-full">
                <p
                  className="wwbam-label"
                  style={{
                    letterSpacing: '0.2em',
                    color: 'var(--c-text-muted)',
                  }}>
                  {COPY_LOBBY.FOOTER_NOTE}
                </p>
              </div>
            </WwbamShape>
          </div>

          {/* "Waiting for host" — dim pulsing text, no shape */}
          <motion.p
            className="wwbam-label"
            style={{ color: 'var(--c-used-subtext)', letterSpacing: '0.3em' }}
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
            {COPY_LOBBY.WAITING_FOR_HOST}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ── Phase: Initializing ────────────────────────────────────────────────────────

/**
 * InitializingPhase
 * Darkened overlay so the stepper pops against the background.
 * The stepper itself (InitializationStepper) already uses WwbamShape per step.
 */
function InitializingPhase({ onComplete }) {
  return (
    <motion.div
      key="initializing"
      className="w-full h-full flex items-center justify-center"
      // #05051c @ 60% — same hue as --c-screen-bg, no CSS variable needed for rgba
      style={{ background: 'rgba(5, 5, 28, 0.6)', backdropFilter: 'blur(2px)' }}
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
 *   Logo + APP_NAME eyebrow + GoldDivider
 *   [WwbamShape selected]  — "Game Ready" heading (gold-on-gold)
 *   "Play Order" label     — floating dim label above team list
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
        <motion.div
          variants={sectionVariants}
          className="flex flex-col items-center gap-3">
          <SpinningLogo size="w-16 h-16" />
          <AppEyebrow />
          <GoldDivider />
        </motion.div>

        {/* "Game Ready" heading — gold-on-gold: selected shape + gradient text */}
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
              <h1
                className="wwbam-text-gold-gradient"
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: '3.8rem',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}>
                {COPY_READY.HEADING}
              </h1>
            </div>
          </WwbamShape>
        </motion.div>

        {/* Play order — label + team cards */}
        {orderedTeams.length > 0 && (
          <motion.div
            variants={sectionVariants}
            className="w-full max-w-3xl flex flex-col gap-3">
            <p
              className="wwbam-label text-center"
              style={{ letterSpacing: '0.3em', color: 'var(--c-text-muted)' }}>
              {COPY_READY.PLAY_ORDER_LABEL}
            </p>

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
              <p
                style={{
                  fontFamily: 'var(--font-condensed)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--c-gold)',
                  letterSpacing: '0.4em',
                  textTransform: 'uppercase',
                }}>
                {COPY_READY.STARTING_SOON}
              </p>
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
 *   gameStatus: string,
 *   teams:      Array,
 *   gameState:  object | null,
 * }} props
 */
export default function IdleScreen({ gameStatus, teams, gameState }) {
  const [stepperDone, setStepperDone] = useState(false);
  const [stepperTriggered, setStepperTriggered] = useState(false);
  const [prevGameStatus, setPrevGameStatus] = useState(gameStatus);

  if (prevGameStatus !== gameStatus) {
    setPrevGameStatus(gameStatus);
    if (prevGameStatus === 'not-started' && gameStatus === 'initialized') {
      setStepperTriggered(true);
    }
  }

  const phase = (() => {
    if (gameStatus !== 'initialized') return PHASE.LOBBY;
    if (stepperTriggered && !stepperDone) return PHASE.INITIALIZING;
    return PHASE.READY;
  })();

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
