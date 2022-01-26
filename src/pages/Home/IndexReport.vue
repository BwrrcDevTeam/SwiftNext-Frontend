<template>
  <n-grid>
<!--    分配到的任务-->
    <n-grid-item>
      <n-card :title="t(strings.week_overview)">
<!--        本周已进行 n 次调查 / 本周尚未进行任何调查填报-->
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import { NGrid, NGridItem, NCard } from 'naive-ui';
import strings from "../../strings/Home/IndexReport.json";
import {inject} from "vue";

const t = inject("translate");
</script>

<style scoped>

</style>
