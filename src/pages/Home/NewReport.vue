<template>
  <SelectPoint :points="group_all_points" style="width: 100%; height: 300px;" v-model:selected="selected_point"></SelectPoint>
  <div style="height: 30px;"></div>
  <n-grid cols="1 800:2">
    <n-grid-item>
      <n-form-item required label="调查点">
        <n-select filterable :options="group_all_points" v-model:value="selected_point" style="max-width: 200px;"></n-select>
      </n-form-item>
      <n-form-item required label="数量">
        <n-input-number min="0" v-model:value="data.num" max="114514">

        </n-input-number>
      </n-form-item>
      <n-form-item label="检测图片">
        <n-upload :action="storage.get_upload_url()" list-type="image-card" v-model:file-list="detect_list">

        </n-upload>
      </n-form-item>
      <n-card title="检测设置">
        <n-form-item label="最终结果计算方式">
          <n-select :options="[{value: 'max', label: '多张取最大值'}, {value: 'sum', label: '多张总和'}]" v-model:value="compute_method">
          </n-select>
        </n-form-item>
        <n-form-item label="置信度">
          <n-slider v-model:value="thresh" :min="0" :max="1" :step="0.01">
          </n-slider>

        </n-form-item>
        <n-input-number min="0" max="1" step="0.01" v-model:value="thresh">
        </n-input-number>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-form-item label="协作者">
        <n-dynamic-input v-model:value="collaborators" #="{value}" :on-create="() => {return {user: null}}">
          <n-select :options="all_users" filterable v-model:value="value.user" :on-update:value="check_collaborators">
          </n-select>
        </n-dynamic-input>
      </n-form-item>
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import {NForm, NInput, NGrid, NGridItem, NFormItem, useNotification, NSelect, NInputNumber, NImage, NUpload, NCard, NSlider, NDynamicInput, NMention} from 'naive-ui'
import {inject, onMounted, ref} from "vue";

import {client, log_api, update_session, config, storage} from "../../apis";
import {io} from "socket.io-client";
import SelectPoint from "../../components/SelectPoint.vue";
import {useRouter} from "vue-router";

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
  num: 0, // 数量
})

const selected_point = ref(null);
const points = ref([])

// log_api("广播", "Client => Server", "开始连接");
// const socket = io(config.socket);
//
// socket.io.on("open", () => {
//   log_api("广播", "Client => Server", "连接成功");
// });
const group_all_points = ref([]);

const notification = useNotification();
const router = useRouter();
const login = inject("login");

//协作者相关内容
const all_users = ref([]);
const temp_user = ref(null);
const collaborators = ref([]);

function check_collaborators() {
// 执行去重
  let keep = [];
  let uids = collaborators.value.map(item => item.user.uid);
  let keep_uids = [...new Set(uids)];
  let keep_index = keep_uids.map(uid => uids.indexOf(uid));
  console.log(temp)
  collaborators.value = temp;
}
// 初始化
onMounted(async () => {
//  在挂载后，1.检查用户各项属性
  try {
    session.value = await update_session();
    // 检查用户是否已经登录
    if (!session.value.login) {
      await login();
    }
    // 检查用户有没有调查小组
    if (!session.value.user.groups || session.value.user.groups.length === 0) {
      notification.error({
        title: "错误",
        content: "您还没有调查小组，请联系小组长获取入组邀请!",
        duration: 3000,
      })
      await router.push({name: 'home_group'})
    }
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
    log_api("小组调查点", "Client => Server", "询问小组调查点");
    let points = (await client.get("/positions/by_group/" + session.value.user.groups[0])).data;
    points.forEach(point => {
      group_all_points.value.push({
        name: point.name,
        longitude: point.longitude,
        latitude: point.latitude,
        key: point.id,
        label: point.name,
        value: point.id,
      })
    });
    log_api("小组调查点", "Server => Client", "已加载 " + group_all_points.value.length + " 个调查点");
    console.log(group_all_points.value);
  } catch (e) {
    log_api("小组调查点", "Server => Client", "无调查点");
  }
//  4. 获取全部用户
  try {
    log_api("用户", "Client => Server", "获取全部用户")
    let result = (await client.get("/users")).data
    result.forEach(user => {
      all_users.value.push({
        name: user.name,
        uid: user.uid,
        label: user.name,
        value: user.name
      })
    })
    log_api("用户", "Server => Client", "已加载 "+all_users.value.length + " 个用户")
  } catch (e) {

  }
})

const compute_method = ref('max')
const thresh = ref(0.3);

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
