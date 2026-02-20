// src/utils/transforms.js

/**
 * Recursively converts all object keys from kebab-case to camelCase.
 * Firebase stores keys as kebab-case — JS uses camelCase.
 *
 * Used by all Firebase listener hooks (useGameState, useTeams,
 * usePrizeStructure, useDisplayConfig) to normalise incoming data.
 *
 * @param {unknown} data
 * @returns {unknown}
 *
 * @example
 * kebabToCamel({ 'game-status': 'active', 'current-team-id': 'team-1' })
 * // → { gameStatus: 'active', currentTeamId: 'team-1' }
 *
 * @example — nested objects are handled recursively
 * kebabToCamel({ 'display-settings': { 'show-prize-ladder': true } })
 * // → { displaySettings: { showPrizeLadder: true } }
 */
export const kebabToCamel = (data) => {
	if (Array.isArray(data)) return data.map(kebabToCamel);

	if (data !== null && typeof data === 'object') {
		return Object.fromEntries(
			Object.entries(data).map(([key, value]) => [
				key.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()),
				kebabToCamel(value),
			]),
		);
	}

	return data;
};
