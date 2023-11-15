<script setup>
import { ref } from 'vue';

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
	<dl class="dl-cols">
		<dt>fps:</dt>
		<dd><output>{{ fps }}</output></dd>
	</dl>
</template>

<style></style>
