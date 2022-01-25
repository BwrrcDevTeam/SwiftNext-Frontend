<template>
  <div class="main">
    <h1>调试页面</h1>
    <p>用来Debug的页面</p>
    <h2>Session信息: </h2>
    <p>
      {{ session }}
    </p>
  </div>
</template>

<script setup>
import {inject} from "vue";

const session = inject("session");
</script>

<style scoped>

</style>
