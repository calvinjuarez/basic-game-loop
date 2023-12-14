<script setup>
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import { clamp } from '@/util/number.js';

import Settings from '@/components/Settings.vue';
import Controls from '@/components/Controls.vue';

import Clock from '@/game/Clock.js';
import Sprite from '@/game/Sprite.js';


const store = inject('store');

const $controls = ref(null);
const SCALE = computed(() => (store.avatarStyle === 'bug') ? 4 : 1);

let isWindowFocussed = true;

const sprite = new Sprite('/img/sprite-scarab.v2.png', {
	fps: 16,
	frames: [ 0, 1, 0, 2 ],
	size: 32,
	throttle(stepTime) { return stepTime * store.speed; },
});
const hitbox = Object.freeze({
	__proto__: null,
	get rX() { return SCALE.value * sprite.size.width / 2; },
	get rY() { return SCALE.value * sprite.size.height / 2; },
});


function update(stepTime) {
	if (! store.displayWidth || ! store.displayHeight) return;

	const {
		displayHeight,
		displayWidth,
		sensitivity,
		speed,
		speedX,
		speedY,
	} = store;

	const dX = stepTime * sensitivity * speedX;
	const dY = stepTime * sensitivity * speedY;

	const { rX, rY } = hitbox;

	store.x = clamp(store.x + dX, rX, displayWidth - rX);
	store.y = clamp(store.y + dY, rY, displayHeight - rY);

	if (speed)
		sprite.update(stepTime);
	else
		sprite.skipToFrame(0, { end: true });

	$controls.value.update(stepTime);
}
function draw() {
	if (! store.display) return;

	const { display, displayWidth, displayHeight } = store;
	const { width, height } = sprite.size;

	display.clearRect(0, 0, displayWidth, displayHeight);

	switch (store.avatarStyle) {
		case 'box': {
			display.fillStyle = store.color;
			display.fillRect(store.x - width / 2, store.y - height / 2, width, height);
			break;
		}
		case 'bug': {
			// see https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations
			const FRAME = sprite.framePx;
			const OUTLINE = sprite.getLayerPx(0);
			const FILL = sprite.getLayerPx(1);
			const drawArea = [
				store.x - (SCALE.value * width / 2),
				store.y - (SCALE.value * height / 2),
				SCALE.value * width,
				SCALE.value * height,
			];

			const helper = document.createElement('canvas').getContext('2d');

			// generate the colorized fill
			helper.canvas.width = width;
			helper.canvas.height = height;
			helper.fillStyle = store.color;
			helper.fillRect(0, 0, width, height);
			helper.globalCompositeOperation = 'destination-in'; // see https://stackoverflow.com/questions/45706829/change-color-image-in-canvas
			helper.drawImage(sprite.img, FRAME, FILL, width, height, 0, 0, width, height);

			// set rotation
			display.translate(store.x, store.y);
			display.rotate(store.facing);
			display.translate(-store.x, -store.y)
			// draw the colorized fill
			display.drawImage(helper.canvas, ...drawArea);
			// draw the outline
			display.fillStyle = '#000000';
			display.drawImage(sprite.img, FRAME, OUTLINE, width, height, ...drawArea);
			// reset rotation (and everything else)
			display.setTransform(1, 0, 0, 1, 0, 0);
			break;
		}
		default:
			throw new Error(`Unrecognized avatarStyle ${JSON.stringify(avatarStyle)}`);
	}


	if (store.isPaused) {
		const barWidth = 50;
		const barHeight = 150;
		const x = (displayWidth - barWidth) / 2;
		const y = (displayHeight - barHeight) / 2;

		display.fillStyle = '#00000033';
		display.fillRect(0, 0, displayWidth, displayHeight);
		display.fillRect(x - barWidth, y, barWidth, barHeight);
		display.fillRect(x + barWidth, y, barWidth, barHeight);
	}
}


const clock = new Clock(stepTime => {
	if (store.isPaused || ! isWindowFocussed) return;

	update(stepTime);
	draw();
}, {
	doMeasureFPS: true,
	onFPSChange(fps) { store.dev.fps = fps; },
});

clock.start();


window.$game = { clock, store, sprite, hitbox };


// pausing blocks updates from the clock, so to note that we've paused, we call
// draw() one more time when the `isPaused` value changes to `true`.
watch(() => store.isPaused, () => store.isPaused && draw());


const _onBlur = () => isWindowFocussed = false;
const _onFocus = () => isWindowFocussed = true;


onMounted(() => {
	window.addEventListener('blur', _onBlur);
	window.addEventListener('focus', _onFocus);

	store.displayTo(document.getElementById('game-display'));

	store.x = store.displayWidth / 2;
	store.y = store.displayHeight / 2;

	draw();
});
onBeforeUnmount(() => {
	window.removeEventListener('blur', _onBlur);
	window.removeEventListener('focus', _onFocus);

	delete window.$game;

	store.reset();
});
</script>



<template>
	<div class="game">
		<canvas
			class="game-display"
			id="game-display"
			width="1600"
			height="900"
		></canvas>
		<Controls class="game-controls" ref="$controls"/>
		<Settings class="game-settings"/>
	</div>
</template>



<style>
.game {
	display: grid;
	gap: var(--spacer-2);
	grid-template-columns: auto 200px;

	@media only screen and (min-width: 576px) {
		display: flex;
		flex-wrap: wrap;
		align-items: start;
	}
}
.game-display {
	justify-self: center;
	grid-column-start: span 2;
	outline: 1px solid #b9b9b9; /* don't wanna add space to the box model */
	width: 100%;
	max-width: 400px;
}
.game-controls {
	@media only screen and (max-width: 575px) {
		order: 1;
	}
}
.game-settings {}
</style>
