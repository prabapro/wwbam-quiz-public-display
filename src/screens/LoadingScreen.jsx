// src/screens/LoadingScreen.jsx

import { motion } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';
import WwbamShape from '@components/ui/WwbamShape';
import { APP_NAME, APP_SHORT_NAME } from '@constants/app';

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
export default function LoadingScreen({ message = 'Connecting...' }) {
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
          className="relative w-14 h-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          {/* Outer expanding ring */}
          <motion.span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'var(--c-gold)' }}
            animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
          {/* Mid expanding ring */}
          <motion.span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'var(--c-gold-dark)' }}
            animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              ease: 'easeOut',
              delay: 0.4,
            }}
          />
          {/* Static outer ring */}
          <span
            className="absolute inset-0 rounded-full border-2"
            style={{ borderColor: 'var(--c-gold-deep)' }}
          />
          {/* Pulsing inner dot */}
          <motion.span
            className="absolute inset-3 rounded-full"
            style={{ background: 'var(--c-gold)' }}
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>

        {/* ── Status message ────────────────────────────────────────────── */}
        <motion.div
          className="w-full max-w-lg flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}>
          <WwbamShape
            size="wide"
            state="default"
            strokeWidth={3}
            className="flex-1"
            style={{ minHeight: '56px' }}>
            <div className="flex items-center justify-center py-3 w-full">
              <p
                className="wwbam-label"
                style={{ color: 'var(--c-text-dim)', letterSpacing: '0.35em' }}>
                {message}
              </p>
            </div>
          </WwbamShape>
        </motion.div>
      </div>
    </ScreenBackground>
  );
}
