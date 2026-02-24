// src/components/layout/ScreenHeader.jsx

import { motion } from 'framer-motion';
import { APP_NAME } from '@constants/app';

/**
 * ScreenHeader
 *
 * Shared branding block used at the top of full-screen display views
 * (IdleScreen phases, ResultsScreen).
 *
 * Layout (vertical stack, centred):
 *   WWBAM logo — slow Y-axis spin with gold drop-shadow
 *   APP_NAME   — animated gold shimmer micro-label
 *   ✦ divider  — gold gradient rule with centrepiece gem
 *
 * The component renders only content — no wrapper motion element —
 * so that the parent can control its own stagger / animation context freely.
 *
 * @param {{
 *   logoSize?: string,  - Tailwind w/h classes for the logo (default: 'w-20 h-20')
 * }} props
 */
export default function ScreenHeader({ logoSize = 'w-20 h-20' }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <SpinningLogo size={logoSize} />
      <AppEyebrow />
      <GoldDivider />
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * SpinningLogo
 * WWBAM logo with a slow Y-axis rotation loop and gold drop-shadow.
 */
function SpinningLogo({ size }) {
  return (
    <div style={{ perspective: '800px' }}>
      <motion.img
        src="/images/wwbam-logo.svg"
        alt="WWBAM Logo"
        className={size}
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
          fontFamily: 'var(--font-body)',
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
