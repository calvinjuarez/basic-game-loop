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
).replace(/["\n]/g, '').replace(/\]/, ' ]').toUpperCase());
const isDevHidden = ref(false);
const deci = n => (
	(n === -0)
		? ' 0.000'
		: ((n >= 0 ? ' ' : '') + (+n).toPrecision(4)).slice(0, 6)
);
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
			<section class="dev-info-section">
				<h6>Performance</h6>
				<dl class="dl-cols  ms-2 mb-0">
					<dt>fps:</dt>
					<dd><output>~{{ store.dev.fps }}</output></dd>
				</dl>
			</section>
			<section class="dev-info-section">
				<h6>Display</h6>
				<dl class="dl-cols  ms-2 mb-0">
					<dt>avatar color:</dt>
					<dd><output>
						{{ store.color }}
						<span class="dev-info-swatch" :style="`--swatch:${store.color};`"></span>
					</output></dd>
					<dt>dimensions (pixels):</dt>
					<dd><output>{{ displayPxSize }}</output></dd>
					<dt>dimensions (screen):</dt>
					<dd><output>{{ displaySize }}</output></dd>
				</dl>
			</section>
			<section class="dev-info-section">
				<h6>Game</h6>
				<dl class="dl-cols  ms-2 mb-0">
					<dt>avatar style:</dt>
					<dd><output>{{ store.avatarStyle }}</output></dd>
					<dt>inputs:</dt>
					<dd><output>{{ inputs }}</output></dd>
					<dt>position:</dt>
					<dd><output>(x: {{ Math.round(store.x) }}, y: {{ Math.round(store.y) }})</output></dd>
					<dt>speed:</dt>
					<dd><output>{{ deci(store.speed) }}</output></dd>
					<dd><output>(x:{{ deci(store.speedX) }}, y:{{ deci(store.speedY) }})</output></dd>
					<dt>throttle:</dt>
					<dd><output>(x:{{ deci(store.throttleX) }}, y:{{ deci(store.throttleY) }})</output></dd>
				</dl>
			</section>
		</aside>
	</div>
</template>



<style>
.dev output {
	font-family: var(--bs-font-monospace, monospace);
}
.dev-tools {}
	.dev-tools-bar {
		display: flex;
		gap: 0 var(--spacer-1);
	}
.dev-info {
	columns: 18rem;

	& > :is(h1, h2, h3, h4, h5, h6) {
		column-span: all;
	}
}
	.dev-info-section {
		page-break-inside: avoid;
	}

.dev-info-swatch {
	display: inline-block;
	height: 1rem;
	width: 1rem;
	background-color: var(--swatch, #000000);
}
</style>
