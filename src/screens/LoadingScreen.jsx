// src/screens/LoadingScreen.jsx

import { motion } from 'framer-motion';
import ScreenBackground from '@components/layout/ScreenBackground';
import { APP_NAME, APP_SHORT_NAME } from '@constants/app';

/**
 * LoadingScreen
 *
 * Shown while anonymous Firebase auth is pending or the first
 * database snapshot hasn't arrived yet.
 *
 * Accepts an optional `message` prop so App.jsx can surface the
 * specific stage (authenticating vs connecting to database).
 *
 * @param {{ message?: string }} props
 */
export default function LoadingScreen({ message = 'Connecting...' }) {
  return (
    <ScreenBackground>
      <div className="w-full h-full flex flex-col items-center justify-center gap-10">
        {/* Logo / Title */}
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}>
          <h1
            className="text-5xl font-black tracking-widest uppercase text-white"
            style={{ textShadow: '0 0 40px rgba(245,158,11,0.4)' }}>
            {APP_SHORT_NAME}
          </h1>
          <p className="text-slate-400 text-sm tracking-[0.3em] uppercase">
            {APP_NAME}
          </p>
        </motion.div>

        {/* Spinner + message */}
        <motion.div
          className="flex flex-col items-center gap-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}>
          {/* Pulsing ring */}
          <div className="relative w-14 h-14">
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-amber-400"
              animate={{ scale: [1, 1.6], opacity: [0.8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-amber-500"
              animate={{ scale: [1, 1.3], opacity: [0.6, 0] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: 'easeOut',
                delay: 0.4,
              }}
            />
            <span className="absolute inset-0 rounded-full border-2 border-amber-400/30" />
            {/* Inner dot */}
            <motion.span
              className="absolute inset-3 rounded-full bg-amber-400"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>

          <p className="text-slate-400 text-base tracking-widest uppercase">
            {message}
          </p>
        </motion.div>
      </div>
    </ScreenBackground>
  );
}
