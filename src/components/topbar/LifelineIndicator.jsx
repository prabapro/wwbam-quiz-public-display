// src/components/topbar/LifelineIndicator.jsx

import { motion, AnimatePresence } from 'framer-motion';

// ── Constants ──────────────────────────────────────────────────────────────────

const LIFELINES = [
  {
    key: 'phoneAFriend',
    activeKey: 'phone-a-friend',
    label: 'Phone',
    icon: '📞',
  },
  {
    key: 'fiftyFifty',
    activeKey: 'fifty-fifty',
    label: '50 / 50',
    icon: '✂️',
  },
];

// ── Styles ─────────────────────────────────────────────────────────────────────

const stateStyles = {
  active: {
    background: 'rgba(245,158,11,0.25)',
    border: '1px solid rgba(245,158,11,0.7)',
    color: '#f59e0b',
    boxShadow: '0 0 16px rgba(245,158,11,0.3)',
  },
  available: {
    background: 'rgba(30,58,138,0.5)',
    border: '1px solid rgba(99,132,255,0.4)',
    color: '#ffffff',
  },
  used: {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#334155',
  },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * LifelineIndicator
 *
 * Read-only badges showing which lifelines are available / active / used
 * for the current team. Rendered in the top bar of GameScreen.
 *
 * States per lifeline:
 *   active    → currently in use (amber glow)
 *   available → can still be used (blue)
 *   used      → already consumed (dimmed)
 *
 * @param {{
 *   lifelinesAvailable: { phoneAFriend: boolean, fiftyFifty: boolean } | null,
 *   activeLifeline:     string|null,
 * }} props
 */
export default function LifelineIndicator({
  lifelinesAvailable,
  activeLifeline,
}) {
  return (
    <div className="flex items-center gap-3">
      {LIFELINES.map((lifeline) => {
        const isActive = activeLifeline === lifeline.activeKey;
        const isAvailable = lifelinesAvailable?.[lifeline.key] === true;
        const state = isActive ? 'active' : isAvailable ? 'available' : 'used';
        const style = stateStyles[state];

        return (
          <AnimatePresence key={lifeline.key} mode="wait">
            <motion.div
              key={state}
              className="flex items-center gap-2 px-4 py-2 rounded-lg select-none"
              style={style}
              initial={{ opacity: 0.6, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.25 }}>
              {/* Pulse ring when active */}
              {isActive && (
                <motion.span className="relative flex h-2 w-2 shrink-0">
                  <motion.span
                    className="absolute inline-flex h-full w-full rounded-full bg-amber-400"
                    animate={{ scale: [1, 2], opacity: [0.7, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                </motion.span>
              )}

              <span
                className={`text-base ${state === 'used' ? 'grayscale opacity-30' : ''}`}>
                {lifeline.icon}
              </span>
              <span className="text-sm font-semibold tracking-wide">
                {lifeline.label}
              </span>
            </motion.div>
          </AnimatePresence>
        );
      })}
    </div>
  );
}
