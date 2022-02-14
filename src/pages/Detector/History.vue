<template>
  <n-data-table :columns="columns"/>
</template>

<script setup>
import {
  NDataTable
} from 'naive-ui';

const columns = [
  {
    title: "创建时间"
  },
  {
    title: "检测图片"
  },
  {
    title: "检测结果"
  },
  {
    title: "置信度阈值"
  },
  {
    title: "操作"
  }
]
</script>

<style scoped>

</style>
