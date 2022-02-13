<template>
<!--  检测器-->
  <n-card title="新检测" class="module">
    <n-steps :current="current_step" :status="current_status">
      <n-step title="上传图片"></n-step>
      <n-step title="提交处理"></n-step>
      <n-step title="结果微调"></n-step>
    </n-steps>
    <div class="component_container">
      <UploadImage v-if="current_step===1 && current_status==='process'" @finish="stage_1_finished"></UploadImage>
      <n-image :src="storage.get_thumbs_url(current_fid, 400, 300)" :preview-src="storage.get_inline_url(current_fid)" v-if="current_status==='finish' && current_step === 1" class="image">
      </n-image>
    </div>


    <template #action>
      <n-space justify="space-around">
        <n-button :disabled="current_step === 1">上一步</n-button>
        <n-button :disabled="current_status!=='finish' || current_step === 3" @click="next_step">下一步</n-button>
      </n-space>
    </template>
  </n-card>
  <n-card title="检测记录" class="module">

  </n-card>
</template>

<script setup>
import {
  NCard,
    NStep,
    NSteps,
    NButton,
    NSpace,
    NImage
} from 'naive-ui'
import {computed, onMounted, ref} from "vue";
import UploadImage from "./Detector/UploadImage.vue";

const current_step = ref(1);
const current_status = ref('process');

import {client, storage} from "../apis";

let current_fid = ref(undefined);

function get_local_cache() {
  if (localStorage.getItem('detector_cache') !== null){
    return JSON.parse(localStorage.getItem('detector_cache'));
  } else {
    return false;
  }
}

function sync_local_cache() {
  let cache = {
    current_step: current_step.value,
    current_status: current_status.value,
    current_fid: current_fid.value
  };
  localStorage.setItem('detector_cache', JSON.stringify(cache));
}

function next_step() {
  current_step.value += 1;
  current_status.value = 'process';
  sync_local_cache();
}

function wipe_local_cache() {
  localStorage.removeItem('detector_cache');
}

onMounted(() => {
  let cache = get_local_cache();
  if (cache) {
    current_step.value = cache.current_step;
    current_status.value = cache.current_status;
    current_fid.value = cache.current_fid;
  }

})

function stage_1_finished({fid}) {
  console.log(fid);
  current_fid.value = fid;
  current_status.value = "finish";
  sync_local_cache();
}

</script>

<style scoped>
  .module {
    margin: 20px;
    width: calc(100% - 40px);
  }
  .component_container {
    margin-top: 40px;
    text-align: center;
  }
  .image {
    margin: auto;
  }

</style>
