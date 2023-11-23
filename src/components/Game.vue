<script setup>
import { ref, computed, inject, onMounted } from 'vue';
import { clamp } from '@/util/number.js';

import Clock from '@/game/Clock.js';

import GameControls from '@/components/GameControls.vue';


const store = inject('store');

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


window.addEventListener('blur', () => isWindowFocussed = false);
window.addEventListener('focus', () => isWindowFocussed = true);


function update(stepTime) {
	if (! store.displayWidth || ! store.displayHeight) return;

	const throttle = .2;
}
function draw() {
	if (! store.display) return;

	store.display.clearRect(0, 0, store.displayWidth, store.displayHeight);
	store.display.fillRect(store.x - 16, store.y - 16, 32, 32);
}


const clock = new Clock(stepTime => {
	if (isPaused.value || ! isWindowFocussed) return;

	update(stepTime);
	draw();
}, {
	doMeasureFPS: true,
	onFPSChange(_fps) { fps.value = `~${_fps}fps`; },
});

clock.start();


onMounted(() => {
	store.setDisplay(document.getElementById('game-display'));
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
		<GameControls/>
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
			</dl>
			<h6>Game</h6>
			<dl class="dl-cols">
				<dt>(x,y):</dt>
				<dd><output>{{ `(${Math.round(store.x)},${Math.round(store.y)})` }}</output></dd>
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
