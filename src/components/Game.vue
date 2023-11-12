<script setup>
import Clock from '@/game/Clock.js';
import { ref } from 'vue';

let output = ref('');
let _ticks = 0;
let _testing = false;

const onStarted = () => {
	let _testTimeout;

	const _testFR = () => {
		_ticks = 0;
		_testing = true;
		_testTimeout = setTimeout(() => {
			_testing = false
			output.value = `~${_ticks}fps`
		}, 1000);
	};
	const _sample = setInterval(() => _testFR(), 1100);
}

const clock = new Clock(() => { _testing && (_ticks++); }, { onStarted });

clock.start();
</script>

<template>
	<output>{{ output }}</output>
</template>

<style></style>
