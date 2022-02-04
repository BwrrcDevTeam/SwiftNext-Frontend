<template>
  <n-element class="compass" tag="div" @click="on_click" @dragover="on_click">
    <div class="compass" ref="compass">
      <span style="position: absolute; left: calc(50% - 4px); top: 0">N</span>
      <span style="position: absolute; left: calc(50% - 4px); bottom: 0;">S</span>
      <span style="position: absolute; left: 5px; top: calc(50% - 10px);">W</span>
      <span style="position: absolute; right: 5px;top: calc(50% - 10px);">E</span>
      <div class="pointer" :style="{transform: 'rotate(' + orientation +'deg)'}" :class="{none: none}">

      </div>
    </div>

  </n-element>
</template>

<script setup>
import {NElement} from "naive-ui";

import {ref, watch} from "vue";

const props = defineProps({
  orientation: {
  },
})

const emit = defineEmits([
  'update:orientation',
])

const compass = ref(null);
const none = ref(true);

watch(() => props.orientation, (val) => {
  if (val === undefined) {
    orientation.value = 0;
    none.value = true;
  } else {
    orientation.value = val;
    none.value = false;
  }
})

const orientation = ref(props.orientation || 0);

function on_click(e) {
  let click_x = e.offsetX;
  let click_y = e.offsetY;
  let width = compass.value.clientWidth;
  let height = compass.value.clientHeight;
  let center_x = width / 2;
  let center_y = height / 2;
  let angle = Math.atan2(click_y - center_y, click_x - center_x);
  let _orientation = angle / Math.PI * 180;
  _orientation += 90;
  if (_orientation < 0) {
    _orientation += 360;
  }
  if (_orientation > 360) {
    _orientation -= 360;
  }
  orientation.value = _orientation;
  none.value = false;
  emit('update:orientation', _orientation);
}

</script>

<style scoped>
  .compass {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background-color: var(--n-placeholder-color);
  }
  .pointer {
    transform-origin: bottom center;
    position: absolute;
    top: 20px;
    /*top: 10px;*/
    height: calc(50% - 20px);
    left: 50%;
    transition: all .2s;
    background-color: var(--primary-color);
    width: 3px;
    border-radius: 2px;
  }
  .pointer:hover {
    color: var(--primary-color-pressed);
  }
  .pointer:active {
    color: var(--primary-color-pressed);
  }
  .pointer {
    transform: rotate(10deg);
  }
  .none {
    background-color: var(--n-close-color);
  }
</style>
