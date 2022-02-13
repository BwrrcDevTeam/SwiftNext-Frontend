<template>
  <n-modal v-model:show="new_project" preset="card" class="modal" style="max-width: 400px;" title="创建调查项目" @close="clean_form">
    <n-form-item label="项目标题" :feedback="form_feedback.title" :show-feedback="form_feedback.title!==undefined" :validation-status="form_feedback.title?'error':''">
      <n-input v-model:value="new_form.title" placeholder="项目标题" style="width: 100%"></n-input>
    </n-form-item>
    <br>
    <n-form-item label="项目开始于" :feedback="form_feedback.start_time" :show-feedback="form_feedback.start_time!==undefined" :validation-status="form_feedback.start_time?'error':''">
      <n-date-picker type="date" v-model:value="new_form.start_time" style="width: 100%">
      </n-date-picker>
    </n-form-item>
    <br>
    <n-form-item label="项目持续周数">
      <n-input-number max="20" min="10" v-model:value="new_form.duration" style="width: 100%"></n-input-number>
    </n-form-item>
    <n-form-item label="运行状态">
      <n-switch v-model:value="new_form.running"></n-switch>
    </n-form-item>
    <template #action>
      <n-button @click="submit">创建</n-button>
    </template>
  </n-modal>
  <n-empty description="还没有创建任何项目" v-if="projects.length===0">
    <template #extra>
      <n-button @click="new_project=true;">
        创建一个
      </n-button>
    </template>

  </n-empty>
  <template v-else>
    <n-button style="margin-bottom: 20px;width: 100%;" @click="new_project=true;">创建新的项目</n-button>
    <br>
    <n-timeline>
  <!--    v - for 项目-->
      <n-timeline-item v-for="project in projects" :title="project.title" :time="new Date(project.start_time).toLocaleDateString()" :type="project.running? 'success': 'default'">
        <template #default>
          <n-button text type="info" @click="edit_project(project)">
            编辑
          </n-button>
          <n-popconfirm :negative-text="null" @positive-click="delete_project(project)">
            <template #trigger>
              <n-button text type="error" style="margin-left: 5px;">
                删除
              </n-button>
            </template>
            确定要删除这个项目吗？
          </n-popconfirm>

        </template>

      </n-timeline-item>
    </n-timeline>
  </template>
  <n-modal :show="show_edit" preset="card" @close="clean_edit" style="max-width: 400px;" title="编辑调查项目">
    <n-form-item label="项目标题" :feedback="edit_feedback.title" :show-feedback="edit_feedback.title!==undefined" :validation-status="edit_feedback.title?'error':''">
      <n-input v-model:value="on_editing_project.title" placeholder="项目标题" style="width: 100%"></n-input>
    </n-form-item>
    <br>
    <n-form-item label="项目开始于" :feedback="edit_feedback.start_time" :show-feedback="edit_feedback.start_time!==undefined" :validation-status="edit_feedback.start_time?'error':''">
      <n-date-picker type="date" v-model:value="on_editing_project.start_time" style="width: 100%">
      </n-date-picker>
    </n-form-item>
    <br>
    <n-form-item label="项目持续周数">
      <n-input-number max="20" min="10" v-model:value="on_editing_project.duration" style="width: 100%"></n-input-number>
    </n-form-item>
    <n-form-item label="运行状态">
      <n-switch v-model:value="on_editing_project.running"></n-switch>
    </n-form-item>
    <template #action>
      <n-button @click="submit_edit" type="primary">确定</n-button>
    </template>
  </n-modal>
</template>

<script setup>
import {
  NTimeline,
  NTimelineItem,
  NEmpty,
  NButton,
  NModal,
  NFormItem,
  NInput,
  NDatePicker,
  NInputNumber,
  NSwitch,
    NPopconfirm,
  useMessage
} from "naive-ui";
import {onMounted, reactive, ref} from "vue";

import {time_to_db, time_from_db} from "../../utils";

import {client} from "../../apis"

const projects = ref([]);

const new_form = reactive({
  title: undefined,
  start_time: undefined,
  running: true,
  duration: 18,
})
const form_feedback = reactive({
  title: undefined,
  start_time: undefined,
})

const new_project = ref(false);

function clean_form() {
  new_form.title = undefined;
  new_form.start_time = undefined;
  new_form.running = true;
  new_form.duration = 18;
  form_feedback.title = undefined;
  form_feedback.start_time = undefined;
}


const message = useMessage();

async function submit() {
  let error = false;
  if ((!new_form.title) || new_form.title.length === 0) {
    form_feedback.title = "请输入项目标题";
    error = true;
  } else if (new_form.title.length > 20) {
    form_feedback.title = "项目标题不能超过20个字符";
    error = true;
  }
  if (new_form.start_time === undefined) {
    form_feedback.start_time = "请选择项目开始时间";
    error = true;
  }
  if (error) {
    return;
  } else {
    form_feedback.start_time = undefined;
    form_feedback.title = undefined;
  }
  // 将本地时间转换为UTC时间戳
  let utc_stamp = time_to_db(new_form.start_time);
  let form = {
    title: new_form.title,
    start_time: utc_stamp,
    running: new_form.running,
    duration: new_form.duration,
  }
  try {
    let result = await client.post("/projects", form);
    message.success("项目创建成功");
    let proj_id = result.data.id;
    projects.value.push((await client.get("/projects/" + proj_id)).data);
    new_project.value = false;
  } catch (e) {
    message.error("项目创建失败");
    console.log(e);
  }
}

async function load_projects() {
  const _projects = await client.get("/projects");
  projects.value = _projects.data.map(proj => {
    // 导入的时候转成本地时间
    proj.start_time = time_from_db(proj.start_time).getTime();
    return proj;
  });
  console.log(projects);
}

onMounted(load_projects);


// 编辑项目部分

const show_edit = ref(false);
const on_editing_project = ref(false);

const edit_feedback = reactive({
  title: undefined,
  start_time: undefined,
})

function edit_project(project) {
  show_edit.value = true;
  on_editing_project.value = {
    id: project.id,
    title: project.title,
    start_time: project.start_time,
    running: project.running,
    duration: project.duration,
  }
}

function clean_edit() {
  show_edit.value = false;
  on_editing_project.value = false;
  edit_feedback.title = undefined;
  edit_feedback.start_time = undefined;
}

async function submit_edit() {
  if (on_editing_project.value.title.length === 0) {
    edit_feedback.title = "请输入项目标题";
    return;
  } else if (on_editing_project.value.title.length > 20) {
    edit_feedback.title = "项目标题不能超过20个字符";
    return;
  }
  if (on_editing_project.value.start_time === undefined) {
    edit_feedback.start_time = "请选择项目开始时间";
    return;
  }
  let utc_stamp = time_to_db(on_editing_project.value.start_time);
  let form = {
    title: on_editing_project.value.title,
    start_time: utc_stamp,
    running: on_editing_project.value.running,
    duration: on_editing_project.value.duration,
  }
  try {
    let result = await client.patch("/projects/"+on_editing_project.value.id, form);
    await load_projects();
    message.success("编辑成功");
    show_edit.value = false;
    clean_edit();
  } catch (e) {
    message.error("编辑失败")
  }
}

async function delete_project(project) {
  try {
    await client.delete("/projects/"+project.id);
    await load_projects();
    message.success("删除成功");
  } catch (e) {
    console.error(e);
    message.error("删除失败");
  }
}
</script>

<style scoped>
  .modal {
    max-width: 500px;
  }
</style>
