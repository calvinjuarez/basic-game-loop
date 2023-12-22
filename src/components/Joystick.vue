<script setup>
import { computed, inject, reactive, ref } from 'vue';


const store = inject('store');

const $handle = ref(null);

let pointerX = 0;
let pointerY = 0;


const position = computed(() => ({
	x: store.speedX * 100,
	y: store.speedY * 100,
}));


function controlStart(e) {
	store.input.virtual.stick = true;

	pointerX = e.x;
	pointerY = e.y;

	$handle.value.setPointerCapture(e.pointerId);
}
function controlMove(e) {
	if (! store.input.virtual.stick) return;


	store.throttleX = (e.x - pointerX) / 100;
	store.throttleY = (e.y - pointerY) / 100;

	// #sanitycheck: end control if we lose pointer capture (which somehow
	// happens sometimes, though I'm not sure why.
	if (! $handle.value.hasPointerCapture(e.pointerId))
		controlEnd();
}
function controlEnd(e) {
	if (e && $handle.value.hasPointerCapture(e.pointerId))
		$handle.value.releasePointerCapture(e.pointerId);

	store.input.virtual.stick = false;

	store.throttleX = pointerX = position.x = 0;
	store.throttleY = pointerY = position.y = 0;
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
			@touchstart.stop.prevent
			@touchmove.stop.prevent
			@mousedown.stop.prevent
			@mousemove.stop.prevent
		>
			<circle
				class="joystick-boundary"
				cx="0"
				cy="0"
				r="100"
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
.joystick-visual {}
.joystick-boundary {
	fill: var(--bs-gray-300);
	opacity: .5;
}
.joystick-handle {
	cursor: grab;
	fill: var(--bs-gray-600);
	opacity: .5;

	&:active {
		cursor: grabbing;
	}
}
</style>
