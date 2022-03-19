<template>
  <n-spin :show="loading">
    <n-image :src="storage.get_draw_url(props.task_id, threshold)" class="image_box">
    </n-image>
  </n-spin>

  <n-card title="检测结果" class="result">
    <n-form-item label="置信度阈值">
      <n-slider v-model:value="threshold" :min="0.05" :max="1" :step="0.05"></n-slider>
      <div style="width: 20px;"></div>
      <n-input-number v-model:value="threshold" :min="0.05" :max="1" :step="0.05"></n-input-number>
    </n-form-item>
    <n-statistic label="数量">
      {{ count }}
    </n-statistic>
    <template #action>
      <n-button type="primary" @click="save">
        完成并保存
      </n-button>
    </template>


  </n-card>
</template>

<script setup>
import {NButton, NCard, NFormItem, NImage, NInputNumber, NSlider, NSpin, NStatistic, useMessage} from 'naive-ui';

import {onMounted, onUnmounted, ref, watch} from "vue";
import {client, log_api, storage} from "../../apis";

const props = defineProps(['task_id']);


const loading = ref(false);

const count = ref(undefined);

const threshold = ref(undefined);

async function load_result() {
  try {
    let result = (await client.get("/detector/" + props.task_id + "/count?threshold=" + threshold.value)).data;
    count.value = result;
  } catch (e) {

  }

}

async function load_threshold() {
  let threshold_ = (await client.get("/detector/" + props.task_id)).data.threshold;
  if (threshold_) {
    threshold.value = threshold_;
  } else {
    threshold.value = 0.5;
  }
}

onMounted(async () => {
  loading.value = true;
  await load_threshold();
  await load_result();
  loading.value = false;
});

watch(threshold, async () => {
  loading.value = true;
  await load_result();
  loading.value = false;
});


const emit = defineEmits(['finished']);
const message = useMessage();

async function save() {
  let msg = message.loading('正在保存');
  await client.put("/detector/" + props.task_id, {
    threshold: threshold.value
  });
  msg.destroy();
  message.success("保存成功!");
  emit("finished", {threshold});
}
</script>

<style scoped>
.canvas {

}

.image_box {
  min-height: 300px;
  min-width: 300px;
  width: 100%;
  height: 100%;
}

.image_box > img {
  width: 90%;
  margin: auto;
}

.result {
  max-width: 500px;
  margin: 50px auto;
}
</style>

<style>
.image_box > img {
  width: 90%;
  margin: auto;
}

</style>
