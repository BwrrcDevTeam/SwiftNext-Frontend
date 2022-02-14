<template>
  <n-spin :show="submitting" size="large">
    <div class="container">
      <n-progress type="circle" :percentage="progress" class="percentage" :status="circle_status">
      </n-progress>
      <n-text tag="h3" depth="3">{{ description }}</n-text>
    </div>

    <template #description>
      正在提交任务
    </template>
  </n-spin>
</template>

<script setup>
import {
  NProgress,
  NSpin,
  NText, useMessage
} from 'naive-ui';

import {onMounted, onUnmounted, ref} from "vue";
import {client} from "../../apis";

const props = defineProps(['config', 'attachment', 'task_id']);

const emit = defineEmits(['finish', 'wait', 'error']);

const submitting = ref(false);

const task_id = ref(undefined);

const description = ref('');

async function submit() {
  submitting.value = true;
  try {
    let result = await client.post("/detector", {
      attachment: props.attachment,
      window_size: props.config.window_size,
      overlap: props.config.overlap,
      tile_max_num: props.config.tile_max_num,
      model_name: props.config.model_name,
    });
    submitting.value = false;
    task_id.value = result.data.task_id;
    emit('wait', {task_id: task_id.value});
  } catch (e) {
    message.error("无法提交检测任务!");
    description.value = "无法提交检测任务!";
    submitting.value = false;
    emit('error', {error: e});
  }
}

const stage = ref("pending");

const progress = ref(0); // 0-100

const polling_alive = ref(true);

const polling_timeout = ref(null);

const circle_status = ref('default');

const message = useMessage();

async function polling() {
  if (!polling_alive.value) {
    return;
  }
  try {
    let result = await client.get("/detector/" + task_id.value + "/status");
    if (result.data.status === "processing") {
      stage.value = "processing";
      progress.value = parseFloat((result.data.current / result.data.total * 100).toFixed(2));
      description.value = "任务正在处理中";
      circle_status.value = "default";
      polling_timeout.value = setTimeout(polling, 1000);
    } else if (result.data.status === "pending") {
      // 不变
      description.value = "任务正在排队中";
      circle_status.value = "info"

      polling_timeout.value = setTimeout(polling, 1000);
    } else {
      // 结束
      if (!polling_alive.value) {
        return;
      }
      stage.value = "finished";
      description.value = "任务已完成";
      circle_status.value = "success";
      emit('finish', {task_id: task_id.value});
    }
  } catch (e) {
    message.error("检测任务失败!");
    if (!polling_alive.value) {
      return;
    }
    emit('error', {error: e});
    circle_status.value = "error";
    description.value = "检测任务失败!";
  }


}

onMounted(async () => {
  if (props.task_id !== undefined) {
    task_id.value = props.task_id;
  } else {
    await submit();
  }
  // 开始轮询状态
  await polling();
})

onUnmounted(() => {
  // 停止轮询状态
  polling_alive.value = false;
  clearTimeout(polling_timeout.value);
})
</script>

<style scoped>
.percentage {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto;
}

.container {
  margin-top: 50px;
  margin-bottom: 50px;
}

</style>
