<template>
<!--小组管理组件-->
  <n-space justify="space-around">
    <n-button>创建认领链接</n-button>
    <n-button>创建小组</n-button>
  </n-space>
  <br>
  <n-data-table :columns="columns">

  </n-data-table>
</template>

<script setup>
import {NDataTable, NSpace, NButton} from "naive-ui";

const columns = [
  {
    title: "小组名称",
  },
  {
    title: "创建时间"
  },
  {
    title: "管理员"
  },
  {
    title: "操作"
  }
]
</script>

<style scoped>

</style>
