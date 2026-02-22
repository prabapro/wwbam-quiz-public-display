// src/components/pregame/TeamRosterCard.jsx

import { motion } from 'framer-motion';

// ── Animation variant ──────────────────────────────────────────────────────────
// Internal only — consumed by the motion.div below.
// Parent stagger works via matching key names (hidden / visible).

const teamCardVariant = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

// ── Component ──────────────────────────────────────────────────────────────────

/**
 * TeamRosterCard
 *
 * Displays a single team's name and participant list in the pre-game lobby.
 * Designed to be used inside a staggered motion container so each card
 * animates in sequentially — variant keys (hidden / visible) match the
 * parent's staggerChildren container automatically.
 *
 * @param {{
 *   team: {
 *     id:           string,
 *     name:         string,
 *     participants: string,   // comma-separated names from Firebase
 *   },
 *   index: number,            // 0-based position used for the team number label
 * }} props
 */
export default function TeamRosterCard({ team, index }) {
  const participantList = team.participants
    ? team.participants
        .split(',')
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  return (
    <motion.div
      variants={teamCardVariant}
      className="relative flex flex-col gap-2 px-5 py-4 rounded-sm overflow-hidden"
      style={{
        background:
          'linear-gradient(135deg, rgba(26,79,207,0.12) 0%, rgba(6,9,15,0.85) 60%)',
        border: '1px solid rgba(74,143,232,0.25)',
        boxShadow: '0 0 20px rgba(26,79,207,0.08)',
      }}>
      {/* Top accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgba(74,143,232,0.5), transparent)',
        }}
      />

      {/* Team number + name row */}
      <div className="flex items-center gap-3">
        <span
          className="text-xs font-bold tabular-nums shrink-0"
          style={{
            color: 'var(--c-gold)',
            fontFamily: 'var(--font-numeric)',
            fontSize: '0.8rem',
            minWidth: '1.4rem',
          }}>
          {String(index + 1).padStart(2, '0')}
        </span>
        <p
          className="text-white font-bold leading-tight truncate"
          style={{
            fontFamily: 'var(--font-condensed)',
            fontSize: '1.05rem',
            letterSpacing: '0.04em',
          }}>
          {team.name}
        </p>
      </div>

      {/* Divider */}
      <div className="h-px" style={{ background: 'rgba(255,255,255,0.07)' }} />

      {/* Participants */}
      <div className="flex flex-col gap-1">
        {participantList.length > 0 ? (
          participantList.map((name, i) => (
            <div key={i} className="flex items-center gap-2">
              <span
                className="w-1 h-1 rounded-full shrink-0"
                style={{ background: 'var(--c-blue-mid)' }}
              />
              <span
                className="text-sm leading-tight truncate"
                style={{
                  color: 'rgba(255,255,255,0.7)',
                  fontFamily: 'var(--font-body)',
                }}>
                {name}
              </span>
            </div>
          ))
        ) : (
          <span
            className="text-sm italic"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            No participants listed
          </span>
        )}
      </div>
    </motion.div>
  );
}
