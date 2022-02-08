<template>
<!--  加入小组模态框-->
  <n-modal v-model:show="show_join_group" preset="card" style="max-width: 400px;">
    <template #header>
      加入调查小组
    </template>
    <n-text depth="3">加入调查小组需要小组长提供的邀请码！</n-text>
    <n-form-item :feedback="invitation_feedback.message" :validation-status="invitation_feedback.status" >
      <n-input placeholder="邀请码" v-model:value="invitation_code" @keydown.enter="join_group"></n-input>
    </n-form-item>
    <template #action>
      <n-space justify="space-between">
        <n-button @click="check_invitation">
          检查邀请码
        </n-button>
        <n-button type="info" @click="join_group">
          加入小组
        </n-button>
      </n-space>
    </template>
  </n-modal>
  <n-card :title="t(strings.joined)">
    <template #header-extra>
      <n-button secondary type="primary" @click="show_join_group=true">
        {{t(strings.join)}}
      </n-button>
    </template>
<!--    已加入的小组-->
    <n-alert type="warning" v-if="!session.user.group" :title="t(strings.no_group.title)" class="clickable" @click="show_join_group=true">
      <template #icon>
        <n-icon>
          <GroupOffOutlined/>
        </n-icon>
      </template>
      {{ t(strings.no_group.description) }}
    </n-alert>
    <GroupCard v-else :group_id="session.user.group">

    </GroupCard>

  </n-card>
<!--  创建小组模态框-->
  <n-modal v-model:show="show_create_group" preset="card" style="max-width: 600px;" v-if="session.permission > 1">
    <template #header>
      创建调查小组
    </template>
    <PointedMap editable v-model:points="create_form.points" style="height: 300px;width: 100%;">

    </PointedMap>

    <n-dynamic-input v-model:value="create_form.points" #="{value}" style="margin-top: 20px;" :on-create="create_point">
      <div style="display: flex; align-items: center;width: 100%;">
        <n-input placeholder="调查点名称" v-model:value="value.name" autosize style="margin-right: 10px; width: 100%;">

        </n-input>
        <n-input-number placeholder="经度" v-model:value="value.longitude" style="margin-right: 10px;max-width: 150px;width: 100%;" :step="0.0001" max="180" min="-180">

        </n-input-number>
        <n-input-number placeholder="纬度" v-model:value="value.latitude" :step="0.0001" max="90" min="-90" style="max-width: 150px;width: 100%;">

        </n-input-number>
      </div>
    </n-dynamic-input>

    <n-form-item :feedback="create_form_feedback.name.message" :validation-status="create_form_feedback.name.status" >
      <n-input placeholder="小组名称" v-model:value="create_form.name" minlength="3" maxlength="10"></n-input>
    </n-form-item>
    <template #action>
      <n-space justify="space-between">
        <n-button @click="create_and_join_group" type="primary">
          创建小组
        </n-button>
        <n-button type="default" @click="show_create_group = false">
          取消
        </n-button>
      </n-space>
    </template>
  </n-modal>
  <n-card :title="t(strings.managed)" style="margin-top: 20px;">
    <template #header-extra>
      <n-button secondary type="primary" @click="show_create_group=true">
          {{t(strings.create)}}
      </n-button>
    </template>
<!--    管理的小组-->
    <n-alert type="warning" v-if="managed_groups.length===0" :title="t(strings.no_group.title)" class="clickable" @click="show_create_group=true">
      <template #icon>
        <n-icon>
          <EditOffOutlined/>
        </n-icon>
      </template>
      {{ t(strings.no_manageable.description) }}
    </n-alert>
    <GroupCard v-else :group_id="group.id" v-for="group in managed_groups" manageable/>

  </n-card>
</template>

<script setup>
import {
  NCard,
  NAlert,
  NButton,
  NModal,
  NInput,
  NIcon,
  NText,
  NSpace,
  NFormItem,
  useMessage,
  NDynamicInput,
  NInputNumber,
  useNotification
} from 'naive-ui'
import {inject, onMounted, reactive, ref} from "vue";
import strings from "../../strings/Home/MyGroup.json";
import GroupOffOutlined from "@vicons/material/GroupOffOutlined";
import EditOffOutlined from "@vicons/material/EditOffOutlined";

