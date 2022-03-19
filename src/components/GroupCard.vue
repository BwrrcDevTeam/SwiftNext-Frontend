<template>
  <div>
    <n-modal v-model:show="show_edit_positions" preset="card" title="调查点管理" style="max-width: 700px;"
             @close="editing_points=[]">
      <PointedMap v-model:points="editing_points" style="width: 100%;height: 400px;" editable/>
      <n-dynamic-input v-model:value="editing_points" #="{value}" style="margin-top: 20px;" :on-create="create_point">
        <div style="display: flex; align-items: center;width: 100%;">
          <n-input placeholder="调查点名称" v-model:value="value.name" autosize style="margin-right: 10px; width: 100%;">

          </n-input>
          <n-input-number placeholder="经度" v-model:value="value.longitude"
                          style="margin-right: 10px;max-width: 150px;width: 100%;" :step="0.0001" max="180" min="-180">

          </n-input-number>
          <n-input-number placeholder="纬度" v-model:value="value.latitude" :step="0.0001" max="90" min="-90"
                          style="max-width: 150px;width: 100%;">

          </n-input-number>
        </div>
      </n-dynamic-input>
      <template #action>
        <n-button @click="save_points" type="primary">
          保存
        </n-button>
      </template>
    </n-modal>

    <n-modal v-model:show="show_invitation" preset="card" title="创建邀请" style="max-width: 600px;" @close="clean_code">
      <!--    邀请弹窗-->

      <template v-if="invitation_code.length===0">
        <div style="margin-bottom: 20px;">
          <span style="margin-right: 10px;line-height:22px;vertical-align: middle">邀请类型：</span>
          <n-radio-group v-model:value="invitation_type">
            <n-radio value="register">
              注册邀请
            </n-radio>
            <n-radio value="join">
              入组邀请
            </n-radio>
          </n-radio-group>
        </div>
        <div style="margin-bottom: 20px;">
          <span style="margin-right: 10px;line-height:22px;vertical-align: middle">新用户身份：</span>
          <n-radio-group v-model:value="new_user_permission">
            <n-radio :value="1">
              组员
            </n-radio>
            <n-radio :value="2">
              组长
            </n-radio>
          </n-radio-group>
        </div>
        <div style="display: flex;align-items: center;">
          <span style="margin-right: 10px;line-height:22px;vertical-align: middle">邀请有效时间：</span>
          <n-input-number v-model:value="invitation_valid_time" :step="1" :min="1" :max="100" style="width: 100px;">
            <template #suffix>
              天
            </template>
          </n-input-number>
        </div>
      </template>

      <n-collapse-transition :show="invitation_code.length > 0">
        <n-result title="创建成功" description="请保管好您的注册邀请码，系统不会保存它" status="success">
          <template #footer>
            <span style="user-select: all;">{{ invitation_code }}</span>
          </template>
        </n-result>
      </n-collapse-transition>


      <template #action>
        <n-collapse-transition :show="invitation_code.length===0">
          <n-button type="primary" @click="create_invitation">创建</n-button>
        </n-collapse-transition>
        <n-collapse-transition :show="invitation_code.length > 0">
          <n-button type="primary" @click="copy_invitation_code">复制到剪贴板</n-button>
        </n-collapse-transition>
      </template>
    </n-modal>

    <n-skeleton text :repeat="3" v-if="loading">
    </n-skeleton>
    <n-card v-else content-style="padding: 0;" style="height: 100%;">
      <template #cover>
        <div v-if="!manageable">
          <img :src="storage.get_inline_url(group.cover)" v-if="group.hasOwnProperty('cover') && group.cover"
               class="cover-img">
          <div v-else style="height: 300px; width: 100%;" class="mask">
            <PointedMap :points="points" style="height: 300px; width: 100%;" disabled></PointedMap>
          </div>
        </div>
        <div v-else @mouseover="show_edit_cover=true" @mouseleave="show_edit_cover=false">

          <img :src="storage.get_inline_url(group.cover)" v-if="group.hasOwnProperty('cover') && group.cover"
               class="cover-img" :class="{blur: show_edit_cover}">
          <div v-else style="height: 300px; width: 100%;" class="mask">
            <PointedMap :points="points" style="height: 300px; width: 100%;" disabled></PointedMap>
          </div>
          <n-space style="position: absolute;height: 150px;width: 100%;margin-top: -156px;" justify="center"
                   class="cover-operators" :class="{show: show_edit_cover, hide: !show_edit_cover}">
            <n-upload :action="storage.get_upload_url()" accept="image/*" :on-finish="cover_upload_finish"
                      :on-error="cover_upload_error" with-credentials :show-file-list="false">
              <n-button text type="primary">上传</n-button>
            </n-upload>
            <n-button text type="error" @click="delete_cover">删除</n-button>
          </n-space>
        </div>


      </template>
      <template #header>
        <div style="display: flex; justify-content: space-between;align-items: center">
          <n-h1>{{ group.name }}</n-h1>
          <n-button v-if="props.brief" @click="$router.push({name: 'group', params: {id: props.group_id}})">查看详情
          </n-button>
        </div>

      </template>
      <n-list v-if="!props.brief">
        <template #header>
          <n-space justify="space-between">
            <n-h2 style="margin-bottom: 0;margin-left: 19px;">调查点</n-h2>
            <n-button v-if="manageable" @click="edit_points" style="margin-right: 19px;">调查点管理</n-button>
          </n-space>
        </template>
        <n-table>
          <thead>
          <tr>
            <th>调查点名称</th>
            <th>经度</th>
            <th>纬度</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="point in points">
            <td>{{ point.name }}</td>
            <td>{{ point.longitude }}</td>
            <td>{{ point.latitude }}</td>
          </tr>
          </tbody>
        </n-table>
        <n-empty v-if="points.length === 0" style="margin: 30px;">
          还没有调查点
        </n-empty>
      </n-list>
      <n-list v-if="!props.brief">
        <template #header>
          <n-space justify="space-between">
            <div style="display: flex;width: fit-content;">
              <n-h2 style="margin-bottom: 0;margin-left: 19px;">组员</n-h2>
              <!--            <n-input placeholder="搜索" style="margin-left: 10px; width: 130px;"></n-input>-->
            </div>
            <n-button v-if="manageable" @click="show_invitation = true;" style="margin-right: 19px;">创建邀请
            </n-button>
          </n-space>
        </template>
        <UserLine v-for="user in members" :uid="user.id"
                  style="margin-left: 20px;margin-top: 5px;margin-bottom: 5px;"></UserLine>
      </n-list>
      <n-card v-if="members.reduce((last, user) => {return last || user.id===session.user.id}) && (!props.brief)" :bordered="false">
        <template #header>
          <n-divider></n-divider>
          <n-h2>重要操作</n-h2>
        </template>
        <n-popconfirm @positive-click="quit_group">
          <template #trigger>
            <n-button type="error">退出小组</n-button>
          </template>
          一切都将一去杳然
        </n-popconfirm>
        <template v-if="manageable">
          <div style="height: 20px;"></div>
          <n-button type="warning">转让小组</n-button>
          <div style="height: 20px;"></div>
          <n-button type="warning">添加管理员</n-button>
        </template>


      </n-card>
    </n-card>
  </div>
