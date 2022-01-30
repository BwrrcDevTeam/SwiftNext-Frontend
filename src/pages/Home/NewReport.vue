<template>
  <PointedMap :points="points" style="width: 100%; height: 300px;"></PointedMap>
  <div style="height: 30px;"></div>
  <n-grid cols="1 800:2">
    <n-grid-item>
      <n-form-item required label="调查点">
        <n-select filterable :options="group_all_points"></n-select>
      </n-form-item>

    </n-grid-item>
    <n-grid-item>

    </n-grid-item>
  </n-grid>
</template>

<script setup>
import {NForm, NInput, NGrid, NGridItem, NFormItem} from 'naive-ui'
import {inject, onMounted, ref} from "vue";

import {client, log_api, update_session, config} from "../../apis";
import {io} from "socket.io-client";
import PointedMap from "../../components/PointedMap.vue";

const props = defineProps({
  default_detect_list: {
    type: Array,
    default: () => [],
  },
})
const t = inject("translate");

const session = inject("session");
const handle_crucial_error = inject("handle_crucial_error");

const detect_list = ref(props.default_detect_list);

// 填报数据
const data = ref({
  // 必备字段
  "position": null, // 调查点的ID
  // "specific_location": null, // 具体jin w
})

const points = ref([])

// log_api("广播", "Client => Server", "开始连接");
// const socket = io(config.socket);
//
// socket.io.on("open", () => {
//   log_api("广播", "Client => Server", "连接成功");
// });
const group_all_points = ref([]);

// 初始化
onMounted(async () => {
//  在挂载后，1.检查用户有没有草稿
  try {
    session.value = await update_session();
  } catch (e) {
  //  这个错误我接不了(
    handle_crucial_error(e);
  }
//  2. 询问有无草稿
  try {
    log_api("草稿", "Client => Server", "询问是否有草稿");
    data.value = (await client.get("/drafts/record")).data;
    log_api("草稿", "Server => Client", "已加载草稿内容");
  } catch (e) {
    log_api("草稿", "Server => Client", "无草稿");
  }
//  3. 查询小组的全部调查点
  try {
    group_all_points.value = await client.get("/");
  }
})

// // 目标检测相关内容
// socket.on("pipeline_finished", (data) => {
//   console.log(data)
//   log_api("目标检测", "Server => Client", "目标检测完成, 任务ID: " + data.task_id);
// })
//
// socket.on("pipeline_progress", (data) => {
//   console.log(data)
//   log_api("目标检测", "Server => Client", "目标检测进行中, 任务ID: " + data.task_id + ", 进度: " + data.progress + "/" + data.total);
// })
</script>

<style scoped>

</style>
