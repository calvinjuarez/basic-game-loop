/** @module */
import { computed, reactive, ref, watchEffect } from 'vue';


export class StoreTypeError extends TypeError {}


// PRIVATE PROPERTIES
const throttle = computed(() => (
	store.isPaused ? 0 : Math.sqrt(store.throttleX ** 2 + store.throttleY ** 2)
));
const normalFactor = computed(() => (
	(store.isPaused || throttle.value <= 1) ? 1 : (1 / throttle.value)
));
const facing = ref(0);


// PRIVATE METHODS
const normalize = n => n * normalFactor.value;


const store = reactive({
	// PUBLIC PROPERTIES
	avatarStyle: window.localStorage.getItem('avatar') || 'bug',
	color: window.localStorage.getItem('color') || '#55aadd',
	/** @var {?CanvasRenderingContext2D} */
	display: null,
	/** @readonly */
	displayHeight: computed(() => (
		(store.display instanceof CanvasRenderingContext2D)
			? store.display.canvas.height : 0
	)),
	/** @readonly */
	displayWidth: computed(() => (
		(store.display instanceof CanvasRenderingContext2D)
			? store.display.canvas.width : 0
	)),
	/** @readonly */
	facing: computed(() => facing.value),
	/** @readonly */
	hasInput: computed(() => Object.values(store.inputs).some(value => value)),
	inputs: {
		w: false,
		a: false,
		s: false,
		d: false,
		R: false,
		L: false,
		U: false,
		D: false,
	},
	isPaused: false,
	sensitivity: 1,
	/** @readonly */
	speed: computed(() => normalize(throttle.value)),
	/** @readonly */
	speedX: computed(() => normalize(store.throttleX)),
	/** @readonly */
	speedY: computed(() => normalize(store.throttleY)),
	throttleX: 0,
	throttleY: 0,
	title: 'Browser Game',
	x: 0,
	y: 0,

	dev: {
		fps: 0,
	},

	// PUBLIC METHODS
	/**
	 * Create a `CanvasRenderingContext2D` from the given canvas and set it as
	 * the display.
	 * @param {HTMLCanvasElement} canvas  The canvas on which to display the game.
	 * @throws {StoreTypeError} If `canvas` is NOT an HTMLCanvasElement instance.
	 */
	displayTo(canvas) {
		if (! (canvas instanceof HTMLCanvasElement))
			throw new StoreTypeError(`displayTo() requires 'canvas' to be an
				HTMLCanvasElement instance.`);

		this.display = canvas.getContext('2d');
	},
	/**
	 * Detach game from its display and set movement vars to 0.
	 */
	reset() {
		this.display = null;
		facing.value = this.throttleX = this.throttleY = this.x = this.y = 0;
	},
});


watchEffect(() => window.localStorage.setItem('color', store.color));
watchEffect(() => window.localStorage.setItem('avatar', store.avatarStyle));
watchEffect(() => {
	if (store.isPaused) return;

	const { d, a, R, L } = store.inputs;

	store.throttleX = (d || R) - (a || L); // note: coerced from booleans
});
watchEffect(() => {
	if (store.isPaused) return;

	const { w, s, U, D } = store.inputs;

	store.throttleY = (s || D) - (w || U); // note: coerced from booleans
});
watchEffect(() => {
	if (store.isPaused) return;
	if (! throttle.value) return;

	// see https://stackoverflow.com/questions/15994194/how-to-convert-x-y-coordinates-to-an-angle
	facing.value = Math.atan2(store.throttleX, -store.throttleY); // -Y because canvas Y-axis increases downward as opposed to upward
});


export default store;
