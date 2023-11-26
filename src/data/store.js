import { reactive } from 'vue'


export class StoreTypeError extends TypeError {}

const store = reactive({
	color: 'black',
	display: null,
	displayHeight: 0,
	displayWidth: 0,
	sensitivity: 1,
	throttleX: 0,
	throttleY: 0,
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
});


export default store;
