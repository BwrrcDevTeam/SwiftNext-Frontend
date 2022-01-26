<template>
  # NewReport
  <n-card :title="t(strings.title)">

  </n-card>
</template>

<script setup>
import { NCard } from 'naive-ui'
import {inject} from "vue";
import strings from "../../strings/Home/Reports.json";

const t = inject("translate")

</script>

<style scoped>

</style>
