<script setup>
import { inject, onBeforeUnmount, onMounted, reactive, ref } from 'vue';

import Joystick from '@/components/Joystick.vue';
import Modal from '@/components/modal/Modal.vue';


const store = inject('store');

const Key = { 87: 'w', 65: 'a', 83: 's', 68: 'd', 16: 'shift' };
const KEYS = Object.keys(Key).map(key => +key);

const $modal = ref(null);

const pressed = reactive([]);
const active = reactive([]);

const wizard = reactive({
	gamepadIndex: store.gamepads[0]?.index || -1,
	reset() {
		Object.assign(this, {
			calibrated: false,
			gamepad: null,
			mapping: {
				down: null,
				left: null,
				right: null,
				up: null,
			},
			mappingDir: 'up',
			step: 1,
			steps: 3,
		});
	},
	__proto__: null,
});
wizard.reset();


function connectPad(e) {
	$modal.value.show();
}
function map(dir) {
	wizard.mappingDir = dir;
}
function save() {
	alert('"Save"');
	$modal.value.close();
}
function update(stepTime) {
	if (store.supports.gamepads)
		store.gamepads = [ ...navigator.getGamepads().filter(x => x) ];

	if (wizard.gamepad) {
		pressed.value = wizard.gamepad.buttons.filter(button => button.pressed);


	}
}
function wizardBack() {
	wizard.step--;
}
function wizardCanNext() {
	switch (wizard.step) {
		case 1: return wizard.gamepadIndex > -1;
		case 2: return false;
		case 3: return false;
		default: return false;
	}
}
function wizardNext() {
	if (! wizardCanNext()) return; // #sanity check

	switch (wizard.step) {
		case 1: {
			wizard.gamepad = store.gamepads[wizard.gamepadIndex];

			break;
		}
		case 2: break;
		case 3: break;
		default: return;
	}

	wizard.step++;
}


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
}
const _onGamepadConnected = e => {
	store.gamepads[e.gamepad.index] = e.gamepad;
	wizard.gamepadIndex = e.gamepad.index;
};


onMounted(() => {	window.addEventListener('keydown', _onKeyDown, false);
	window.addEventListener('keyup', _onKeyUp, false);
	window.addEventListener('beforeunload', _onBeforeUnload);
});
onBeforeUnmount(() => {
	window.removeEventListener('keydown', _onKeyDown, false);
	window.removeEventListener('keyup', _onKeyUp, false);
	window.removeEventListener('beforeunload', _onBeforeUnload);

	if (store.supports.gamepadEvents)
		window.addEventListener('gamepadconnected', _onGamepadConnected);
});


defineExpose({
	update,
});
</script>



<template>
	<div>
		<Joystick/>
		<div>
			<button
				type="button"
				class="btn btn-sm btn-outline-secondary"
				:title="store.supports.gamepads
					? 'Connect Game Pad'
					: 'Game Pad Connection Not Supported'"
				:disabled="! store.supports.gamepads"
				@click="connectPad($event)"
			>
				&#127918;
			</button>
		</div>

		<Modal ref="$modal" @closed="wizard.reset();">
			<header class="modal-header">
				<h2>Connect Game Pad</h2>
				<button
					type="button"
					class="btn-close"
					aria-label="Close"
					@click="$modal.close"
				></button>
			</header>
			<div class="modal-body">
				<template v-if="wizard.step === 1">
					<div v-if="store.gamepads.length < 1">
						<p>No gamepads found. Press any button on your gamepad.</p>
					</div>
					<template v-else>
						<label class="form-label">Select Gamepad:</label>
						<select class="form-select" v-model="wizard.gamepadIndex">
							<template v-for="gamepad in store.gamepads">
								<option v-if="gamepad" :key="gamepad.index" :value="gamepad.index">
									{{ gamepad.id }}
								</option>
							</template>
						</select>
					</template>
				</template>
				<template v-else-if="wizard.step === 2">
					<p>Press "{{ wizard.mappingDir }}".</p>
				</template>
				<template v-else>
					Done
				</template>
			</div>
			<div class="modal-footer">
				<button
					type="button"
					class="btn btn-secondary  me-auto"
					@click="$modal.close"
				>Close</button>
				<button
					v-if="wizard.step > 1"
					type="button"
					class="btn btn-primary"
					@click="wizardBack"
				>Back</button>
				<button
					v-if="wizard.step < wizard.steps"
					type="button"
					class="btn btn-primary"
					:disabled="! wizardCanNext()"
					@click="wizardNext"
				>Next</button>
				<button
					v-else
					type="button"
					class="btn btn-primary"
					:disabled="! wizardCanNext()"
					@click="save"
				>Save</button>
			</div>
		</Modal>

	</div>
</template>



<style></style>
