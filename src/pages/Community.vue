<template>
  <div class="outer">
    <n-card style="max-width: 500px;text-align: center; padding: 20px;">
      <n-icon size="60">
        <Communication24Regular/>
      </n-icon>
      <n-h2>
        <n-gradient-text type="info">开发中的功能 - 社区</n-gradient-text>
      </n-h2>
      <n-p>
        在社区，用户可以分享图文内容。这些内容可以被所有其他站内用户查看。
      </n-p>
      <n-p>在社区功能中上传的媒体或附件允许在系统中永久保存，且不会进行任何压缩操作，适用于长期记录。</n-p>
    </n-card>
  </div>

</template>

<script setup>
import {NCard, NIcon, NH2, NGradientText, NP} from "naive-ui";

import Communication24Regular from "@vicons/fluent/Communication24Regular";

</script>

<style scoped>
  .outer {
    display: flex;
    justify-content: center;
    align-items: center;
    height: calc(100vh - 80px);
  }
</style>
