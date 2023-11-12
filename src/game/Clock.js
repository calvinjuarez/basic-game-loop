/** @extends TypeError */
export class ClockArgumentTypeError extends TypeError {}
/** @extends TypeError */
export class ClockOptionTypeError extends TypeError {}
/** @extends Error */
export class ClockRequestAnimationFrameUnavailableError extends Error {}

/**
 * @param {function():void} onTick
 *   Logic to run when a tick happens.
 * @param {object} [options]
 * @param {function():void} [options.onStart=()=>{}]
 *   A method run just before the first call to `requestAnimationFrame`.
 * @param {function():void} [options.onStarted=()=>{}]
 *   A method run just after the first call to `requestAnimationFrame`.
 * @param {function(function()):void}
 *   [options.requestAnimationFrame=window.requestAnimationFrame]
 *   Pass a custom `requestAnimationFrame` implementation if `window` is not
 *   available to the Clock instance.
 */
export default class Clock {
	static get DEFAULTS() {
		return {
			onStart: () => {},
			onStarted: () => {},
			requestAnimationFrame: (typeof window?.requestAnimationFrame === 'function')
				? loop => window.requestAnimationFrame(loop)
				: (() => {
					throw new ClockRequestAnimationFrameUnavailableError(`Unable to
						access 'window.requestAnimationFrame'`);
				})
			,
		};
	}

	constructor(onTick, options) {
		if (typeof onTick !== 'function') {
			throw new ClockArgumentTypeError(`'onTick' must be a function`);
		}

		this.onTick = onTick;

		this.options = Object.assign({}, this.constructor.DEFAULTS, options);

		console.log(this.options);

		[ 'onStart', 'onStarted', 'requestAnimationFrame' ].forEach(method => {
			if (typeof this.options[method] !== 'function') {
				throw new ClockOptionTypeError(`'options.${method}' must be a
					function`);
			}
		});

		this.requestAnimationFrame = this.options.requestAnimationFrame;
		this.onStart = this.options.onStart;
		this.onStarted = this.options.onStarted;
	}

	/** Time (since start) of the latest tick.
	  * @var {number} */
	#latestTickTime = 0;

	/**
	 * @param {number} time  Time (since start) of the next tick.
	 */
	#step(time) {
		const stepLength = (time - this.#latestTickTime);

		this.onTick(stepLength);

		this.#latestTickTime = time;

		this.requestAnimationFrame(time => this.#step(time));
	}

	/**
	 * Start the clock.
	 */
	start() {
		this.onStart();

		this.requestAnimationFrame(time => this.#step(time));

		this.onStarted();
	}
}


/**
 * @bibliography
 * @see https://www.sitepoint.com/quick-tip-game-loop-in-javascript/
 */
