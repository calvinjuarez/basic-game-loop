<script setup>
import { inject, onMounted } from 'vue';


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
	<div class="settings">
		<label class="setting  control-label">
			Title:
			<input type="text" class="form-control" v-model="store.title" @keydown.stop/>
		</label>
		<label class="setting  control-label">
			Color:
			<input type="color" class="form-control" v-model="store.color" @keydown.stop/>
		</label>
	</div>
</template>



<style>
.settings {}
.setting {
	display: flex;
	gap: var(--spacer-1);
	align-items: baseline;
	margin-bottom: var(--spacer-1);
}
.setting input {
	display: block;
}
.setting input[type="color"] {
	height: calc(1.5rem + (2 * 0.375rem));

	&::-webkit-color-swatch-wrapper {
		height: 1rem;
		margin-top: .1875rem;
	}
	&::-webkit-color-swatch {}
}
</style>
