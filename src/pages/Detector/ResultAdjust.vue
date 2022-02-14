<template>
  <n-spin :show="loading">
    <div class="container" ref="container">
      <canvas ref="canvas" class="canvas"
              :style="{transform: `scale(${scale}) translateX(`+translate_x+`px) translateY(`+translate_y+`px)`}"/>
    </div>
  </n-spin>

  <n-card title="检测结果" class="result">
    <n-form-item label="置信度阈值">
      <n-slider v-model:value="threshold" :min="0.05" :max="1" :step="0.05"></n-slider>
      <div style="width: 20px;"></div>
      <n-input-number v-model:value="threshold" :min="0.05" :max="1" :step="0.05"></n-input-number>
    </n-form-item>
    <n-statistic label="数量">
      {{task ? task.result.length : 0}}
    </n-statistic>
    <template #action>
      <n-button type="primary" @click="save">
        完成并保存
      </n-button>
    </template>


  </n-card>
</template>

<script setup>
import {
  NCard,
  NSlider,
  NInputNumber,
  NFormItem,
  NStatistic,
  NSpin,
  NButton, useMessage
} from 'naive-ui';

import {onMounted, onUnmounted, ref, watch} from "vue";
import {client, storage} from "../../apis";

const props = defineProps(['task_id']);

const scale = ref(1);

const canvas = ref(null);

const loading = ref(false);

function rect(ctx, y_min, y_max, x_min, x_max, score) {
  ctx.beginPath();
  ctx.strokeStyle = '#ff0000';
  ctx.lineWidth = 2;
  ctx.strokeRect(x_min, y_min, x_max - x_min, y_max - y_min);
  ctx.font = '16px Arial';
  ctx.fillStyle = '#ff0000';
  ctx.fillText(`${score.toFixed(2)}`, x_min - 8, y_min - 5);
}

function auto_scale() {
  let container_width = container.value.getBoundingClientRect().width;
  let container_height = container.value.getBoundingClientRect().height;
  let canvas_width = image_width;
  let canvas_height = image_height;
  let scale_x = container_width / canvas_width;
  let scale_y = container_height / canvas_height;
  scale.value = Math.min(scale_x, scale_y);
}

function auto_center() {
  let canvas_width = image_width;
  let canvas_height = image_height;
  let canvas_left = container.value.getBoundingClientRect().left;
  let canvas_top = container.value.getBoundingClientRect().top;
  let canvas_center_x = canvas_left + canvas_width / 2;
  let canvas_center_y = canvas_top + canvas_height / 2;

  let container_top = container.value.getBoundingClientRect().top;
  let container_left = container.value.getBoundingClientRect().left;
  let container_width = container.value.getBoundingClientRect().width;
  let container_height = container.value.getBoundingClientRect().height;
  let container_center_x = container_left + container_width / 2;
  let container_center_y = container_top + container_height / 2;

  translate_x.value = (container_center_x - canvas_center_x) / scale.value;
  translate_y.value = (container_center_y - canvas_center_y) / scale.value;
}

const container = ref(null);

let image_width = 1920;
let image_height = 1080;

const translate_x = ref(0);
const translate_y = ref(0);

function draw() {
  let image = storage.get_inline_url(task.value.attachment);
  let img = new Image();
  img.src = image;
  img.onload = function () {
    canvas.value.width = img.width;
    canvas.value.height = img.height;
    image_width = img.width;
    image_height = img.height;
    let ctx = canvas.value.getContext('2d');
    // 初始化画布
    ctx.clearRect(0, 0, img.width, img.height);
    ctx.drawImage(img, 0, 0);
    task.value.result.forEach(box => {
      rect(ctx, box.y_min, box.y_max, box.x_min, box.x_max, box.score);
    })
    auto_scale();
    auto_center();
  }

}

const task = ref(undefined);

const threshold = ref(undefined);

async function load_result() {
  let result = await client.get("/detector/" + props.task_id + (threshold.value ? ("?threshold=" + threshold.value): ''));
  task.value = result.data;
}

function on_resize() {
  auto_scale();
  auto_center();
}

onMounted(async () => {
  loading.value = true;
  await load_result();
  threshold.value = task.value.threshold;
  draw();
  loading.value = false;
  window.addEventListener('resize', on_resize);
});

watch(threshold, async () => {
  loading.value = true;
  await load_result();
  draw();
  loading.value = false;
});

onUnmounted(() => {
  window.removeEventListener('resize', on_resize);
});

const emit = defineEmits(['finished']);
const message = useMessage();

async function save() {
  await client.put("/detector/" + props.task_id, {
    threshold: threshold.value
  });
  message.success("保存成功!");
  emit("finished", {threshold});
}
</script>

<style scoped>
.canvas {

}

.container {
  width: 100%;
  height: 100%;
  max-height: calc(100vh - 300px);
  overflow: hidden;
}

.result {
  max-width: 500px;
  margin: 50px auto;
}
</style>
