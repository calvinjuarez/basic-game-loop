export class SpriteError extends Error {}
export class SpriteCancelLoadError extends SpriteError {}
export class SpriteOptionError extends SpriteError {}
export class SpriteOutOfBoundsError extends SpriteError {}
export class SpriteTypeError extends TypeError {}
export class SpriteSrcTypeError extends SpriteTypeError {}


const asyncImage = () => {
	const img = new Image();
	img.decoding = 'async';

	return img;
};

/** @enum {string}
  * @memberof Sprite */
const ReadyState = {
	ERROR: 'error',
	LOADING: 'loading',
	PENDING: 'pending',
	READY: 'ready',
};


/**
 * @typedef {object} Sprite~size
 * @param {number|string} height
 * 	A number (or numeric-string) or a string in format '{NUMBER}px'
 * 	specifying the pixel length of the height of a single frame.
 * @param {number|string} width
 * 	A number (or numeric-string) or a string in format '{NUMBER}px'
 * 	specifying the pixel length of the width of a single frame.
 */
/**
 * @callback Sprite~throttle
 * @param {number} stepTime
 * @returns {number}  Modified step time to use for animation timing.
 */
/**
 * @typedef {object} Sprite~options
 * @see Constructor options for {@link Sprite}.
 * @param {number} fps
 * @param {?number|number[]} frames
 * @param {boolean} lazy
 * @param {?number|string|Sprite~size} size
 * @param {Sprite~throttle} throttle
 */

/**
 * @param {string} src  The path to the sprite image file.
 * @param {Sprite~options} [options]
 * @param {number} [options.fps=30]
 * 	Set to `false` or `0` to disable animation.  Passing `true` will fall back
 * 	to the default value.
 * @param {?number|number[]} [options.frames]
 * 	Either the number of frames, or an array of frame indexes listing
 * 	which frames should play in what order.
 * @param {boolean} [options.lazy=false]
 * 	Whether to load the image during construction or wait for an
 * 	explicit call to {@link #load}.
 * @param {?number|string|Sprite~size} [options.size]
 * 	A number (or numeric-string) or a string in format '{NUMBER}px'
 * 	specifying the pixel length of the height and width of a single
 * 	frame, or an object of 2 such values specifying the height and width
 * 	as properties.
 * @param {Sprite~throttle} [options.throttle=stepTime => stepTime]
 * 	A function taking a number input representing the step time, and
 * 	and returning a number representing by how much the frame timer
 * 	should be increased.
 * @param {boolean} [DEBUG=false]
 * 	Pass to debug an instance (equivalent to setting the DEBUG property) after
 * 	constructing.  You can also debug all instances by default by setting
 * 	{@link Sprite.DEBUG} to `true`.
 */
export default class Sprite {
	constructor(src, options, DEBUG=false) {
		if (typeof DEBUG === 'boolean') this.DEBUG = DEBUG;

		this.#setArchivalProps(src, options);

		this.#setOptions(options);
		this.#initAnimation();

		this.#setSrc(src);
	}


	/** @var {boolean} */
	static DEBUG = false;
	static ReadyState = ReadyState;
	/** @var {Sprite~options} */
	static get DEFAULTS() {
		return {
			fps: 30,
			frames: null,
			lazy: false,
			size: null,
			throttle: stepTime => stepTime,
		};
	}


	#frame = 0;
	#frameDuration = 0;
	#frameTime = 0;
	#hasAnimation = true;
	#imgFrames = null;
	#imgLayers = null;
	#loadPromise = null;
	#loadPromiseCancel = () => {};
	#readyState = ReadyState.PENDING;
	#src = '';


