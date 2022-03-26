<template>
  <n-modal v-model:show="is_deleting" preset="dialog" title="确认删除" content="系统不会保留任何数据，操作无法撤销" positive-text="确认"
           negative-text="取消" @positive-click="confirm_delete">
  </n-modal>
  <n-modal v-model:show="is_editing" preset="card" title="编辑填报" style="max-width: 1000px;">
    <n-grid cols="1 800:2">
      <n-grid-item style="padding: 10px;">
        <n-form-item label="调查点" required>
          <n-tree-select check-strategy="child" filterable :options="points" v-model:value="data.position"
                         style="width: 100%;"/>
        </n-form-item>
        <n-form-item label="数量" required>
          <n-input-number min="0" v-model:value="data.num" max="114514" style="width: 100%;"/>
        </n-form-item>
        <n-form-item label="时间" required>
          <n-date-picker v-model:value="data.time" style="width: 100%;" type="datetime"></n-date-picker>
        </n-form-item>
        <n-form-item label="协作者">
          <n-select :options="all_users" multiple v-model:value="data.collaborators" filterable size="large"
                    style="width: 100%"/>
        </n-form-item>
        <n-form-item required label="天气">
          <n-input v-model:value="data.weather">
          </n-input>
        </n-form-item>
      </n-grid-item>
      <n-grid-item style="padding: 10px;">

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
                   v-model:value="data.description" style="width: 100%;"/>
        </n-form-item>
        <n-form-item label="附件">
          <n-upload v-model:file-list="data.attachments_list" :action="storage.get_upload_url()"
                    @before-upload="check_attachment" :on-remove="delete_attachment" @finish="upload_finish">
            <n-button>上传文件</n-button>
          </n-upload>
        </n-form-item>

      </n-grid-item>
    </n-grid>

    <template #action>
      <div style="display: flex; justify-content: space-between">
        <n-button type="primary" @click="submit">保存</n-button>
        <n-button @click="is_editing = false;">取消</n-button>
      </div>

    </template>
  </n-modal>
  <div
      style="display: flex;justify-content: center;width: 100%; height: 200px;align-content: center;flex-direction: column"
      v-if="my_records.length === 0 && engaged.length===0">
    <n-empty size="huge" style="height: fit-content;">
    </n-empty>
  </div>
  <n-card title="我创建的填报" v-if="my_records.length > 0">
    <n-data-table :columns="columns" :data="my_records" style="width: 100%;">
    </n-data-table>
  </n-card>

  <n-card title="我参与的填报" v-if="engaged.length > 0">
    <n-data-table :columns="columns" :data="engaged" style="width: 100%;">
    </n-data-table>
  </n-card>

</template>

<script setup>
import {computed, h, inject, onMounted, ref} from "vue";
import {client, log_api, records} from "../apis"
import {
  NDataTable,
  NEmpty,
  NCard,
  NButton,
  NModal,
  NGrid,
  NGridItem,
  NTimePicker,
  useMessage,
  NFormItem,
  NTreeSelect,
  NInputNumber,
  NDatePicker,
  NInput,
  NSelect,
    NUpload
} from "naive-ui";
import {time_to_db, time_from_db} from "../utils";

import {storage} from "../apis";


const my_records = ref([]);
const engaged = ref([]);
const t = inject("translate");

const session = inject("session");


const editing = ref(false);

async function format_records(records) {
  return await Promise.all(records.map(async record => {
    return {
      ...record,
      create_time: time_from_db(record.time).toLocaleString(),
      project_name: project_names[record.project],
      position_name: await get_position_name(record.position),
    }
  }));
}

let project_names = {};

async function get_project_names() {
  let projects = (await client.get("/projects")).data;
  projects.forEach(project => {
    project_names[project.id] = project.title;
  });
}

async function get_position_name(position_id) {
  let position = (await client.get("/positions/" + position_id)).data;
  return position.name;
}

const message = useMessage();


