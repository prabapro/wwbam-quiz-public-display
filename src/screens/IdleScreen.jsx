// src/screens/IdleScreen.jsx

import { motion } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';

// ── Animation variants ─────────────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * IdleScreen
 *
 * Displayed when gameStatus is "not-started" or "initialized".
 * Shows branding and a "standby" message — no game data to display yet.
 *
 * The WWBAM logo SVG spins on the Y-axis (west → east) in a continuous loop
 * with a short pause between each rotation, giving it a polished "attract" feel.
 * A CSS perspective on the parent container makes the 3D rotation visible.
 *
 * @param {{ gameStatus: string }} props
 */
export default function IdleScreen({ gameStatus }) {
  const isInitialized = gameStatus === 'initialized';

  return (
    <ScreenBackground>
      <div className="w-full h-full flex flex-col items-center justify-center gap-0">
        {/* Ambient glow rings */}
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

        {/* Content */}
        <motion.div
          className="relative flex flex-col items-center gap-8 z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible">
          {/* Show title */}
          <motion.p
            variants={itemVariants}
            className="text-amber-400 text-sm tracking-[0.4em] uppercase font-semibold">
            Who Wants to Be a Millionaire
          </motion.p>

          {/* Logo — 3D Y-axis spin (west → east) */}
          <motion.div
            variants={itemVariants}
            // perspective here makes the rotateY visually 3D
            style={{ perspective: '800px' }}>
            <motion.img
              src="/images/wwbam-logo.svg"
              alt="WWBAM Logo"
              className="w-48 h-48 drop-shadow-[0_0_40px_rgba(245,158,11,0.4)]"
              animate={{ rotateY: [0, 360] }}
              transition={{
                duration: 2.5,
                ease: 'easeInOut',
                repeat: Infinity,
                repeatDelay: 2.5,
              }}
            />
          </motion.div>

          {/* Divider */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 w-80">
            <span className="flex-1 h-px bg-linear-to-r from-transparent to-amber-400/40" />
            <span className="text-amber-400/60 text-lg">✦</span>
            <span className="flex-1 h-px bg-linear-to-l from-transparent to-amber-400/40" />
          </motion.div>

          {/* Status message */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center gap-3">
            {isInitialized ? (
              <>
                <p className="text-white text-2xl font-semibold tracking-wide">
                  Game is ready
                </p>
                <motion.p
                  className="text-slate-400 text-base tracking-widest uppercase"
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}>
                  Starting soon...
                </motion.p>
              </>
            ) : (
              <>
                <p className="text-white text-2xl font-semibold tracking-wide">
                  Get ready to play
                </p>
                <p className="text-slate-400 text-base tracking-widest uppercase">
                  Waiting for host
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </ScreenBackground>
  );
}