	#ensureLoadPromise() {
		if (! (this.#loadPromise instanceof Promise))
			this.#loadPromise = new Promise((resolve, reject) => {
				this.img.onload = resolve;
				this.img.onerror = reject;
				this.#loadPromiseCancel = data => reject(
					Object.assign(new SpriteCancelLoadError(
						`Sprite image loading cancelled.`,
					), { data }),
				);
			});

		this.#loadPromise
			.finally(() => {
				this.#loadPromiseCancel = () => {};
			})
			.then(() => {
				this.#imgFrames = Math.ceil(this.img.width / this.options.size.width);
				this.#imgLayers = Math.ceil(this.img.height / this.options.size.height);

				this.#readyState = ReadyState.READY;
			})
			.catch(error => {
				if (error instanceof SpriteCancelLoadError) {
					this.#readyState = ReadyState.PENDING;
					this.DEBUG && console.log(error.message);
				}
				else {
					this.#readyState = ReadyState.ERROR;
					this.loadError = error;
					this.DEBUG && console.error(
						`Sprite image load failed with error ${error.message}`,
					);
				}

				return error;
			});
	}
	#getPx(type, index) {
		if (this.readyState === ReadyState.ERROR)
			throw new SpriteError(
				`Image ${this.src} failed to load.`,
			);

		const Values = {
			frame: {
				count: this.#imgFrames,
				dimension: 'width',
				titleType: 'Frame',
			},
			layer: {
				count: this.#imgLayers,
				dimension: 'height',
				titleType: 'Layer',
			},
		};

		if (! Object.keys(Values).includes(type))
			throw new SpriteError(
				`Invalid 'type' ${JSON.stringify(type)}`,
			);

		const { count, dimension, titleType } = Values[type];
		const json = JSON.stringify(index);

		index = parseInt(index, 10);

		if (typeof index !== 'number' || ! Number.isFinite(index))
			throw new SpriteTypeError(
				`Invalid ${type} ${json}; ${type} must be a number`,
			);

		if (index < 0
		||  (count != null && index >= count))
			throw new SpriteOutOfBoundsError(
				`${titleType} at ${index} does not exist`,
			);

		return (index * this.options.size[dimension]);
	}
	#initAnimation() {
		this.#hasAnimation = (
			this.options.fps > 0
			&& this.options.frames?.length > 1
		);

		if (! this.#hasAnimation) return;

		this.#frameDuration = 1000 / this.options.fps;
	}
	#load() {
		this.#ensureLoadPromise();

		this.#readyState = ReadyState.LOADING;
		this.img.src = this.src;
	}
	#reset() {
		this.#loadPromise = null;
		this.#readyState = ReadyState.PENDING;
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

		options = this.#validateOptions(options);

		// Assign only the supported options
		Object.keys(this.constructor.DEFAULTS)
			.forEach(option => this.options[option] = options[option]);
	}
	#setSrc(src) {
		if (! src || src === this.#src) return;

		if (typeof src !== 'string')
			throw new SpriteSrcTypeError(
				`'src' must be a string (received ${JSON.stringify(src)})`,
			);

		if (this.readyState === ReadyState.LOADING)
			this.#loadPromiseCancel({ reason: 'src change' });

		this.#readyState = ReadyState.PENDING;
		this.#src = src;

		if (this.#src && ! this.options.lazy) this.#load();
	}
	#validateOptions(options) {
		const hasOption = prop => (
			Object.hasOwn(options, prop)
			&& options[prop] != null // options are optional
		);
		const validateNumeric = (name, value) => {
			if (typeof value === 'string')
				value = parseInt(value, 10);

			if (typeof value !== 'number'
			||  Number.isNaN(value))
				throw new SpriteOptionError(
					`'${name}' option must be a number (${JSON.stringify(value)})`,
				);
		}

		// boolean
		[ 'lazy' ].forEach(option => {
			if (! hasOption(option)) return;

			options[option] = Boolean(options[option]);
		});

		// numeric
		[ 'fps' ].forEach(option => {
			if (! hasOption(option)) return;

			let value = options[option];

			validateNumeric(option, value);
		});

		if (hasOption('frames')) {
			let { frames } = options;

			if (Array.isArray(frames))
				frames.forEach((frame, i) => {
					if (typeof frame !== 'number')
						throw new SpriteOptionError(
							`Invalid 'frames' (index '${i}' in ${JSON.stringify(options.frames)})`,
						);
				});
			else if (typeof frames === 'number') {
				options.frames = [];

				for (let i = 0; i < frames; i++) options.frames.push(i);
			}
		}

		if (this.options.fps > 0
		&&  this.options.frames > 1
		&&  options.size == null)
			throw new SpriteOptionError(
				`Animation requires passing 'size' option`,
			);

		if (hasOption('size')) {
			let { size } = options;
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


	/** @var {boolean} */
	DEBUG = this.constructor.DEBUG;
	/** @var {Image} */
	img = asyncImage();
	/** @var {?Error} */
	loadError = null;
	/** @var {object} */
	options = Object.assign({}, this.constructor.DEFAULTS);

	/** The pixel location of the current frame in the img.
	  * @readonly
	  * @var {number} */
	get framePx() {
		return this.#hasAnimation
			? this.options.frames[this.#frame] * this.options.size.width
			: 0;
	}
	/** @readonly
	  * @var {string} */
	get readyState() { return this.#readyState; }
	/** @readonly
	  * @var {object} */
	get size() { return this.options.size; }
	/** @readonly
	  * @var {?string} */
	get src() { return this.#src; }


	/**
	 * Cancel the image loading.  If no loading is in progress, this silently
	 * does nothing.
	 * @param {object} data
	 */
	cancelLoad(data) {
		this.#loadPromiseCancel(data);

		this.DEBUG && console.log(
			this.readyState === ReadyState.LOADING
				? 'Image loading cancelled'
				: `Image was not loading (readyState was '${this.readyState}'`,
		);
	}
	/**
	 * @param {number} [frame]  An animation frame index.  If no 'frames' option
	 *   was passed to the constructor, this is the same as the image frame index.
	 * @returns {number}  The pixel location of the requested frame in the image.
	 */
	getFramePx(frame) {
		frame = this.options.frames[frame ?? this.#frame];

		return this.#getPx('frame', frame);
	}
	/**
	 * @param {number} [frame]  An image frame index.  If no 'frames' option was
	 *   passed to the constructor, this is the same as the animation frame index.
	 * @returns {number}  The pixel location of the requested frame in the image.
	 */
	getImageFramePx(frame) {
		frame = frame ?? this.#frame;

		return this.#getPx('frame', frame);
	}
	/**
	 * @param {number} layer  An image layer index.
	 * @returns {number}  The pixel location of the requested layer in the image.
	 */
	getLayerPx(layer) {
		const layerJSON = JSON.stringify(layer);

		return this.#getPx('layer', layer);
	}
	/**
	 * @returns {Promise}
	 */
	load() {
		if (this.readyState !== ReadyState.PENDING) return;

		this.#load();
	}
	/**
	 * @returns {Promise}
	 */
	ready() {
		this.#ensureLoadPromise();

		return this.#loadPromise;
	}
	/**
	 * @param {Sprite~options} options
	 * @returns {this}
	 * @throws {SpriteOptionError} If any options are invalid.
	 */
	setOptions(options) {
		if (! options) return;

		this.#setOptions(options);
		this.#initAnimation();

		return this;
	}
	/**
	 * @param {string} src
	 * @returns {this}
	 * @throws {SpriteSrcTypeError} If 'src' is not a string.
	 */
	setSrc(src) {
		this.#setSrc(src);

		return this;
	}
	/**
	 * @param {number} frame  The frame index to render.
	 * @param {object} [options]
	 * @param {boolean} [options.end=false]
	 *   If true, will skip to the end of the given frame instead of the start.
	 */
	skipToFrame(frame, options) {
		frame = parseInt(frame, 10);

		if (Number.isNaN(frame))
			throw new SpriteError(
				`Invalid frame ${JSON.stringify(frame)}`,
			);
		if (frame < 0 || frame > this.options.frames.length)
			throw new SpriteOutOfBoundsError(
				`Frame ${JSON.stringify(frame)} does not exist`,
			);

		options = Object.assign({
			// defaults
			end: false,
		}, options);

		// set animation to the start of the given frame
		this.#frame = frame;
		this.#frameTime = options.end ? this.#frameDuration - 1 : 0;
	}
	/**
	 * Method to update the animation frame based on the time elapsed since the
	 * previous update.
	 * @param {number} stepTime
	 */
	update(stepTime) {
		const { frames, throttle } = this.options;

		if (! this.#hasAnimation) return;

		this.#frameTime += throttle(stepTime);

		// When we've accumulated enough time in the current animation frame, we
		// move to the next frame and start the count over again.
		if (this.#frameTime >= this.#frameDuration) {
			this.#frameTime %= this.#frameDuration;
			this.#frame = (this.#frame + 1) % frames.length;
		}

		if (this.DEBUG
		&&  this.#frame > this.options.frames.length)
			console.warn(new SpriteOutOfBoundsError(
				`Frame ${JSON.stringify(this.#frame)} does not exist`,
			).message);
	}
}