onMounted(async () => {
  await get_project_names();
  try {
    let data = (await client.get("/records?user=" + session.value.user.id)).data;
    my_records.value = await format_records(data);
    data = (await client.get("/records?engaged=" + session.value.user.id)).data;
    engaged.value = await format_records(data);
  } catch (e) {
    message.error(t({cn: "加载历史填报失败: ", en: "Fail to load history records: "}) + t(e.response.data.message))
  }
  try {
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
  } catch (e) {

  }

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

});

function get_user_name(uid) {
  let user = all_users.value.find(user => user.id === uid);
  if (user) {
    return user.name;
  }
  return "";
}

const columns = [
  {
    title: "项目",
    key: "project_name",
  },
  {
    title: "填报时间",
    key: "create_time"
  },
  {
    title: "位于",
    key: "position_name"
  },
  {
    title: "数量",
    key: "num"
  },
  {
    title: "操作",
    key: "actions",
    render(row) {
      return [
        h(
            NButton,
            {
              size: "small",
              type: "primary",
              onClick: async () => {
                is_editing.value = true;
                editing.value = row.id;
                data.value = Object.assign({}, row);
                data.value.time = time_from_db(data.value.time).getTime();
                data.value.attachments_list = [];
                console.log(row.attachments)
                for (const attachment of row.attachments) {
                  let resp = (await client.get("/storage/" + attachment)).data;
                  data.value.attachments_list.push({
                    name: resp.filename,
                    url: storage.get_download_url(resp.id),
                    fid: resp.id,
                    key: resp.id
                  });
                }
                // data.value.collaborators = data.value.collaborators.map(user => {
                //   return get_user_name(user);
                // });
              }
            },

            () => "编辑",
        ),
        h(
            NButton,
            {
              size: "small",
              type: "error",
              style: "margin-left: 10px",
              onClick: () => {
                is_deleting.value = true;
                deleting.value = row.id;
              }
            },
            () => "删除",
        )
      ]
    }
  }
]


const is_editing = ref(false);
const is_deleting = ref(false);
const deleting = ref(false);

async function confirm_delete() {
  if (deleting.value) {
    let sth = await client.delete("/records/" + deleting.value);
    deleting.value = false;
    await get_project_names();

    let data = (await client.get("/records?user=" + session.value.user.id)).data;
    my_records.value = await format_records(data);
    data = (await client.get("/records?engaged=" + session.value.user.id)).data;
    engaged.value = await format_records(data);
  }
}


// 编辑内容

const points = ref([]);
const available_points = ref([]);
const data = ref({});
const all_users = ref([]);

async function submit() {
  let form = {
    num: data.value.num,
    position: data.value.position,
    time: time_to_db(data.value.time),
    description: data.value.description,
    collaborators: data.value.collaborators,
    nest_area: data.value.nest_area,
    nest_height: data.value.nest_height,
    nest_material: data.value.nest_material,
    return_time: data.value.return_time,
    return_direction: data.value.return_direction,
    weather: data.value.weather,
    num_of_nests: data.value.num_of_nests,
    attachments: data.value.attachments_list.map(attachment => attachment.fid),
  }
  if (form.num < 0) {
    message.error("雨燕数量不能小于0");
  }
  if (!form.position) {
    message.error("请选择调查点");
  }
  if (!form.time) {
    message.error("请选择填报时间");
  }
  let resp = (await client.patch("/records/" + editing.value, form)).data;
  my_records.value = await Promise.all(my_records.value.map(async record => {
    if (record.id === editing.value) {
      return (await format_records([resp]))[0];
    }
    return record;
  }));

  engaged.value = await Promise.all(engaged.value.map(async record => {
    if (record.id === editing.value) {
      return (await format_records([resp]))[0];
    }
    return record;
  }));
  editing.value = false;
  is_editing.value = false;
  message.success("修改成功");
}

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

function upload_finish({file, event}) {
  message.success("文件上传成功");
  let resp = JSON.parse(event.target.response);
  // console.log(resp)
  file.url = storage.get_download_url(resp.id);
  file.name = resp.filename;
  file.fid = resp.id;
}


</script>

<style scoped>

</style>
