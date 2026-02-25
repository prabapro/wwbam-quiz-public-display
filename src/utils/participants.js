// src/utils/participants.js

/**
 * Splits a comma-separated participants string into an array of trimmed full names.
 *
 * Handles inconsistent spacing around commas gracefully:
 *   "Robert Brown, Jessica Martinez"  → ['Robert Brown', 'Jessica Martinez']
 *   "John,Jane, Charles"              → ['John', 'Jane', 'Charles']
 *   "Solo Player"                     → ['Solo Player']
 *   ""  / null / undefined            → []
 *
 * @param {string|null|undefined} participants
 * @returns {string[]}
 */
export const splitParticipants = (participants) => {
  if (!participants || typeof participants !== 'string') return [];

  return participants
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
};

/**
 * Extracts the first name from a full name string.
 *
 *   "Robert Brown"  → "Robert"
 *   "Jessica"       → "Jessica"
 *   ""              → ""
 *
 * @param {string} fullName
 * @returns {string}
 */
export const getFirstName = (fullName) => {
  if (!fullName || typeof fullName !== 'string') return '';
  return fullName.trim().split(/\s+/)[0] ?? '';
};

/**
 * Converts a comma-separated full-names string into a formatted first-names-only string.
 *
 * Intended for all display contexts EXCEPT TeamAnnouncement, which shows full names.
 *
 *   "Robert Brown, Jessica Martinez"  → "Robert, Jessica"
 *   "John,Jane, Charles"              → "John, Jane, Charles"
 *   "Solo Player"                     → "Solo"
 *   ""  / null / undefined            → ""
 *
 * @param {string|null|undefined} participants
 * @returns {string}
 */
export const formatParticipantFirstNames = (participants) => {
  const names = splitParticipants(participants);
  if (!names.length) return '';
  return names.map(getFirstName).join(', ');
};
