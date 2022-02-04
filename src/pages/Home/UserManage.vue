<template>
<!--  用户管理组件-->
<!--  创建邀请card-->
  <n-modal v-model:show="new_invitation" preset="card">

  </n-modal>
<!--  创建用户card-->
  <n-modal v-model:show="new_user" preset="card">

  </n-modal>
  <n-space justify="space-around">
    <n-button @click="new_user=true;">创建用户</n-button>
    <n-button @click="new_invitation=true;">创建邀请</n-button>
  </n-space>
  <br>
  <n-data-table :columns="columns">

  </n-data-table>
</template>

<script setup>
import {NModal, NButton, NSpace, NDataTable} from 'naive-ui'
import {ref} from "vue";

const new_user = ref(false)
const new_invitation = ref(false)

const columns = [
  {
    title: "用户名",
    key: "name",
  },
  {
    title: "邮箱",
    key: "email",
  },
  {
    title: ""
  },
  {
    title: "操作",

  }
]

</script>

<style scoped>

</style>
