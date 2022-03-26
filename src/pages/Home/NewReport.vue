<template>
  <SelectPoint :points="available_points" style="width: 100%; height: 300px;"
               v-model:selected="selected_point"></SelectPoint>
  <div style="height: 30px;"></div>


  <n-grid cols="1 800:2">
    <n-grid-item style="padding: 10px;">
      <n-h3>必填项</n-h3>
      <n-form-item required label="调查点">
        <n-tree-select check-strategy="child" filterable :options="points" v-model:value="selected_point"
                       style="width: 100%;"/>
      </n-form-item>
      <n-form-item required label="数量">
        <n-input-number min="0" v-model:value="data.num" max="114514" style="width: 100%;">

        </n-input-number>
      </n-form-item>
      <n-form-item required label="天气">
        <n-input v-model:value="data.weather">
        </n-input>
      </n-form-item>
      <n-form-item required label="时间">
        <n-date-picker v-model:value="data.time" style="width: 100%;" type="datetime"></n-date-picker>
      </n-form-item>
    </n-grid-item>
    <n-grid-item style="padding: 10px;">
      <n-h3>选填项</n-h3>
      <n-form-item label="协作者">
        <n-select :options="all_users" multiple v-model:value="collaborators" filterable size="large"
                  style="width: 100%">

        </n-select>
      </n-form-item>
      <n-form-item label="巢址数量">
        <n-input-number v-model:value="data.num_of_nests" min="0" style="width: 100%;"/>
      </n-form-item>
      <n-form-item label="巢址高度">
        <n-input-number v-model:value="data.nest_height" min="0" style="width: 100%;"/>
      </n-form-item>
      <n-form-item label="巢址材料">
        <n-input v-model:value="data.nest_material">
        </n-input>
      </n-form-item>
      <n-form-item label="巢址面积">
        <n-input-number v-model:value="data.nest_area" min="0" style="width: 100%;"/>
      </n-form-item>
      <n-form-item label="返回时间">
        <n-time-picker v-model:formatted-value="data.return_time" style="width: 100%;"></n-time-picker>
      </n-form-item>
      <n-form-item label="返回方向">
        <n-input v-model:value="data.return_direction"></n-input>
      </n-form-item>
      <n-form-item label="备注">
        <n-input type="textarea" :autosize="{minRows: 3, maxRows: 7}" maxlength="114514" show-count
                 v-model:value="data.description" style="width: 100%">
        </n-input>
      </n-form-item>
      <n-form-item label="附件">
        <n-upload v-model:file-list="attachments_list" :action="storage.get_upload_url()"
                  @before-upload="check_attachment" :on-remove="delete_attachment" @finish="upload_finish">
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
  NButton,
  NH3,
  NDatePicker,
  NFormItem,
  NGrid,
  NGridItem,
  NInput,
  NInputNumber,
  NTreeSelect,
  NSelect,
  NSpace,
    NTimePicker,
    NUpload,
  useMessage,
  useNotification
} from 'naive-ui'
import {h, inject, onMounted, ref, watch} from "vue";
import {client, config, log_api, storage, update_session} from "../../apis";
import {useRouter} from "vue-router";

// 外部组件
import SelectPoint from "../../components/SelectPoint.vue";
import Compass from "../../components/Compass.vue";
import Detection from "../../components/Detection.vue";

import SparkMD5 from "spark-md5";
import {time_from_db, time_to_db} from "../../utils";


const t = inject("translate");

const session = inject("session");
const handle_crucial_error = inject("handle_crucial_error");


// 填报数据
const data = ref({
  // 必备字段
  "position": null, // 调查点的ID
  // "specific_location": null, // 具体位置
  num: undefined, // 数量
  time: new Date().getTime(), // 时间戳
//  可选字段
  description: "", // 备注
  return_time: undefined, // 返回时间
  nest_height: undefined,
  nest_area: undefined,
  nest_material: undefined,
  num_of_nests: undefined,
  weather: undefined,
  return_direction: undefined,
})

const selected_point = ref(null);
const points = ref([]);
const available_points = ref([]);


const notification = useNotification();
const router = useRouter();
const login = inject("login");

//协作者相关内容
const all_users = ref([]);
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
      return;
    }
  } catch (e) {
    //  这个错误我接不了(
    handle_crucial_error(e);
  }
//  2. 询问有无草稿
  try {
    log_api("草稿", "Client => Server", "询问是否有草稿");
    let draft = (await client.get("/drafts/record")).data;
    if (draft.time === 0) {
      draft.time = undefined
    } else {
      draft.time = time_from_db(draft.time).getTime();
    }

    if (draft.position) {
      selected_point.value = draft.position
    }
    if (draft.collaborators) {
      collaborators.value = draft.collaborators
    }

    if (draft.attachments) {
      for (const attachment of draft.attachments) {
        let resp = (await client.get("/storage/" + attachment)).data;
        attachments_list.value.push({
          name: resp.filename,
          fid: resp.id,
          key: resp.id
        })
      }
    }

    data.value = draft;

    console.log(draft)
    log_api("草稿", "Server => Client", "已加载草稿内容");

  } catch (e) {
    log_api("草稿", "Server => Client", "无草稿");
  }
