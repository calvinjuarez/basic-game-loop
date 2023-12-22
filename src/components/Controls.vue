<script setup>
import { inject, onMounted } from 'vue';

import Joystick from '@/components/Joystick.vue';


const store = inject('store');

const Key = { 87: 'w', 65: 'a', 83: 's', 68: 'd', 16: 'shift' };
const KEYS = Object.keys(Key).map(key => +key);


onMounted(() => {
	window.addEventListener('keydown', e => {
		if (store.input.hasKey)
			e.preventDefault();

		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (! KEYS.includes(e.keyCode)) return;

		store.input.key[Key[e.keyCode]] = true;
	}, false);
	window.addEventListener('keyup', e => {
		if (store.input.hasKey)
			e.preventDefault();

		if (! KEYS.includes(e.keyCode)) return;

		store.input.key[Key[e.keyCode]] = false;
	}, false);
	window.addEventListener('beforeunload', e => {
		if (store.input.hasKey)
			e.preventDefault();
	});
});
</script>



<template>
	<Joystick/>
</template>



<style></style>
