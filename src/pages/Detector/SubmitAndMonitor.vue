<template>
  <n-spin :show="submitting">

  </n-spin>
  <div class="blank"></div>
</template>

<script setup>
import {onMounted, ref} from "vue";
import {client} from "../../apis";

const props = defineProps(['config', 'attachment', 'task_id']);

const emit = defineEmits(['finished', 'wait']);

const submitting = ref(true)

async function submit() {
  submitting.value = true;
  let result = await client.post("/detector", {
    attachment: props.attachment,
    window_size: props.config.window_size,
    overlap: props.config.overlap,
    tile_max_num: props.config.tile_max_num,
    model_name: props.config.model_name,
  });
  submitting.value = false;
  emit('wait', {task_id: result.data.task_id});
}

const stage = ref("pending");

const progress = ref(0); // 0-100

async function polling() {
  let result = await client.get("/detector/"+props.task_id+"/status");
  if (result.data.status === "processing") {
    stage.value = "processing";
    progress.value = result.data.current / result.data.total * 100;
    setTimeout(polling, 1000);
  } else if (result.data.status === "pending") {
    // 不变
    setTimeout(polling, 1000);
  } else {
    // 结束
    stage.value = "finished";
    emit('finished');
  }
}

onMounted(() => {
  // 提交任务
  submit();
  // 开始轮询状态
  polling();
})
</script>

<style scoped>

</style>
