import { reactive, watchEffect } from 'vue';


export class StoreTypeError extends TypeError {}

const store = reactive({
	avatarStyle: window.localStorage.getItem('avatar') || 'bug',
	color: window.localStorage.getItem('color') || '#55aadd',
	display: null,
	displayHeight: 0,
	displayWidth: 0,
	facing: 0,
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
	throttleX: 0,
	throttleY: 0,
	throttle: 0,
	title: 'Browser Game',
	x: 0,
	y: 0,

	dev: {
		fps: '0',
	},

	setDisplay(canvas) {
		if (! canvas instanceof HTMLCanvasElement)
			throw new StoreTypeError(`setDisplay() requires 'canvas' to be an
				HTMLCanvasElement instance.`)

		this.display = canvas.getContext('2d');
		this.displayWidth = canvas.width;
		this.displayHeight = canvas.height;
	},
	unsetDisplay() {
		this.display = null;
		this.displayHeight = 0;
		this.displayWidth = 0;
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

	const { throttleX, throttleY } = store;
	const throttle = Math.min(1, Math.sqrt(throttleX ** 2 + throttleY ** 2));

	store.throttle = throttle;

	// see https://stackoverflow.com/questions/15994194/how-to-convert-x-y-coordinates-to-an-angle
	if (throttle)
		store.facing = Math.atan2(throttleX, -throttleY); // -Y because canvas Y-axis increases downward as opposed to upward
});


export default store;
