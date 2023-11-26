<script setup>
import { provide } from 'vue';

import store from '@/data/store';

import Game from '@/components/Game.vue';


provide('store', store);
</script>

<template>
	<header>
		<h1 class="display-1">Browser Game</h1>
		<p class="lead">A sandbox.</p>
	</header>

	<main>
		<Game/>
	</main>
</template>

<style></style>
