// src/components/topbar/LifelineIndicator.jsx

import { motion } from 'framer-motion';
import { Phone, PhoneOff, Zap, ZapOff } from 'lucide-react';
import WwbamShape from '@components/ui/WwbamShape';

// ── Constants ──────────────────────────────────────────────────────────────────

const LIFELINES = [
  {
    key: 'phoneAFriend',
    activeKey: 'phone-a-friend',
    label: 'Phone a Friend',
    Icon: Phone,
    IconOff: PhoneOff,
  },
  {
    key: 'fiftyFifty',
    activeKey: 'fifty-fifty',
    label: '50 / 50',
    Icon: Zap,
    IconOff: ZapOff,
  },
];

/** WwbamShape state per lifeline state. */
const SHAPE_STATE = {
  active: 'selected', // amber shimmer
  available: 'default', // blue shimmer
  used: 'used', // slate shimmer — visible but clearly spent
};

/** Status label text per lifeline state. */
const STATUS_LABELS = {
  active: 'In Use',
  available: 'Available',
  used: 'Used',
};

/** Icon colour per lifeline state — token-driven. */
const ICON_COLOR = {
  active: 'var(--c-gold)',
  available: 'var(--c-text-dim)',
  used: 'var(--c-used-text)',
};

/** Status sub-label colour per lifeline state — token-driven. */
const STATUS_LABEL_COLOR = {
  active: 'var(--c-gold)',
  available: 'var(--c-green-light)',
  used: 'var(--c-used-subtext)',
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
 * Renders TWO sibling elements — one per lifeline — using `display: contents`
 * on the wrapper so the PARENT grid in GameScreen directly controls each card's
 * column placement and width (cols 2 & 3 of the 2fr 1fr 1fr grid).
 *
 * Visual states:
 *   active    — amber/gold WwbamShape stroke, pulse ring on icon, "In Use" label
 *               Icon: Phone / Zap
 *   available — blue WwbamShape stroke, full-brightness text
 *               Icon: Phone / Zap
 *   used      — slate WwbamShape stroke, muted text
 *               Icon: PhoneOff / ZapOff (communicates spent state without extra decoration)
 *
 * All colours are token-driven via CSS custom properties. No hardcoded values.
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
    // display: contents — wrapper disappears from layout,
    // children become direct children of the parent grid
    <div style={{ display: 'contents' }}>
      {LIFELINES.map((lifeline) => {
        const state = deriveState(lifeline, lifelinesAvailable, activeLifeline);
        const shapeState = SHAPE_STATE[state];
        const isActive = state === 'active';
        const isUsed = state === 'used';

        // Swap to the "off" variant when the lifeline has been spent
        const Icon = isUsed ? lifeline.IconOff : lifeline.Icon;

        return (
          <motion.div
            key={lifeline.key}
            className="flex"
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}>
            <WwbamShape
              size="compact"
              state={shapeState}
              strokeWidth={3}
              className="flex-1"
              style={{ minHeight: '64px' }}>
              <div className="flex items-center justify-center gap-3 px-4 py-2 w-full">
                {/* ── Icon ────────────────────────────────────────────── */}
                <div className="relative shrink-0 flex items-center justify-center w-9 h-9">
                  <Icon
                    size={22}
                    strokeWidth={2}
                    style={{ color: ICON_COLOR[state] }}
                  />

                  {/* Pulse ring — active state only */}
                  {isActive && (
                    <motion.span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ background: 'rgba(232,146,10,0.2)' }}
                      animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                      transition={{
                        duration: 1.2,
                        repeat: Infinity,
                        ease: 'easeOut',
                      }}
                    />
                  )}
                </div>

                {/* ── Label + status ───────────────────────────────────── */}
                <div className="flex flex-col">
                  <span
                    className={`wwbam-lifeline-label ${isUsed ? 'wwbam-used-text' : ''}`}>
                    {lifeline.label}
                  </span>
                  <span
                    className={`wwbam-lifeline-status ${isUsed ? 'wwbam-used-subtext' : ''}`}
                    style={{ color: STATUS_LABEL_COLOR[state] }}>
                    {STATUS_LABELS[state]}
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
