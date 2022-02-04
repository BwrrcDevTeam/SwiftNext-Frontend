<template>
  <SelectPoint :points="group_all_points" style="width: 100%; height: 300px;" v-model:selected="selected_point"></SelectPoint>
  <div style="height: 30px;"></div>
  <n-grid cols="1 800:2">
    <n-grid-item style="padding: 10px;">
      <n-form-item required label="调查点">
        <n-select filterable :options="group_all_points" v-model:value="selected_point" style="max-width: 200px;"></n-select>
      </n-form-item>
      <n-form-item required label="数量">
        <n-input-number min="0" v-model:value="data.num" max="114514" style="max-width: 200px;">

        </n-input-number>
      </n-form-item>
      <n-form-item required label="时间">
        <n-date-picker v-model:value="data.time" style="max-width: 200px;" type="datetime"></n-date-picker>
      </n-form-item>
      <n-form-item label="检测图片">
        <n-upload :action="storage.get_upload_url()" list-type="image-card" v-model:file-list="detect_list" :on-finish="commit_new_detection" with-credentials>

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
    <n-grid-item style="padding: 10px;">
      <n-form-item label="协作者">
        <n-select :options="all_users" multiple v-model:value="collaborators" filterable size="large">

        </n-select>
      </n-form-item>
      <n-form-item label="朝向">
        <Compass v-model:orientation="data.orientation" style="width: 300px; height: 300px;margin:auto;"></Compass>
        <n-button @click="data.orientation = undefined">清空</n-button>
      </n-form-item>

      <n-form-item label="备注">
        <n-input type="textarea" :autosize="{minRows: 3, maxRows: 7}" maxlength="114514" show-count v-model:value="data.description">
        </n-input>
      </n-form-item>
      <n-form-item label="附件">
        <n-upload v-model:file-list="attachments_list" :action="storage.get_upload_url()" @before-upload="check_attachment" :on-remove="delete_attachment" :custom-request="upload_file">
          <n-button>上传文件</n-button>
        </n-upload>
      </n-form-item>
    </n-grid-item>
  </n-grid>
  <n-space justify="space-around">
    <n-button size="large" type="primary" @click="submit">提交填报</n-button>
    <n-button size="large" type="warning" @click="$router.go(-1)">取消填报</n-button>
  </n-space>
</template>

<script setup>
import {
  NSpace,
  NInput,
  NGrid,
  NGridItem,
  NFormItem,
  useNotification,
  NSelect,
  NInputNumber,
  NImage,
  NUpload,
  NCard,
  NSlider,
  NDatePicker,
  NButton,
    NProgress,
  useMessage
} from 'naive-ui'
import {h, inject, onMounted, ref} from "vue";

import {client, log_api, update_session, config, storage} from "../../apis";
import {io} from "socket.io-client";
import SelectPoint from "../../components/SelectPoint.vue";
import {useRouter} from "vue-router";

import Compass from "../../components/Compass.vue";

import SparkMD5 from "spark-md5";

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
  // "specific_location": null, // 具体位置
  num: 0, // 数量
  time: new Date().getTime(), // 时间戳
//  可选字段
  orientation: undefined, // 朝向
  description: "", // 备注
})

const selected_point = ref(null);
const points = ref([])

// log_api("广播", "Client => Server", "开始连接");
// const socket = new WebSocket(config.socket);
//
//
// socket.onopen = () => {
//   log_api("广播", "Client => Server", "连接成功");
// }


const group_all_points = ref([]);

const notification = useNotification();
const router = useRouter();
const login = inject("login");

//协作者相关内容
const all_users = ref([]);
const temp_user = ref(null);
const collaborators = ref([]);

// 附件列表
const attachments_list = ref([]);



function check_attachment({file, file_list}) {
  // 最大附件大小为200M
  let max_size = 200 * 1024 * 1024;
  if (file.file.size > max_size) {
    message.error("单个附件大小不能超过 200M !");
    return false;
  }
  return true;
}

