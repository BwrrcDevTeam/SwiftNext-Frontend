<template>
<!--  加入小组模态框-->
  <n-modal v-model:show="show_join_group" preset="card" style="max-width: 400px;">
    <template #header>
      加入调查小组
    </template>
    <n-text depth="3">加入调查小组需要小组长提供的邀请码！</n-text>
    <n-form-item :feedback="invitation_feedback.message" :validation-status="invitation_feedback.status">
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
    <n-alert type="warning" v-if="!session.user.hasOwnProperty('group_id')" :title="t(strings.no_group.title)" class="clickable" @click="show_join_group=true">
      <template #icon>
        <n-icon>
          <GroupOffOutlined/>
        </n-icon>
      </template>
      {{ t(strings.no_group.description) }}
    </n-alert>

  </n-card>
<!--  创建小组模态框-->
  <n-modal v-model:show="show_create_group" preset="card" style="max-width: 600px;" v-if="session.permission > 1">
    <template #header>
      创建调查小组
    </template>
  </n-modal>
  <n-card :title="t(strings.managed)" style="margin-top: 20px;">
    <template #header-extra>
      <n-button secondary type="primary" @click="show_create_group=true">
          {{t(strings.create)}}
      </n-button>
    </template>
<!--    管理的小组-->
    <n-alert type="warning" v-if="!session.user.hasOwnProperty('group_id')" :title="t(strings.no_group.title)" class="clickable">
      <template #icon>
        <n-icon>
          <EditOffOutlined/>
        </n-icon>
      </template>
      {{ t(strings.no_manageable.description) }}
    </n-alert>

  </n-card>
</template>

<script setup>
import {NCard, NAlert, NButton, NModal, NInput, NIcon, NText, NSpace, NFormItem, useMessage} from 'naive-ui'
import {inject, onMounted, reactive, ref} from "vue";
import strings from "../../strings/Home/MyGroup.json";
import GroupOffOutlined from "@vicons/material/GroupOffOutlined";
import EditOffOutlined from "@vicons/material/EditOffOutlined";

import {groups, log_api} from "../../apis";

const t = inject('translate');
const session = inject('session');

const show_join_group = ref(false);

const show_create_group = ref(false);

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
