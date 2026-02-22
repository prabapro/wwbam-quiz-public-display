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

/** CSS colour class for the status sub-label (token-driven, not hardcoded). */
const STATUS_LABEL_COLOR = {
  active: 'var(--c-gold)',
  available: 'var(--c-text-dim)',
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
 *   available — blue WwbamShape stroke, full-brightness text
 *   used      — slate WwbamShape stroke (visible but clearly spent), muted text,
 *               small ✕ overlay on icon — no opacity hack on the wrapper
 *
 * Text colours are fully token-driven via CSS custom properties and .wwbam-used-*
 * classes defined in components.css. No hardcoded colour values in this file.
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

        return (
          <motion.div
            key={lifeline.key}
            className="flex"
            // Transition in/out smoothly when state changes — no opacity hack
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
                  {/* Emoji — muted slightly when used via CSS filter */}
                  <span
                    className="text-2xl leading-none select-none"
                    style={{
                      filter: isUsed ? 'grayscale(0.7) opacity(0.45)' : 'none',
                    }}>
                    {lifeline.icon}
                  </span>

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

                  {/* ✕ badge — used state only */}
                  {isUsed && (
                    <span
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black leading-none select-none"
                      style={{
                        background: 'var(--c-used-stroke-mid)',
                        color: 'var(--c-used-text)',
                        border: '1px solid var(--c-used-stroke-light)',
                      }}>
                      ✕
                    </span>
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
