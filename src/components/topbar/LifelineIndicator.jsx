// src/components/topbar/LifelineIndicator.jsx

import { motion } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';

// ── Constants ──────────────────────────────────────────────────────────────────

const LIFELINES = [
  {
    key: 'phoneAFriend',
    activeKey: 'phone-a-friend',
    label: 'Phone a Friend',
    icon: '📞',
  },
  {
    key: 'fiftyFifty',
    activeKey: 'fifty-fifty',
    label: '50 / 50',
    icon: '✂️',
  },
];

const STATE_LABELS = {
  active: 'In Use',
  available: 'Available',
  used: 'Used',
};

const STATE_LABEL_COLORS = {
  active: 'var(--c-gold)',
  available: 'var(--c-text-dim)',
  used: 'var(--c-text-muted)',
};

// WwbamShape state mapping: lifeline states → shape states
const SHAPE_STATE = {
  active: 'selected', // amber shimmer
  available: 'default', // blue shimmer
  used: 'dimmed', // near-invisible
};

// ── Helpers ────────────────────────────────────────────────────────────────────

function deriveState(lifeline, lifelinesAvailable, activeLifeline) {
  if (activeLifeline === lifeline.activeKey) return 'active';
  if (lifelinesAvailable?.[lifeline.key] === true) return 'available';
  return 'used';
}

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * LifelineIndicator
 *
 * Two WWBAM-style shaped cards in the GameScreen top bar — one per lifeline.
 * Each shows the lifeline icon, name, and live availability status.
 *
 * Shape rendering and animated gradient border are handled by <WwbamShape>.
 * State (available / active / used) maps to a WwbamShape state variant.
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
    <div className="flex items-stretch gap-3 shrink-0">
      {LIFELINES.map((lifeline) => {
        const state = deriveState(lifeline, lifelinesAvailable, activeLifeline);
        const shapeState = SHAPE_STATE[state];
        const isActive = state === 'active';

        return (
          <motion.div
            key={lifeline.key}
            className="flex"
            animate={{ opacity: state === 'used' ? 0.38 : 1 }}
            transition={{ duration: 0.3 }}>
            <WwbamShape
              state={shapeState}
              pointExt={10}
              cornerR={10}
              strokeWidth={3}
              style={{ minHeight: '64px' }}>
              <div className="flex items-center gap-3 px-5 py-2">
                {/* Icon with amber pulse ring when active */}
                <div className="relative shrink-0 flex items-center justify-center w-9 h-9">
                  <span className="text-2xl leading-none select-none">
                    {lifeline.icon}
                  </span>
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ background: 'rgba(232, 146, 10, 0.2)' }}
                      animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  )}
                </div>

                {/* Label + status */}
                <div className="flex flex-col">
                  <span className="wwbam-lifeline-label">{lifeline.label}</span>
                  <span
                    className="wwbam-lifeline-status"
                    style={{ color: STATE_LABEL_COLORS[state] }}>
                    {STATE_LABELS[state]}
                  </span>
                </div>
              </div>
            </WwbamShape>
          </motion.div>
        );
      })}
    </div>
  );
}