</template>

<script setup>
import {
  NSkeleton,
  NCard,
  NList,
  NSpace,
  NButton,
  NH2,
  NH1,
  NInput,
  NModal,
  NPopconfirm,
  NDivider,
  useNotification,
  NUpload,
  NDynamicInput,
  NInputNumber,
  NEmpty,
  NTable,
  NCollapseTransition,
  NRadio,
  NRadioGroup,
  NResult,
  useMessage
} from "naive-ui";

import {inject, onMounted, ref} from "vue";


import {client, storage} from "../apis";
import PointedMap from "./PointedMap.vue";
import UserLine from "./UserLine.vue";

const t = inject("translate");
const session = inject("session");

const loading = ref(true);

const props = defineProps({
  group_id: {
    type: String,
    required: true,
  },
  // manageable: {
  //   type: Boolean,
  //   default: false,
  // },
  brief: {
    type: Boolean,
    default: false,
  },
})

const group = ref(null);
const points = ref([]);
const members = ref([]);
const manageable = ref(false);

const show_edit_cover = ref(false);

onMounted(async () => {
  try {
    let result = (await client.get("/groups/" + props.group_id)).data
    points.value = (await client.get("/positions/by_group/" + props.group_id)).data.map(p => {
      p.key = p.id;
      return p
    })
    members.value = (await client.get("/groups/" + props.group_id + "/members")).data

    loading.value = false
    group.value = result;
    if (result.managers.includes(session.value.user.id)) {
      manageable.value = true
    }
  } catch (e) {
    console.log(e)
    message.error(t({
      cn: "获取小组信息失败: ",
      en: "Failed to get group info: "
    }) + t(e.response.data.message))
  }

})

