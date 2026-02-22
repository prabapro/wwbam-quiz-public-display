// src/components/topbar/LifelineIndicator.jsx

import { motion } from 'framer-motion';

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

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Derives the visual state for a single lifeline.
 * @returns {'active'|'available'|'used'}
 */
function deriveState(lifeline, lifelinesAvailable, activeLifeline) {
  if (activeLifeline === lifeline.activeKey) return 'active';
  if (lifelinesAvailable?.[lifeline.key] === true) return 'available';
  return 'used';
}

/** Human-readable label for each state. */
const STATE_LABELS = {
  active: 'In Use',
  available: 'Available',
  used: 'Used',
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * LifelineIndicator
 *
 * Two WWBAM-style chamfered hexagon cards displayed in the GameScreen top bar,
 * one per lifeline. Each card shows the lifeline's icon, name, and live status.
 *
 * State → visual treatment:
 *   available — blue border, dark navy fill (default)
 *   active    — amber border, dark amber fill, pulsing ring on icon
 *   used      — very dim border, full opacity reduced to 35%
 *
 * State is driven by CSS modifier classes on .wwbam-hex-border that override
 * the --hex-border-color and --hex-fill tokens (see src/styles/components.css).
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
        const isActive = state === 'active';

        return (
          <motion.div
            key={lifeline.key}
            className={`wwbam-hex-border wwbam-lifeline-${state}`}
            style={{ '--hex-cut': '14px' }}
            animate={{ opacity: state === 'used' ? 0.35 : 1 }}
            transition={{ duration: 0.3 }}>
            <div className="wwbam-hex-fill flex items-center gap-4 px-6 py-2">
              {/* Icon with pulse ring when active */}
              <div className="relative shrink-0 flex items-center justify-center w-9 h-9">
                <span className="text-2xl leading-none">{lifeline.icon}</span>
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ background: 'rgba(232, 146, 10, 0.3)' }}
                    animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                    transition={{
                      duration: 1.1,
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
                  style={{
                    color: isActive
                      ? 'var(--c-gold)'
                      : state === 'used'
                        ? 'var(--c-text-muted)'
                        : 'var(--c-text-dim)',
                  }}>
                  {STATE_LABELS[state]}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
