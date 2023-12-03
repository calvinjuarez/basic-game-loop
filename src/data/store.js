import { reactive, watchEffect } from 'vue'


export class StoreTypeError extends TypeError {}

const store = reactive({
	color: window.localStorage.getItem('color'),
	display: null,
	displayHeight: 0,
	displayWidth: 0,
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
	sensitivity: 1,
	throttleX: 0,
	throttleY: 0,
	title: 'Browser Game',
	x: 0,
	y: 0,

	setDisplay(canvas) {
		if (! canvas instanceof HTMLCanvasElement)
			throw new StoreTypeError(`setDisplay() requires 'canvas' to be an
				HTMLCanvasElement instance.`)

		this.display = canvas.getContext('2d');
		this.displayWidth = canvas.width;
		this.displayHeight = canvas.height;

		this.display.fillStyle = this.color;
	},
	unsetDisplay() {
		this.display = null;
		this.displayHeight = 0;
		this.displayWidth = 0;
	},
});


watchEffect(() => window.localStorage.setItem('color', store.color));
watchEffect(() => {
	const { d, a, R, L } = store.inputs;

	store.throttleX = (.9 * (d || R)) + (-.9 * (a || L));
});
watchEffect(() => {
	const { w, s, U, D } = store.inputs;

	store.throttleY = (.9 * (s || D)) + (-.9 * (w || U));
});


export default store;
