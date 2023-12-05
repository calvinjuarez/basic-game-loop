<script setup>
import {
	computed,
	inject,
	onBeforeUnmount,
	onMounted,
	ref,
	watchEffect,
} from 'vue';

import { clamp } from '@/util/number.js';

import Settings from '@/components/Settings.vue';
import Joystick from '@/components/Joystick.vue';

import Clock from '@/game/Clock.js';
import Sprite from '@/game/Sprite.js';


const store = inject('store');

const inputs = computed(() => JSON.stringify(
	Object.keys(store.inputs).filter(key => store.inputs[key]), null, 1,
).replace(/["\n]/g, '').replace(/\]/, ' ]'));
const displaySize = computed(() => (store.display
	? `${store.display.canvas.offsetWidth}x${store.display.canvas.offsetHeight}`
	: 'none'
));
const displayPxSize = computed(() => (store.display
	? `${store.displayWidth}x${store.displayHeight}`
	: 'none'
));
const fps = ref('');

const isDevHidden = ref(false);
const isPaused = ref(false);

let isWindowFocussed = true;

const sprite = new Sprite('/img/sprite-scarab.png');
sprite.SIZE = 32;

const FRAME_LENGTH = 1000 / 30;
let frameTimer = 0;
let frame = 0;


window.addEventListener('blur', () => isWindowFocussed = false);
window.addEventListener('focus', () => isWindowFocussed = true);


function update(stepTime) {
	if (! store.displayWidth || ! store.displayHeight) return;

	const newX = stepTime * store.sensitivity * store.throttleX + store.x;
	const newY = stepTime * store.sensitivity * store.throttleY + store.y;

	store.x = clamp(newX, sprite.SIZE / 2, store.displayWidth - sprite.SIZE / 2);
	store.y = clamp(newY, sprite.SIZE / 2, store.displayHeight - sprite.SIZE / 2);

	if (store.throttle) {
		if ((frameTimer += stepTime * Math.min(store.throttle, .5)) >= FRAME_LENGTH) {
			frameTimer %= FRAME_LENGTH;
			frame = ++frame % 4;
		}
	}
	else
		frame = 0;
}
function draw() {
	if (! store.display) return;

	const { display, displayWidth, displayHeight } = store;
	const { SIZE } = sprite;

	display.clearRect(0, 0, displayWidth, displayHeight);

	switch (store.avatarStyle) {
		case 'box': {
			display.fillStyle = store.color;
			display.fillRect(store.x - SIZE / 2, store.y - SIZE / 2, SIZE, SIZE);
			break;
		}
		case 'bug': {
			// see https://spicyyoghurt.com/tutorials/html5-javascript-game-development/images-and-sprite-animations
			const SCALE = 4;
			const OUTLINE = 0 * SIZE;
			const FILL = 1 * SIZE;
			const Frames = [ 0, 1, 0, 2 ];
			const FRAME = Frames[frame] * SIZE;
			const RENDER_SIZE = SIZE * SCALE;
			const drawArea = [
				store.x - (RENDER_SIZE / 2),
				store.y - (RENDER_SIZE / 2),
				RENDER_SIZE,
				RENDER_SIZE,
			];

			const helper = document.createElement('canvas').getContext('2d');

			// generate the colorized fill
			helper.canvas.width = SIZE;
			helper.canvas.height = SIZE;
			helper.fillStyle = store.color;
			helper.fillRect(0, 0, SIZE, SIZE);
			helper.globalCompositeOperation = "destination-in"; // see https://stackoverflow.com/questions/45706829/change-color-image-in-canvas
			helper.drawImage(sprite.img, FRAME, FILL, SIZE, SIZE, 0, 0, SIZE, SIZE);

			// set rotation
			display.translate(store.x, store.y);
			display.rotate(store.facingAngle);
			display.translate(-store.x, -store.y)
			// draw the colorized fill
			display.drawImage(helper.canvas, ...drawArea);
			// draw the outline
			display.fillStyle = '#000000';
			display.drawImage(sprite.img, FRAME, OUTLINE, SIZE, SIZE, ...drawArea);
			// reset rotation (and everything else)
			display.setTransform(1, 0, 0, 1, 0, 0);
			break;
		}
		default:
			throw new Error(`Unrecognized avatarStyle ${JSON.stringify(avatarStyle)}`);
	}


	if (isPaused.value) {
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


// pausing blocks updates from the clock, so to note that we've paused, we call
// draw() one more time when the `isPaused` value changes to `true`.
watchEffect(() => isPaused.value && draw());


const clock = new Clock(stepTime => {
	if (isPaused.value || ! isWindowFocussed) return;

	update(stepTime);
	draw();
}, {
	doMeasureFPS: true,
	onFPSChange(_fps) { fps.value = `~${_fps}fps`; },
});

clock.start();


window.$game = { clock, store, sprite };


onMounted(() => {
	store.setDisplay(document.getElementById('game-display'));

	store.x = store.displayWidth / 2;
	store.y = store.displayHeight / 2;

	draw();
});

onBeforeUnmount(() => {
	delete window.$game;

	store.unsetDisplay();

	store.x = 0;
	store.y = 0;
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
		<Joystick/>
		<Settings/>
		<aside class="game-dev-tools">
			<h5>Dev Tools</h5>
			<div class="game-dev-tools-bar">
				<button
					type="button"
					class="btn btn-outline-secondary"
					@click="isPaused = ! isPaused"
				>&#9199;</button>
				<button
					type="button"
					class="btn btn-outline-secondary"
					@click="isDevHidden = ! isDevHidden"
				>Toggle Dev Info</button>
				<button
					type="button"
					class="btn btn-outline-secondary"
					@click="store.avatarStyle = (store.avatarStyle === 'bug') ? 'box' : 'bug'"
				>Switch to {{ (store.avatarStyle === 'bug') ? 'Box' : 'Bug' }}</button>
			</div>
		</aside>
		<aside class="game-dev-info" v-if="! isDevHidden">
			<h5>Dev Info</h5>
			<h6>Performance</h6>
			<dl class="dl-cols">
				<dt>fps:</dt>
				<dd><output>{{ fps }}</output></dd>
			</dl>
			<h6>Display</h6>
			<dl class="dl-cols">
				<dt>pixel dimensions:</dt>
				<dd><output>{{ displayPxSize }}</output></dd>
				<dt>dimensions on screen:</dt>
				<dd><output>{{ displaySize }}</output></dd>
				<dt>avatar color:</dt>
				<dd><output>{{ store.color }}</output></dd>
			</dl>
			<h6>Game</h6>
			<dl class="dl-cols">
				<dt>(x, y):</dt>
				<dd><output>{{ `(${Math.round(store.x)}, ${Math.round(store.y)})` }}</output></dd>
				<dt>avatarStyle:</dt>
				<dd><output>{{ store.avatarStyle }}</output></dd>
				<dt>inputs:</dt>
				<dd><output>{{ inputs }}</output></dd>
			</dl>
		</aside>
	</div>
</template>



<style>
.game {
	display: flex;
	flex-wrap: wrap;
	align-items: start;
	gap: var(--spacer-2);
}
.game-display {
	outline: 1px solid #b9b9b9; /* don't wanna add space to the box model */
	width: 100%;
	max-width: 400px;
}
.game-dev-info {}
.game-dev-tools {
	width: 100%;
}
	.game-dev-tools-bar {
		display: flex;
		gap: 0 var(--spacer-1);
	}
</style>
