<script setup>
import { ref, computed, onMounted } from 'vue';

import Clock from '@/game/Clock.js';
import store from '@/data/store.js';


const displaySize = computed(() => (store.display
	? `${store.display.canvas.offsetWidth}x${store.display.canvas.offsetHeight}`
	: 'none'
));
const displayPxSize = computed(() => (store.display
	? `${store.displayWidth}x${store.displayHeight}`
	: 'none'
));
const fps = ref('');


function update(stepTime) {
	if (! store.displayWidth || ! store.displayHeight) return;

	const throttle = .1;

	store.x = (store.x + (stepTime * throttle)) % store.displayWidth;
	store.y = (store.y + (stepTime * throttle)) % store.displayHeight;
}
function draw() {
	if (! store.display) return;

	store.display.clearRect(0, 0, store.displayWidth, store.displayHeight);
	store.display.fillRect(store.x - 16, store.y - 16, 32, 32);
}


const clock = new Clock(stepTime => {
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
		<aside class="game-dev-info">
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
		</aside>
	</div>
</template>

<style>
.game {
	display: flex;
	gap: var(--spacer-2);
}
.game-display {
	outline: 1px solid #b9b9b9; /* don't wanna add space to the box model */
	width: 100%;
	max-width: 400px;
}
.game-dev-info {}
</style>
