<script setup>
import { reactive, ref } from 'vue';

import { clamp } from '@/util/number.js';


const controlling = ref(false);
const position = reactive({
	x: 0,
	y: 0,
});


const $handle = ref(null);

let pointerX = 0;
let pointerY = 0;


function controlStart(e) {
	controlling.value = true;

	pointerX = e.x;
	pointerY = e.y;

	$handle.value.setPointerCapture(e.pointerId);
}
function controlMove(e) {
	if (! controlling.value) return;

	position.x = clamp(e.x - pointerX, -100, 100);
	position.y = clamp(e.y - pointerY, -100, 100);

	// #sanitycheck: end control if we lose pointer capture (which somehow
	// happens sometimes, though I'm not sure why.
	if (! $handle.value.hasPointerCapture(e.pointerId))
		controlEnd();
}
function controlEnd(e) {
	controlling.value = false;

	position.x = pointerX = 0;
	position.y = pointerY = 0;

	if (e && $handle.value.hasPointerCapture(e.pointerId))
		$handle.value.releasePointerCapture(e.pointerId);
}
</script>



<template>
	<div class="joystick">
		<form
			class="joystick-position"
			@submit.prevent
		>
			<input type="hidden" name="joystick-x" :value="position.x"/>
			<input type="hidden" name="joystick-y" :value="position.y"/>
		</form>

		<svg
			class="joystick-visual"
			viewBox="-100 -100 200 200"
			height="200"
			width="200"
			overflow="visible"
			@pointerdown.stop="controlStart($event)"
			@pointermove.stop="controlMove($event)"
			@pointerup.stop="controlEnd($event)"
		>
			<rect
				class="joystick-boundary"
				height="200"
				width="200"
				x="-100"
				y="-100"
			/>
			<circle
				class="joystick-handle"
				:cx="position.x"
				:cy="position.y"
				r="50"
				ref="$handle"
			/>
		</svg>
	</div>
</template>



<style>
.joystick-boundary {
	fill: var(--bs-gray-300);
}
.joystick-handle {
	fill: var(--bs-gray-600);
}
.joystick-handle::active {
	fill: var(--bs-gray-900);
}
</style>
