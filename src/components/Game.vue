<script setup>
import { ref, computed, onMounted } from 'vue';

import Clock from '@/game/Clock.js';


let fps = ref('');

const clock = new Clock(() => {}, {
	doMeasureFPS: true,
	onFPSChange(_fps) { fps.value = `~${_fps}fps`; },
});

clock.start();

window.clock = clock;
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
			<dl class="dl-cols">
				<dt>fps:</dt>
				<dd><output>{{ fps }}</output></dd>
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
