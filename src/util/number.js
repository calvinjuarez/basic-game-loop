/**
 * @param {number} value
 * @param {number} lower
 * @param {number} upper
 * @returns {number} The value, or the lower or upper if the value is out-of-bounds.
 */
export function clamp(value, lower, upper) {
	return Math.max(Math.min(value, upper), lower);
}

/**
 * @param {number} dividend
 * @param {number} divisor
 * @returns {number} A proper modulo of number by divisor (rather than a remainder).
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder#description
 */
export function modulo(dividend, divisor) {
	return ((dividend % divisor) + divisor) % divisor;
}
