<template>
  <n-skeleton text :repeat="3" v-if="loading">
  </n-skeleton>
  <n-card v-else>

    <template #cover>
      <div v-if="!manageable">
        <img :src="storage.get_inline_url(group.cover)" v-if="group.hasOwnProperty('cover') && group.cover" class="cover-img">
        <div v-else style="height: 300px; width: 100%;" class="mask">
          <PointedMap  :points="points" style="height: 300px; width: 100%;" disabled></PointedMap>
        </div>
      </div>
      <div v-else @mouseover="show_edit_cover=true" @mouseleave="show_edit_cover=false">

        <img :src="storage.get_inline_url(group.cover)" v-if="group.hasOwnProperty('cover') && group.cover" class="cover-img" :class="{blur: show_edit_cover}">
        <div v-else style="height: 300px; width: 100%;" class="mask">
          <PointedMap  :points="points" style="height: 300px; width: 100%;" disabled></PointedMap>
        </div>
        <n-space style="position: absolute;height: 150px;width: 100%;margin-top: -156px;" justify="center" class="cover-operators" :class="{show: show_edit_cover, hide: !show_edit_cover}">
          <n-upload :action="storage.get_upload_url()" accept="image/*" :on-finish="cover_upload_finish" :on-error="cover_upload_error" with-credentials :show-file-list="false">
            <n-button text type="primary">上传</n-button>
          </n-upload>
          <n-button text type="error" @click="delete_cover">删除</n-button>
        </n-space>
      </div>


    </template>
    <template #header>
      <n-h1>{{group.name}}</n-h1>
    </template>
    <n-list bordered>
      <template #header>
        <n-space justify="space-between">
          <n-h2 style="margin-bottom: 0">调查点</n-h2>
          <n-button v-if="props.manageable">调查点管理</n-button>
        </n-space>
      </template>
      <n-space v-for="point in points" justify="space-around" style="height: 50px;line-height: 36px;">
        <span>名称: {{point.name}}</span>
        <span>经度: {{point.longitude}}</span>
        <span>纬度: {{point.latitude}}</span>
      </n-space>
    </n-list>
    <n-list bordered>
      <template #header>
        <n-space justify="space-between">
          <div style="display: flex;width: fit-content;">
            <n-h2 style="margin-bottom: 0">组员</n-h2>
<!--            <n-input placeholder="搜索" style="margin-left: 10px; width: 130px;"></n-input>-->
          </div>
          <n-button v-if="props.manageable">创建邀请</n-button>
        </n-space>
      </template>
      <UserLine v-for="uid in members" :uid="uid" style="margin-left: 20px;margin-top: 5px;margin-bottom: 5px;"></UserLine>
    </n-list>

    <n-card v-if="members.includes(session.user.uid) && (!props.brief)">
      <template #header>
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
        <n-button type="warning" >添加管理员</n-button>
      </template>


    </n-card>
  </n-card>
</template>

<script setup>
import {NSkeleton, NCard, NList, NSpace, NButton, NH2, NH1, NInput, NPopconfirm, useNotification, NUpload} from "naive-ui";

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
  manageable: {
    type: Boolean,
    default: false,
  },
  brief: {
    type: Boolean,
    default: false,
  },
})

const group = ref(null);
const points = ref([]);
const members = ref([]);

const show_edit_cover = ref(false);

onMounted(async () => {
  try {
    let result = await client.get("/groups/" + props.group_id)
    points.value = (await client.get("/positions/by_group/" + props.group_id)).data
    members.value = (await client.get("/groups/" + props.group_id + "/members")).data

    loading.value = false
    group.value = result.data;
  } catch (e) {
  }

})

const notification = useNotification();
async function quit_group() {
  try {
    let result = await client.delete("/groups/" + props.group_id + "/members/" + session.value.user.uid);
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

async function cover_upload_finish({ file, event }) {
  let file_id = JSON.parse(event.target.response).id;
  group.value = (await client.patch("/groups/"+props.group_id, {
    cover: file_id,
  })).data
}

async function cover_upload_error({ file, event }) {
  notification.error({
    title: "上传封面失败",
    content: "请检查网络连接",
  })
}

async function delete_cover() {
  group.value = (await client.patch("/groups/"+props.group_id, {
    cover: null,
  })).data
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
