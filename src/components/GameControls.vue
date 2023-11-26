<script setup>
import { inject } from 'vue';

import Joystick from '@/components/Joystick.vue';


const store = inject('store');
</script>



<template>
	<div class="game-controls">
		<label class="control-label d-flex gap-1">
			Color:
			<input type="color" class="form-control" v-model="store.color"/>
		</label>
		<Joystick/>
	</div>
</template>



<style>

</style>
