/** @extends TypeError */
export class ClockArgumentTypeError extends TypeError {}
/** @extends TypeError */
export class ClockOptionTypeError extends TypeError {}
/** @extends Error */
export class ClockRequestAnimationFrameUnavailableError extends Error {}

/** @callback Clock~onTick
  * @param {number} stepTime  The time elapsed during this tick, in ms */
/** @callback Clock~onFPSChange
  * @param {number} fps */
/** @callback Clock~onStart */
/** @callback Clock~onStarted */
/** @callback Clock~step
  * @param {number} time  The time elapsed since starting the clock. */
/** @callback Clock~requestAnimationFrame
  * @param {Clock~step} step */

/**
 * @param {Clock~onTick} onTick
 * 	Logic to run when a tick happens.
 * @param {object} [options]
 * @param {boolean} [options.doMeasureFPS=false]
 * 	Pass `true` to enable internal FPS measurement.
 * @param {Clock~onFPSChange} [options.onFPSChange]
 * 	Runs whenever the FPS value changes.  The FPS value will only change if
 * 	the clock has FPS measuring enabled.  See {@link #toggleFPS}.
 * @param {Clock~onStart} [options.onStart=()=>{}]
 * 	A method run just before the first call to `requestAnimationFrame`.
 * @param {Clock~onStarted} [options.onStarted=()=>{}]
 * 	A method run just after the first call to `requestAnimationFrame`.
 * @param {Clock~requestAnimationFrame}
 * 	[options.requestAnimationFrame=window.requestAnimationFrame]
 * 	Pass a custom `requestAnimationFrame` implementation if `window` is not
 * 	available to the Clock instance.
 */
export default class Clock {
	constructor(onTick, options) {
		if (typeof onTick !== 'function') {
			throw new ClockArgumentTypeError(`'onTick' must be a function`);
		}

		this.onTick = onTick;

		this.options = Object.assign({}, this.constructor.DEFAULTS, options);

		[	'onFPSChange',
			'onStart',
			'onStarted',
			'requestAnimationFrame'
		].forEach(method => {
			if (typeof this.options[method] !== 'function') {
				throw new ClockOptionTypeError(`'options.${method}' must be a
					function`);
			}

			this[method] = this.options[method];
		});

		this.#doMeasureFPS = Boolean(this.options.doMeasureFPS);
	}


	static get DEFAULTS() {
		return {
			doMeasureFPS: false,
			onFPSChange: fps => {},
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


	/** Whether to run the FPS measurement code.
	  * @var {boolean} */
	#doMeasureFPS = false;
	/** Time (since start) of the latest tick.
	  * @var {number} */
	#latestTickTime = 0;
	/** The ID of the FPS sampling interval.
	  * @var {?number} */
	#sampleFPSInterval = null;
	/** Used to collect frame numbers over the sampling interval.
	  * @var {number} */
	#framesThisSecond = 0;
	/** Latest measured FPS, or null if FPS measurement is off.
	  * @var {?number} */
	_FPS = null;


	#onFPSChange() {
		(typeof this.onFPSChange === 'function') && this.onFPSChange(...arguments);
	}
	#onStart() {
		(this.#doMeasureFPS) && this.#startMeasuringFPS();
		(typeof this.onStart === 'function') && this.onStart(...arguments);
	}
	#onStarted() {
		(typeof this.onStarted === 'function') && this.onStarted(...arguments);
	}
	#onTick() {
		(this.#doMeasureFPS) && (++this.#framesThisSecond);
		(typeof this.onTick === 'function') && this.onTick(...arguments);
	}

	#setFPS(fps) {
		const didChange = fps !== this._FPS;

		(didChange) && this.#onFPSChange(this._FPS = fps);
	}

	#startMeasuringFPS() {
		this.#setFPS(0);

		this.#framesThisSecond = 0;
		this.#sampleFPSInterval = setInterval(() => {
			this.#setFPS(this.#framesThisSecond);
			this.#framesThisSecond = 0;
		}, 1000);
	}

	#stopMeasuringFPS() {
		clearInterval(this.#sampleFPSInterval);

		this.#framesThisSecond = 0;

		this.#setFPS(null);
	}

	/**
	 * @param {!number} time  Time (since start) of the next tick.
	 */
	#step(time) {
		const stepTime = (time - this.#latestTickTime);

		this.#onTick(stepTime);

		this.#latestTickTime = time;

		this.requestAnimationFrame(_time => this.#step(_time));
	}


	/**
	 * Start the clock.
	 */
	start() {
		this.#onStart();

		this.requestAnimationFrame(_time => this.#step(_time));

		this.#onStarted();
	}

	/**
	 * Enable or disable the internal measure of frame rate.  You can have it
	 * begin enabled by passing `doMeasureFPS` to the constructor.
	 *
	 * @param {?boolean} [enable]  If a boolean is passed, forced to that state.
	 */
	toggleFPS(enable) {
		const state = (typeof enable === 'boolean')
			? enable
			: ! this.#doMeasureFPS;

		if (state === true && ! this.#doMeasureFPS) {
			this.#startMeasuringFPS();
		}
		else if (state === false && this.#doMeasureFPS) {
			this.#stopMeasuringFPS();
		}

		this.#doMeasureFPS = state;

		return this.#doMeasureFPS;
	}
}


/**
 * @bibliography
 * @see https://www.sitepoint.com/quick-tip-game-loop-in-javascript/
 */