const notification = useNotification();

async function quit_group() {
  try {
    let result = await client.delete("/groups/" + props.group_id + "/members/" + session.value.user.id);
    group.value = result.data;
    members.value = (await client.get("/groups/" + props.group_id + "/members")).data;
    notification.success({
      title: "退出小组成功",
      content: "你已经成功退出了小组",
    })
  } catch (e) {
    if (e.response) {
      notification.error({
        title: "退出小组失败",
        content: t(e.response.data.message),
        duration: 3000,
      });
    } else {
      console.error(e)
    }
  }
}

async function cover_upload_finish({file, event}) {
  let file_id = JSON.parse(event.target.response).id;
  group.value = (await client.patch("/groups/" + props.group_id, {
    cover: file_id,
  })).data
}

async function cover_upload_error({file, event}) {
  notification.error({
    title: "上传封面失败",
    content: "请检查网络连接",
  })
}

async function delete_cover() {
  group.value = (await client.patch("/groups/" + props.group_id, {
    cover: null,
  })).data
}

// 调查点管理

const show_edit_positions = ref(false);

const editing_points = ref([]);

const message = useMessage();

async function save_points() {
  try {

    await client.put("/positions/by_group/" + props.group_id, editing_points.value.map(point => {
      return {
        name: point.name,
        longitude: point.longitude,
        latitude: point.latitude,
        group_id: props.group_id,
      }
    }));
    points.value = editing_points.value;
    message.success("保存成功");
    editing_points.value = [];
    show_edit_positions.value = false;
  } catch (e) {
    message.error(t(e.response.data.message))
  }
}

function edit_points() {
  editing_points.value = points.value.map(p => ({
    ...p,
  }))
  show_edit_positions.value = true;
}

function create_point() {
  // 北京的经纬度
  let point = {
    name: '新调查点',
    longitude: 116.407526,
    latitude: 39.90403,
    key: Math.random().toString(36).substr(2, 5),
  };
  editing_points.value.push(point);
  return point
}


// 邀请部分
const show_invitation = ref(false);

const invitation_code = ref("");
const new_user_permission = ref(1);
// 1 | 2
const invitation_valid_time = ref(3);

const invitation_type = ref("register");

function days_to_utc_stamp(days) {
  return Math.floor(Date.now() / 1000) + days * 24 * 60 * 60 + difference_seconds();
}

function difference_seconds() {
  return (new Date()).getTimezoneOffset() * 60
}

function copy_handle(content) {
  let copy = (e) => {
    e.preventDefault()
    e.clipboardData.setData('text/plain', content)
    document.removeEventListener('copy', copy)
  }
  document.addEventListener('copy', copy)
  document.execCommand("Copy");
}

function copy_invitation_code() {
//  复制到剪贴板
  copy_handle(invitation_code.value)
  message.success("复制成功")
}

async function create_invitation() {
  if (invitation_type.value === "register") {
    let result = await client.post("/users/register_invitations", {
      expire_at: days_to_utc_stamp(invitation_valid_time.value),
      group_id: props.group_id,
      permission: new_user_permission.value,
    })
    console.log(result.data.code)
    invitation_code.value = result.data.code;
  } else {
    let result = await client.post("/groups/invitation", {
      expire_at: days_to_utc_stamp(invitation_valid_time.value),
      group_id: props.group_id,
      permission: new_user_permission.value,
    })
    invitation_code.value = result.data.code
  }
}

function clean_code() {
  setTimeout(() => {
    invitation_code.value = "";
  }, 500);
}
</script>

<style scoped>
.mask {
  filter: brightness(0.5);
  pointer-events: none;
}

.cover-operators {
  transition: all .2s ease-in-out;
}

.show {
  backdrop-filter: brightness(0.3);
  opacity: 1;
}

.hide {
  backdrop-filter: brightness(1);
  opacity: 0;
}

.blur {
  filter: blur(5px) brightness(0.5);
}

.cover-img {
  transition: all .2s;
  width: 100%;
  height: 300px;
  object-fit: cover;
}
</style>