//  3. 查询小组的全部调查点
  try {
    log_api("调查点", "Client => Server", "询问调查点");

    available_points.value = (await client.get("/positions/available")).data;
    available_points.value = available_points.value.map(point => {
      return {
        label: point.name,
        key: point.id,
        belongs_to: point.belongs_to,
        longitude: point.longitude,
        latitude: point.latitude,
        name: point.name,
        id: point.id
      }
    })
    session.value.user.groups.forEach(group_id => {
      client.get("/groups/" + group_id).then((resp) => {
        let children = [];
        available_points.value.forEach(point => {
          if (point.belongs_to === group_id) {
            children.push({
              label: point.name,
              key: point.id
            })
          }
        })
        points.value.push({
          label: resp.data.name,
          key: group_id,
          children
        })
      })
    })
    log_api("调查点", "Server => Client", "已加载 " + available_points.length + " 个调查点");
  } catch (e) {
    log_api("小组调查点", "Server => Client", "无调查点");
  }
//  4. 获取全部用户
  try {
    log_api("用户", "Client => Server", "获取全部用户")
    let result = (await client.get("/users")).data
    result.forEach(user => {
      if (user.id !== session.value.user.id) {
        all_users.value.push({
          name: user.name,
          id: user.id,
          label: user.name,
          value: user.id
        })
      }

    })
    log_api("用户", "Server => Client", "已加载 " + all_users.value.length + " 个用户")
  } catch (e) {

  }
})


const message = useMessage();

function upload_finish({file, event}) {
  message.success("文件上传成功");
  let resp = JSON.parse(event.target.response);
  // console.log(resp)
  file.url = storage.get_download_url(resp.id);
  file.name = resp.filename;
  file.fid = resp.id;
}

// 校验表单
function evaluate(show_error = false) {
  // 计算出表单，并加以验证
  let form = {
    // group: selected_point.value.belongs_to,
    num: data.value.num,
    position: selected_point.value,
    time: data.value.time,
    nest_area: data.value.nest_area,
    nest_height: data.value.nest_height,
    nest_material: data.value.nest_material,
    return_time: data.value.return_time,
    return_direction: data.value.return_direction,
    weather: data.value.weather,
    num_of_nests: data.value.num_of_nests,
  }
  let errored = false;
  if (form.num < 0 && show_error) {
    message.error("雨燕数量不合法!")
    form.num = undefined
    errored = true;
  }
  if (!form.position && show_error) {
    message.error("请选择一个调查点!")
    form.position = undefined
    errored = true;

  }
  if (collaborators.value.length > 0) {
    form.collaborators = collaborators.value.map(sth => sth);
  }
  if (data.value.description && data.value.description.length > 0) {
    form.description = data.value.description
  }
  if (attachments_list.value.length > 0) {
    form.attachments = attachments_list.value.map(file => file.fid)
  }
  if (form.time === undefined && show_error) {
    message.error("请指定一个时间!")
    errored = true;
  }
  if (form.time > new Date().getTime() && show_error) {
    message.error("不能选择未来的时间点!")
    form.time = undefined;
    errored = true;
  }
  console.log(form.time)
  form.time = time_to_db(form.time);
  // console.log(form);
  return {form, errored};
}

let have_update = false;

async function update_draft(_) {
  if (!have_update) {
    return
  }
  have_update = false;
  let {form, errored} = evaluate(false);
  let msg = message.loading("正在更新草稿...");
  try {
    await client.patch("/drafts/record", form);
    msg.type = "success";
    msg.content = "草稿已更新!";
    setTimeout(() => msg.destroy(), 3000);
  } catch (e) {
    msg.type = "error";
    msg.content = "草稿更新失败";
    setTimeout(() => msg.destroy(), 3000)
  }
}

let deleting_draft = false;

async function delete_draft() {
  let msg = message.loading("正在删除草稿...");
  try {
    await client.delete("/drafts/record");
    msg.type = "success";
    msg.content = "草稿已删除!";
    setTimeout(() => msg.destroy(), 3000);
  } catch (e) {
    msg.type = "error";
    msg.content = "草稿删除失败";
    setTimeout(() => msg.destroy(), 3000)
  }
}


const reload = inject("reload");

async function submit() {
  let {form, errored} = evaluate(true);
  if (errored) {
    return
  }
  try {
    let result = await client.post("/records", form);
    notification.success({
      title: "提交成功!",
      description: "调查报告已提交!",
      duration: 3000
    })
    update_draft = () => {
    };
    await delete_draft();
    await router.push({name: "home_reports"});
  } catch (e) {
    if (e.response) {
      message.error(t(e.response.data.message))
    }
  }
}

watch(() => {
  return data.value
}, () => {
  have_update = true
}, {deep: true})

watch(selected_point, () => {
  have_update = true
})

setInterval(update_draft, 5000)

</script>

<style scoped>

</style>
