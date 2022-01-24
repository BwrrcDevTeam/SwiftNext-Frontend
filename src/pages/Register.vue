<template>
  <div class="outer">
    <n-card class="main" size="huge" :title="t({cn: '注册', en: 'Register'})">

    </n-card>
  </div>
</template>

<script setup>
import { NCard } from 'naive-ui';
import {inject} from "vue";
const t = inject("translate");
</script>

<style scoped>
  .main {
    max-width: 500px;
    margin: 0 auto;
  }
  .outer {
    align-items: center;
    justify-content: center;
    display: flex;
    min-height: calc(100vh - 70px);
  }
  @media screen and (max-width: 500px) {
    .main {
      width: 90%;
    }
  }
</style>
