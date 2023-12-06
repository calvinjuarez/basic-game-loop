export class SpriteError extends Error {};
export class SpriteOptionError extends SpriteError {};

const asyncImage = () => { const img = new Image(); img.decoding = 'async'; return img; };

/**
 * @param {string} src  The path to the sprite image file.
 * @param {object} [options]
 * @param {boolean} [options.lazy=false]  Whether to load the image during
 *   construction or wait for an explicit call to {@link #load}.
 */
export default class Sprite {
	constructor(src, options) {
		this.#setArchivalProps(src, options);
		this.#setOptions(options);

		this.src = src;

		if (! this.options.lazy) this.#load();
	}


	static get DEFAULTS() {
		return {
			fps: 0,
			frames: null,
			lazy: false,
			size: null,
			throttle: stepTime => stepTime,
		};
	}


	#hasAnimation = false;
	#loadPromise = null;
	#readyState = 'pending';


	#ensureLoadPromise() {
		if (! (this.#loadPromise instanceof Promise))
			this.#loadPromise = new Promise((resolve, reject) => {
				this.img.onload = resolve;
				this.img.onerror = reject;
			});

		this.#loadPromise.then(() => { this.#readyState = 'loaded'; });
	}
	#load() {
		this.#readyState = 'loading';
		this.#ensureLoadPromise();

		this.img.src = this.src;
	}
	#reset() {
		this.#loadPromise = null;
		this.#readyState = 'pending';
	}
	#setArchivalProps(src, options) {
		if (src)
			/** Archival copy of src as passed.
			  * @readonly
			  * @var {*} GameObject#_i */
			Object.defineProperty(this, '_s', { value: src });

		if (options)
			/** Archival copy of options as passed.
			  * @readonly
			  * @var {*} GameObject#_o */
			Object.defineProperty(this, '_o', { value: options });
	}
	#setOptions(options) {
		if (! options) return;

		try {
			options = this.#validateOptions(options);
		}
		catch (err) {
			return console.warn(`${err.name}: ${err.message}`);
		}

		Object.assign(this.options, options);

		this.#hasAnimation = (this.options.fps < 1 && this.options.frames < 2);
	}
	#validateOptions(options) {
		const hasOption = prop => (
			Object.hasOwn(options, prop)
			&& options[prop] != null // options are optional
		);

		// boolean
		[ 'lazy' ].forEach(option => {
			if (! hasOption(option)) return;

			options[option] = Boolean(options[option]);
		});

		// numeric
		[ 'fps', 'frames' ].forEach(option => {
			if (! hasOption(option)) return;

			let value = options[option];

			if (typeof value === 'string')
				value = parseInt(value, 10);

			if (typeof value !== 'number'
			||  Number.isNaN(value))
				throw new SpriteOptionError(
					`'${option}' must be a number (${JSON.stringify(value)})`,
				);
		});

		if (this.options.fps > 0
		&&  this.options.frames > 1
		&&  options.size == null)
			throw new SpriteOptionError(
				`Animation requires passing 'size' option`,
			);

		if (hasOption('size')) {
			let size = options.size;
			let height, width;

			const error = () => new SpriteOptionError(
				`Invalid 'size' option (${JSON.stringify(options.size)})`,
			);

			if (size == null)
				throw error();

			const pxToNumber = value => Number(value.replace(/px$/, ''));

			switch (typeof size) {
				case 'string':
					size = pxToNumber(size);
				// fall through
				case 'number':
					if (Number.isNaN(size)) throw error();

					height = width = size;
				break;
				case 'object':
					[ 'height', 'width' ].forEach(prop => {
						let value = size[prop];

						if (typeof value === 'string')
							value = pxToNumber(value);

						if (typeof value !== 'number'
						||  Number.isNaN(value))
							throw error();

						size[prop] = value;
					});

					({ height, width} = size);
				break;
				default:
					throw error();
			}

			options.size = { height, width };
		}

		if (hasOption('throttle')) {
			if (typeof options.throttle !== 'function')
				throw new SpriteOptionError(
					`'throttle' must be a function (${JSON.stringify(options.throttle)}`,
				);

			let test;
			try { test = options.throttle(10); }
			catch (err) {
				throw new SpriteOptionError(
					`'throttle' errors with message ${JSON.stringify(err.message)}`,
				);
			}

			if (typeof test !== 'number')
				throw new SpriteOptionError(
					`'throttle' must return a number (${JSON.stringify(test)}`,
				);
		}

		return options;
	}


	/** @var {Image} */
	img = asyncImage();
	/** @var {object} */
	options = Object.assign({}, this.constructor.DEFAULTS);

	/** @var {string} */
	get readyState() { return this.#readyState; }



	/**
	 * @returns {Promise}
	 */
	ready() {
		this.#ensureLoadPromise();

		return this.#loadPromise;
	}
	/**
	 * @param {object} options
	 * @returns {this}
	 */
	setOptions(options) {
		if (! options) return;

		this.#setOptions(options);

		return this;
	}
	/**
	 * Method to update the animation
	 */
	update(stepTime) {
		const { fps, frames, size } = this.options;

		if (! this.#hasAnimation) return;

		const throttledTime = this.options.throttle(stepTime);
	}
}
