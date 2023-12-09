<script setup>
import { inject } from 'vue';


const store = inject('store');
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
	height: 2.4rem;

	&::-webkit-color-swatch-wrapper {
		height: 1rem;
		margin-top: .25rem;
	}
	&::-webkit-color-swatch {}
}
</style>