import {client, groups, log_api} from "../../apis";
import PointedMap from "../../components/PointedMap.vue";

import GroupCard from "../../components/GroupCard.vue";

const t = inject('translate');
const session = inject('session');

let show_join_group = ref(false);

let show_create_group = ref(false);

const invitation_code = ref('');
const invitation_feedback = reactive({
  status: '',
  message: '',
});
const message = useMessage();
async function check_invitation() {
  if (invitation_code.value.length === 0) {
    invitation_feedback.status = 'error';
    invitation_feedback.message = '邀请码不能为空';
    return false;
  }
  try {
    let result = await groups.check_invitation(invitation_code.value)
    invitation_feedback.status = 'success';
    message.success(t({
      cn: `来自小组"${result.data.group.name}"的邀请！`,
      en: `Invitation from group "${result.data.group.name}"!`,
    }))
    return true;
  } catch (e) {
    if (e.response) {
      invitation_feedback.status = 'error';
      invitation_feedback.message = t(e.response.data.message);
    }
    return false;
  }
}

async function join_group() {
  if (await check_invitation()) {
    try {
      let result = await groups.apply_invitation(invitation_code.value);
      message.success(t({
        "cn": `成功加入小组"${result.data.group.name}"！`,
        "en": `Successfully joined group "${result.data.group.name}"!`,
      }))
      show_join_group.value = false;
    } catch (e) {
      if (e.response) {
        invitation_feedback.status = 'error';
        invitation_feedback.message = t(e.response.data.message);
      }
    }
  }
}

const managed_groups = ref([]);

onMounted(async () => {
  if (session.value.permission > 1) {
  //  对于管理员+小组长：检查自己管理的小组
    log_api("调查小组", "Client => Server", "获取自己管理的小组");
    try {
      let result = (await groups.get_manageable_groups());
      managed_groups.value = result.data;
      log_api("调查小组", "Server => Client", "获取到 " + managed_groups.value.length + " 个小组");
    } catch (e) {
      console.error(e);
    }

  }
})



// 创建小组部分
const create_form = reactive({
  name: '',
  points: [],
})

const create_form_feedback = reactive({
  name: {
    status: undefined,
    message: undefined,
  }

})

function create_point() {
  // 北京的经纬度
  let point = {
    name: '新调查点',
    longitude: 116.407526,
    latitude: 39.90403,
    key: Math.random().toString(36).substr(2, 5),
  };
  create_form.points.push(point);
  return point
}


const notification = useNotification();
async function create_and_join_group() {
  if (create_form.name.length < 3) {
    create_form_feedback.name.status = 'error';
    create_form_feedback.name.message = '小组名称不能少于3个字符';
    return;
  }
  if (create_form.name.length > 10) {
    create_form_feedback.name.status = 'error';
    create_form_feedback.name.message = '小组名称不能多于10个字符';
    return;
  }
  if (create_form.points.length === 0) {
    notification.error({
      title: "创建小组失败",
      content: "至少要有一个调查点",
      duration: 2000
    })
    return;
  }
  try {
    let result = await client.post("/groups", {
      name: create_form.name,
      points: create_form.points,
    });
    notification.success({
      title: "创建小组成功",
      content: "成功创建并加入调查小组!"
    })
    show_create_group.value = false;
    create_form.name = '';
    create_form.points = [];
  } catch (e) {
    if (e.response) {
      notification.error({
        title: "创建小组失败",
        content: t(e.response.data.message)
      })
    }
  }
}
</script>

<style scoped>
  .clickable {
    cursor: pointer !important;
    transition: all .2s ease-in-out;
  }
  .clickable:hover {
    filter: brightness(0.9);
  }
  .clickable:active {
    filter: brightness(0.8);
  }
</style>
