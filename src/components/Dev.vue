<script setup>
import { computed, inject, ref } from 'vue';


const store = inject('store');

const displaySize = computed(() => (store.display
	? `${store.display.canvas.offsetWidth}x${store.display.canvas.offsetHeight}`
	: 'none'
));
const displayPxSize = computed(() => (store.display
	? `${store.displayWidth}x${store.displayHeight}`
	: 'none'
));
const inputs = computed(() => JSON.stringify(
	Object.keys(store.inputs).filter(key => store.inputs[key]), null, 1,
).replace(/["\n]/g, '').replace(/\]/, ' ]'));
const isDevHidden = ref(false);
const deci = n => n.toPrecision(5).slice(0, 6);
</script>



<template>
	<div class="dev">
		<aside class="dev-tools  section">
			<h5>Dev Tools</h5>
			<div class="dev-tools-bar">
				<button
					type="button"
					class="btn btn-outline-secondary"
					@click="store.isPaused = ! store.isPaused"
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
		<aside class="dev-info  section" v-if="! isDevHidden">
			<h5>Dev Info</h5>
			<h6>Performance</h6>
			<dl class="dl-cols  ms-2 mb-0">
				<dt>fps:</dt>
				<dd><output>{{ store.dev.fps }}</output></dd>
			</dl>
			<h6>Display</h6>
			<dl class="dl-cols  ms-2 mb-0">
				<dt>pixel dimensions:</dt>
				<dd><output>{{ displayPxSize }}</output></dd>
				<dt>dimensions on screen:</dt>
				<dd><output>{{ displaySize }}</output></dd>
				<dt>avatar color:</dt>
				<dd><output>{{ store.color }}</output></dd>
			</dl>
			<h6>Game</h6>
			<dl class="dl-cols  ms-2 mb-0">
				<dt>position (x, y):</dt>
				<dd><output>({{ Math.round(store.x) }}, {{ Math.round(store.y) }})</output></dd>
				<dt>throttle (x, y):</dt>
				<dd><output>({{ deci(store.throttleX) }}, {{ deci(store.throttleY) }})</output></dd>
				<dt>inputs:</dt>
				<dd><output>{{ inputs }}</output></dd>
				<dt>avatar style:</dt>
				<dd><output>{{ store.avatarStyle }}</output></dd>
			</dl>
		</aside>
	</div>
</template>



<style>
/*.dev-section*/.dev-info {}
/*.dev-section*/.dev-tools {}
	.dev-tools-bar {
		display: flex;
		gap: 0 var(--spacer-1);
	}
</style>
