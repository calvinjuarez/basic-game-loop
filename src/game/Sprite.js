export class SpriteError extends Error {};

const asyncImage = () => { const img = new Image(); img.decoding = 'async'; return img; };

/**
 * @param {string} src  The path to the sprite image file.
 * @param {object} [options]
 * @param {boolean} [options.lazy=false]  Whether to load the image during
 *   construction or wait for an explicit call to {@link #load}.
 */
export default class Sprite {
	constructor(src, options) {
		if (options)
			/** Archival copy of options as passed.
			  * @readonly
			  * @var {*} GameObject#_o */
			Object.defineProperty(this, '_o', { value: options });

		this.setOptions(options);

		this.src = src;

		if (! this.options.lazy) this.#load();
	}


	static get DEFAULTS() {
		return {
			lazy: false,
		};
	}


	#loadPromise = null;
	#loadState = 'pending';


	#ensureLoadPromise() {
		if (! (this.#loadPromise instanceof Promise))
			this.#loadPromise = new Promise((resolve, reject) => {
				this.img.onload = resolve;
				this.img.onerror = reject;
			});

		this.#loadPromise.then(() => { this.#loadState = 'loaded'; });
	}
	#load() {
		this.#loadState = 'loading';
		this.#ensureLoadPromise();

		this.img.src = this.src;
	}
	#reset() {
		this.#loadPromise = null;
		this.#loadState = 'pending';
	}


	/** @var {Image} */
	img = asyncImage();
	/** @var {object} */
	options = Object.assign({}, this.constructor.DEFAULTS);

	/** @var {string} */
	get loadState() { return this.#loadState; }


	/**
	 * @param {string} [src]  A source to load and set as `this.src`.
	 * @returns {Promise}  The Image instance's decode() promise.
	 */
	load(src) {
		if (src && typeof src === 'string') {
			if (src !== this.src)
				this.#reset();
			this.src = src;
		}

		return this.ready;
	}
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

		Object.assign(this.options, options);

		return this;
	}
}
