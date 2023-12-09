<script setup>
import { provide } from 'vue';

import store from '@/data/store';

import Dev from '@/components/Dev.vue';
import Game from '@/components/Game.vue';


provide('store', store);
</script>

<template>
	<header>
		<h1 class="display-1">{{ store.title.trim() }}</h1>
		<p class="lead">A sandbox.</p>
	</header>

	<main>
		<Game class="section"/>
		<Dev class="section"/>
	</main>
</template>

<style>
h1:empty::before {
	content: '\0000A0';
}
</style>
