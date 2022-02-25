<template>
<!--  检测器-->
  <n-card title="新检测" class="module">
    <n-steps :current="current_step" :status="current_status" :class="{'n-steps--vertical': is_mobile}">
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
        <SubmitAndMonitor @finish="stage_3_finished" :attachment="current_fid" :config="detect_config" :task_id="detect_id" @wait="stage_3_wait" @error="stage_3_error"/>
      </n-collapse-transition>
      <n-collapse-transition :show="current_step===4">
        <ResultAdjust :task_id="detect_id" @finished="stage_4_finish"/>
      </n-collapse-transition>
    </div>


    <template #action>
      <n-space justify="space-around">
        <n-button :disabled="current_step === 1" @click="last_step">上一步</n-button>
        <n-button :disabled="current_step === 1" @click="cancel_current">重置</n-button>
        <n-button :disabled="current_status!=='finish'" @click="next_step">{{ current_step !== 4 ? "下一步" : "完成" }}</n-button>
      </n-space>
    </template>
  </n-card>
  <n-card title="检测记录" class="module">
    <History/>
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
    NCollapseTransition,
} from 'naive-ui'
import {computed, onMounted, onUnmounted, ref} from "vue";
import UploadImage from "./Detector/UploadImage.vue";
import DetectConfig from "./Detector/DetectConfig.vue";


const current_step = ref(undefined);
const current_status = ref(undefined);

import {client, storage} from "../apis";
import SubmitAndMonitor from "./Detector/SubmitAndMonitor.vue";
import ResultAdjust from "./Detector/ResultAdjust.vue";
import History from "./Detector/History.vue";

let current_fid = ref(undefined);

function get_local_cache() {
  if (localStorage.getItem('detector_cache') !== null){
    let cache = JSON.parse(localStorage.getItem('detector_cache'));
    if (cache.current_step === 1 && cache.current_status === 'finish' && cache.current_fid === undefined) {
      // 无效缓存
      wipe_local_cache();
      return false;
    }
    return cache;
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
    detect_id: detect_id.value,
    detect_threshold: detect_threshold.value,
  };
  localStorage.setItem('detector_cache', JSON.stringify(cache));
}

function last_step() {
  current_status.value = 'finish';
  current_step.value = current_step.value - 1;
  sync_local_cache();
}

function next_step() {
  if (current_step.value === 4) {
    cancel_current(false);
  } else {
    current_step.value += 1;
    current_status.value = 'process';
    sync_local_cache();
  }

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
    detect_threshold.value = cache.detect_threshold;
  } else {
    current_step.value = 1;
    current_status.value = 'process';
  }
  update_mobile();
  window.addEventListener('resize', update_mobile);
})

onUnmounted(() => {
  window.removeEventListener('resize', update_mobile);
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
  console.log(task_id)
  detect_id.value = task_id;
  sync_local_cache();
}

function stage_3_finished() {
  current_status.value = "finish";
  sync_local_cache();
}

function stage_3_error() {
  current_status.value = "error";
  sync_local_cache();
}

function cancel_current(delete_remote = true) {
  current_step.value = 1
  current_status.value = "process"

  if (delete_remote && detect_id.value !== undefined) {
    client.delete("/detect/" + detect_id.value).then(() => {
      console.log("delete success");
    }).catch(() => {
      console.log("delete failed");
    })
  }

  current_fid.value = undefined;
  detect_config.value = undefined;
  detect_preset.value = undefined;
  detect_id.value = undefined;
  detect_threshold.value = undefined;

  sync_local_cache();
}
const detect_threshold = ref(0.3);

function stage_4_finish({threshold}) {
  current_status.value = "finish";
  detect_threshold.value = threshold;
  sync_local_cache();
}
const is_mobile = ref(false);

function update_mobile() {
  is_mobile.value = window.innerWidth < 600;
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

<style>
.image > img {
  width: 100%;
  margin: auto;
}
</style>