async function delete_attachment({file, file_list}) {
  if (file.status === 'finished') {
    try {
      await storage.delete_file(file.fid);
      return true;
    } catch (e) {
      message.error("删除附件失败，请重试");
      return false;
    }
  }
  return true;
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
        value: user.uid
      })
    })
    log_api("用户", "Server => Client", "已加载 "+all_users.value.length + " 个用户")
  } catch (e) {

  }
})

const compute_method = ref('max')
const thresh = ref(0.3);

// 目标检测相关内容
const detection_results = ref({

})

function commit_new_detection({file, event}) {
  let response = JSON.parse(event.target.response)
  let fid = response.id
  file.fid = fid
  file.url = storage.get_inline_url(fid)
  //
  let n_ref = ref(null);
  n_ref.value = notification.create({
    title: "识别任务状态",
    content: "排队中..."
  })
  let ws = new WebSocket(config.socket + "detector/task/ws");
  ws.onopen = () => {
  //  双工连接打开后，发送检测请求
    ws.send(JSON.stringify({
      attachment: fid
    }))
    n_ref.value.content = "请求已发送"
  }

  ws.onmessage = (event) => {
    let data = JSON.parse(event.data);
    switch (data.status) {
      case "processing":
        if (data.current && data.total) {
          let percentage = Math.ceil((data.current / data.total) * 100);
          console.log("更新进度", percentage)
          n_ref.value.content = () => h(
              NProgress,
              {
                percentage,
                processing: true
              }
          )
        } else {
          n_ref.value.content = () => h(
              NProgress,
              {
                percentage: 0,
                processing: true
              }
          )
        }
        break;
      case "finished":
        n_ref.value.destroy();
        notification.success({
          title: "识别任务状态",
          content: "任务已完成!",
          duration: 3000
        })
        detection_results.value[data.task_id] = data.result;
        console.log("任务完成")
        break;
    }
  }
}

function upload_file({file, data, headers, action, onFinish, onError, onProgress}) {
  const form_data = new FormData();
  const reader = new FileReader();

  reader.readAsBinaryString(file.file);
  reader.onload = async e => {
    const md5 = SparkMD5.hashBinary(e.target.result);
    try {
      let result = await client.post("/storage/link", {
        md5,
        name: file.name
      })
      file.url = storage.get_download_url(result.data.id)
      file.fid = result.data.id
      onFinish(result.data)
    } catch (e) {
      if (e.response && e.response.data.code===1001) {
        form_data.append("file", file.file);
        // form_data.append(file.name, file.file);
        try {
          let result = await client.post("/storage", form_data, {
            onUploadProgress: ({loaded, total}) => {
              onProgress({ percent: Math.ceil((loaded / total) * 100) })
            }
          });
          file.url = storage.get_download_url(result.data.id)
          file.fid = result.data.id
          onFinish(result.data)

        } catch (e) {
          if (e.response) {
            message.error(t(e.response.data.message))
          }
          onError(e)
        }
      } else {
        console.error(e)
      }

    }
  }

}

const message = useMessage();
function evaluate() {
  // 计算出表单，并加以验证
  let form = {
    group_id: session.value.user.groups[0],
    num: data.value.num,
    position: selected_point.value,
    time: data.value.time
  }
  if (form.num < 0) {
    message.error("雨燕数量不合法!")
    return false;
  }
  if (!form.position) {
    message.error("请选择一个调查点!")
    return false;
  }
  if (collaborators.value.length > 0) {
    form.collaborators = collaborators.value.map(sth => sth);
  }
  if (data.value.description.length > 0) {
    form.description = data.value.description
  }
  if (data.value.orientation !== undefined) {
    form.orientation = data.value.orientation
  }
  if (attachments_list.value.length > 0) {
    form.attachments = attachments_list.value.map(file => file.fid)
  }
  if (form.time === undefined) {
    message.error("请指定一个时间!")
  }
  if (form.time > new Date().getTime()) {
    message.error("不能选择未来的时间点!")
  }
  form.time = form.time + (new Date(form.time).getTimezoneOffset())

  return form;
}


async function submit() {
  let form = evaluate();
  console.log(form);
}
</script>

<style scoped>

</style>
