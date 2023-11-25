/**
 * @param {number} value
 * @param {number} lower
 * @param {number} upper
 * @returns {number} The value, or the lower or upper if the value is out-of-bounds.
 */
export function clamp(value, lower, upper) {
	return Math.max(Math.min(value, upper), lower);
}
