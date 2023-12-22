<script setup>
import { inject, onBeforeUnmount, onMounted } from 'vue';

import Joystick from '@/components/Joystick.vue';


const store = inject('store');

const Key = { 87: 'w', 65: 'a', 83: 's', 68: 'd', 16: 'shift' };
const KEYS = Object.keys(Key).map(key => +key);


const _onKeyDown = e => {
	if (store.input.hasKey)
		e.preventDefault();

	if (e.altKey || e.ctrlKey || e.metaKey) return;
	if (! KEYS.includes(e.keyCode)) return;

	store.input.key[Key[e.keyCode]] = true;
};
const _onKeyUp = e => {
	if (store.input.hasKey)
		e.preventDefault();

	if (! KEYS.includes(e.keyCode)) return;

	store.input.key[Key[e.keyCode]] = false;
};
const _onBeforeUnload = e => {
	if (store.input.hasKey)
		e.preventDefault();
};


onMounted(() => {
	window.addEventListener('keydown', _onKeyDown, false);
	window.addEventListener('keyup', _onKeyUp, false);
	window.addEventListener('beforeunload', _onBeforeUnload);
});
onBeforeUnmount(() => {
	window.removeEventListener('keydown', _onKeyDown, false);
	window.removeEventListener('keyup', _onKeyUp, false);
	window.removeEventListener('beforeunload', _onBeforeUnload);
});
</script>



<template>
	<Joystick/>
</template>



<style></style>
