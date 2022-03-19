<template>
  <n-skeleton text :repeat="2" v-if="on_loading">
  </n-skeleton>
  <n-thing v-else>
    <template #avatar>
      <n-avatar :src="storage.get_inline_url(user.avatar)" v-if="user.avatar">
      </n-avatar>
      <n-avatar v-else>
        <n-icon>
          <UserFilled/>
        </n-icon>
      </n-avatar>
    </template>
    <template #header>
      {{ user.name }}
    </template>
    <template #description>
      {{ get_user_description() }}
    </template>
  </n-thing>
</template>

<script setup>

import {inject, onMounted, ref} from "vue";
import {client, storage, log_api, log_error} from "../apis";
import {NSkeleton, NThing, NAvatar, NIcon} from 'naive-ui';
import UserFilled from "@vicons/carbon/UserFilled";

const t = inject("translate");

const props = defineProps({
  uid: {
    type: String,
    required: true
  },
});

const user = ref(null);

const on_loading = ref(true);


function get_user_description() {
  if (user.value.permission===3) {
    return t({
      "cn": "系统管理员"
    })
  }
  if (user.value.permission===2) {
    if (user.value.group) {
      return t({
        "cn": user.value.group.name + "调查小组长"
      })
    } else {
      return t({
        "cn": "调查小组长"
      })
    }
  }
  if (user.value.permission===1) {
    if (user.value.group) {
      return t({
        "cn": user.value.group.name + " 志愿者"
      })
    } else {
      return t({
        "cn": "志愿者"
      })
    }
  }
}

onMounted(async () => {
  try {
    log_api("用户", "Client => Server", "获取用户信息");
    user.value = (await client.get("/users/" + props.uid)).data;
    if (user.value.hasOwnProperty("group")) {
      user.value.group = (await client.get("/groups/" + user.value.group)).data;
    }
    log_api("用户", "Server => Client", "获取到 "+ user.value.name +" 的信息");
    on_loading.value = false;
  } catch (e) {
    message.error(t({
      "cn": "获取用户信息失败: ",
      "en": "Failed to get user information: "
    }) + t(e.response.data.message));
    log_error("Server => Client", "获取用户信息失败");
  }
});

</script>

<style scoped>

</style>
