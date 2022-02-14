<template>
<!--  检测器-->
  <n-card title="新检测" class="module">
    <n-steps :current="current_step" :status="current_status">
      <n-step title="上传图片"></n-step>
      <n-step title="检测配置"></n-step>
      <n-step title="提交处理"></n-step>
      <n-step title="结果微调"></n-step>
    </n-steps>
    <div class="component_container">
      <n-collapse-transition :show="current_step===1 && current_status==='process'">
        <UploadImage @finish="stage_1_finished"></UploadImage>
      </n-collapse-transition>
      <n-collapse-transition :show="current_status==='finish' && current_step === 1">
        <n-image :src="storage.get_thumbs_url(current_fid, 400, 300)" :preview-src="storage.get_inline_url(current_fid)" class="image">
        </n-image>
      </n-collapse-transition>
      <n-collapse-transition :show="current_step===2">
        <DetectConfig @finish="stage_2_finished" :preset="detect_preset" :config="detect_config"/>
      </n-collapse-transition>
      <n-collapse-transition :show="current_step===3">
        <SubmitAndMonitor @finish="stage_3_finished" :attachment="current_fid" :config="detect_config" :task_id="detect_id" @wait="stage_3_wait"/>
      </n-collapse-transition>
    </div>


    <template #action>
      <n-space justify="space-around">
        <n-button :disabled="current_step === 1" @click="last_step">上一步</n-button>
        <n-button :disabled="current_status!=='finish' || current_step === 4" @click="next_step">下一步</n-button>
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
    NImage,
    NCollapseTransition
} from 'naive-ui'
import {computed, onMounted, ref} from "vue";
import UploadImage from "./Detector/UploadImage.vue";
import DetectConfig from "./Detector/DetectConfig.vue";


const current_step = ref(undefined);
const current_status = ref(undefined);

import {client, storage} from "../apis";
import SubmitAndMonitor from "./Detector/SubmitAndMonitor.vue";

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
    current_fid: current_fid.value,
    detect_config: detect_config.value,
    detect_preset: detect_preset.value,
    detect_id: detect_id.value
  };
  localStorage.setItem('detector_cache', JSON.stringify(cache));
}

function last_step() {
  current_status.value = 'finish';
  current_step.value = current_step.value - 1;
  sync_local_cache();
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
    detect_config.value = cache.detect_config;
    detect_preset.value = cache.detect_preset;
    detect_id.value = cache.detect_id;
  } else {
    current_step.value = 1;
    current_status.value = 'process';
  }

})

function stage_1_finished({fid}) {
  console.log(fid);
  current_fid.value = fid;
  current_status.value = "finish";
  sync_local_cache();
}

const detect_config = ref(undefined);
const detect_preset = ref(undefined);

function stage_2_finished({config, preset}) {
  console.log(config, preset);
  current_status.value = "finish";
  detect_config.value = config;
  detect_preset.value = preset;
  sync_local_cache();
}

const detect_id = ref(undefined);

function stage_3_wait({task_id}) {
//  进入等待状态
  current_status.value = "wait";
  detect_id.value = task_id;
  sync_local_cache();
}

function stage_3_finished() {
  current_status.value = "finish";
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
