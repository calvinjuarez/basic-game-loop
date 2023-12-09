<script setup>
import { inject, onMounted } from 'vue';

import Joystick from '@/components/Joystick.vue';


const store = inject('store');

const Key = {
	39: 'R', 37: 'L', 38: 'U', 40: 'D', // arrow keys
	87: 'w', 65: 'a', 83: 's', 68: 'd', // WASD
};
const KEYS = Object.keys(Key).map(key => +key);


onMounted(() => {
	window.addEventListener('keydown', e => {
		if (e.altKey || e.ctrlKey || e.metaKey) return;
		if (! KEYS.includes(e.keyCode)) return;

		store.inputs[Key[e.keyCode]] = true;
	}, false);
	window.addEventListener('keyup', e => {
		if (! KEYS.includes(e.keyCode)) return;

		store.inputs[Key[e.keyCode]] = false;
	}, false);
});
</script>



<template>
	<Joystick/>
</template>



<style></style>
