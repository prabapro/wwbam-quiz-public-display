// src/utils/participants.js

/**
 * Splits a comma-separated participants string into an array of trimmed names.
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
