import { reactive } from 'vue'


export class StoreTypeError extends TypeError {}

export default reactive({
	display: null,
	displayHeight: 0,
	displayWidth: 0,
	edgeBehavior: 'bounce', // or 'loop' for pac-man/asteroids-like behavior
	negX: false,
	negY: false,
	x: 0,
	y: 0,

	setDisplay(canvas) {
		if (! canvas instanceof HTMLCanvasElement)
			throw new StoreTypeError(`setDisplay() requires 'canvas' to be an
				HTMLCanvasElement instance.`)

		this.display = canvas.getContext('2d');
		this.displayWidth = canvas.width;
		this.displayHeight = canvas.height;
	},
	setX(x) {
		this.x = x;

		if (this.edgeBehavior === 'bounce') {
			if (x >= (this.displayWidth - 16)) this.negX = true;
			else if (x <= 16) this.negX = false;
		}
	},
	setY(y) {
		this.y = y;

		if (this.edgeBehavior === 'bounce') {
			if (y >= (this.displayHeight - 16)) this.negY = true;
			else if (y <= 16) this.negY = false;
		}
	},
});
