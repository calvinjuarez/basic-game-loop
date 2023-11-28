<script setup>
import { inject } from 'vue';

import Joystick from '@/components/Joystick.vue';


const store = inject('store');
</script>



<template>
	<div class="game-controls">
		<Joystick/>
		<div>
			<label class="game-control-traditional  control-label">
				Title:
				<input type="text" class="form-control" v-model="store.title"/>
			</label>
			<label class="game-control-traditional  control-label">
				Color:
				<input type="color" class="form-control" v-model="store.color"/>
			</label>
		</div>
	</div>
</template>



<style>
.game-controls {
	display: flex;
	gap: var(--spacer-2);
}
.game-control-traditional {
	display: flex;
	gap: var(--spacer-1);
	align-items: baseline;
	margin-bottom: var(--spacer-1);
}
</style>
