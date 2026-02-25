// src/screens/LoadingScreen.jsx

import { motion } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';
import WwbamShape from '@components/ui/WwbamShape';
import { APP_NAME, APP_SHORT_NAME, COPY_LOADING } from '@constants/app';

/**
 * LoadingScreen
 *
 * Shown while anonymous Firebase auth is pending or the first
 * database snapshot hasn't arrived yet.
 *
 * Layout (vertical stack, centered):
 *   [WwbamShape selected]  — APP_SHORT_NAME (gold shimmer) + APP_NAME label
 *   [spinner]              — free-floating pulsing rings
 *   [WwbamShape default]   — status message (blue shimmer)
 *
 * @param {{ message?: string }} props
 */
export default function LoadingScreen({ message = COPY_LOADING.CONNECTING }) {
  return (
    <ScreenBackground>
      <div className="w-full h-full flex flex-col items-center justify-center gap-10">
        {/* ── Title block ───────────────────────────────────────────────── */}
        <motion.div
          className="w-full max-w-lg flex"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}>
          <WwbamShape
            size="wide"
            state="selected"
            strokeWidth={3}
            className="flex-1"
            style={{ minHeight: '108px' }}>
            <div className="flex flex-col items-center justify-center gap-2 py-5 w-full">
              <h1
                className="wwbam-text-gold-gradient leading-none"
                style={{
                  fontFamily: 'var(--font-numeric)',
                  fontSize: '3.5rem',
                  letterSpacing: '0.12em',
                }}>
                {APP_SHORT_NAME}
              </h1>
              <p className="wwbam-label" style={{ letterSpacing: '0.25em' }}>
                {APP_NAME}
              </p>
            </div>
          </WwbamShape>
        </motion.div>

        {/* ── Spinner ───────────────────────────────────────────────────── */}
        <motion.div
          className="relative flex items-center justify-center w-20 h-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          {/* Outer ring */}
          <motion.div
            className="absolute w-20 h-20 rounded-full border-2"
            style={{ borderColor: 'var(--c-gold-deep)' }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Inner ring */}
          <motion.div
            className="absolute w-12 h-12 rounded-full border-2"
            style={{ borderColor: 'var(--c-gold-dark)' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 0.3,
            }}
          />
          {/* Core dot */}
          <motion.div
            className="w-3 h-3 rounded-full"
            style={{ background: 'var(--c-gold)' }}
            animate={{ opacity: [0.8, 1, 0.8] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* ── Status message ────────────────────────────────────────────── */}
        <motion.div
          className="w-full max-w-lg flex"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}>
          <WwbamShape
            size="wide"
            state="default"
            strokeWidth={3}
            className="flex-1"
            style={{ minHeight: '64px' }}>
            <div className="flex items-center justify-center py-4 w-full">
              <p
                className="wwbam-label"
                style={{ letterSpacing: '0.2em', color: 'var(--c-text-dim)' }}>
                {message}
              </p>
            </div>
          </WwbamShape>
        </motion.div>
      </div>
    </ScreenBackground>
  );
}
