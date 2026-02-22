// src/components/pregame/TeamRosterCard.jsx

import { motion } from 'framer-motion';
import WwbamShape from '@components/ui/WwbamShape';

// ── Animation variant ──────────────────────────────────────────────────────────
// Internal — keys match parent staggerChildren container (hidden / visible).

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * TeamRosterCard
 *
 * Displays a single team's name and participant list.
 * Used in both the lobby phase (no assignment) and the ready phase
 * (with question set assignment badge on the right).
 *
 * Uses WwbamShape (compact, default) as the card surface — consistent with
 * LifelineIndicator and the rest of the WWBAM design system.
 *
 * Layout:
 *   [ Team # ] | separator | [ Team Name / Participants ] | [ Set ID? ]
 *
 * Typography is driven entirely by .wwbam-* classes from components.css
 * and token values from tokens.css — no inline colour strings.
 *
 * @param {{
 *   team: {
 *     id:           string,
 *     name:         string,
 *     participants: string,  // comma-separated names from Firebase
 *   },
 *   index:       number,        // 0-based position used for the team number label
 *   assignment?: string | null, // question set ID shown after initialization
 * }} props
 */
export default function TeamRosterCard({ team, index, assignment = null }) {
  return (
    <motion.div variants={cardVariant} className="flex">
      <WwbamShape
        size="compact"
        state="default"
        strokeWidth={3}
        className="flex-1"
        style={{ minHeight: '72px' }}>
        <div className="flex items-center w-full py-2">
          {/* ── Team number ───────────────────────────────────────────────── */}
          <div className="flex flex-col items-center justify-center shrink-0 px-4">
            <span className="wwbam-label">Team</span>
            <span
              className="leading-none"
              style={{
                fontFamily: 'var(--font-numeric)',
                fontSize: '1.6rem',
                color: 'var(--c-gold)',
              }}>
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <div className="wwbam-sep" />

          {/* ── Team name + participants ───────────────────────────────────── */}
          <div className="flex flex-col justify-center min-w-0 flex-1 px-4">
            <span className="wwbam-team-name truncate">{team.name}</span>
            {team.participants ? (
              <span className="wwbam-participants truncate">
                {team.participants}
              </span>
            ) : (
              <span
                className="wwbam-participants"
                style={{ color: 'var(--c-text-muted)' }}>
                No participants listed
              </span>
            )}
          </div>

          {/* ── Question set assignment (ready phase only) ─────────────────── */}
          {assignment && (
            <>
              <div className="wwbam-sep" />
              <div className="flex flex-col items-center justify-center shrink-0 px-4">
                <span className="wwbam-label">Set</span>
                <span
                  className="leading-none font-bold"
                  style={{
                    fontFamily: 'var(--font-condensed)',
                    fontSize: '1rem',
                    color: 'var(--c-blue-light)',
                    letterSpacing: '0.06em',
                  }}>
                  {assignment}
                </span>
              </div>
            </>
          )}
        </div>
      </WwbamShape>
    </motion.div>
  );
}
