<script setup>
import { ref } from 'vue';


const $dialog = ref(null);
const showing = ref(false);


function close() { showing.value = false; }
function show() { showing.value = true; }


defineExpose({
	close,
	show,
});
</script>



<template>
	<Transition
		@before-enter="$emit('show');$dialog.showModal();"
		@after-enter="$emit('shown');"
		@before-leave="$emit('close');"
		@after-leave="$dialog.close();$emit('closed');"
	>
		<dialog
			class="modal"
			@click="close"
			ref="$dialog"
			v-show="showing"
		>
			<form
				method="dialog"
				class="modal-content"
				@click.stop
			>
				<slot></slot>
			</form>
		</dialog>
	</Transition>
</template>



<style>
.modal:modal {
	position: fixed;
	height: fit-content;
	width: fit-content;
	background: none;
	border: none;
	overflow-x: auto;
	overflow-y: auto;
}
.modal[open] {
	display: block;
}

.v-enter-active,
.v-leave-active {
	transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
	opacity: 0;
}
</style>
