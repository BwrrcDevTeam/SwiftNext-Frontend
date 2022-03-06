<template>
<!--  Footer-->
  <div class="main">
    <n-descriptions>
      <n-descriptions-item label="页面">
        <router-link :to="{name: 'register'}">
          <n-text>注册</n-text>
        </router-link>
        <br>
        <router-link :to="{name: 'declaration'}">
          <n-text>隐私条款</n-text>
        </router-link>
      </n-descriptions-item>
      <n-descriptions-item label="法律信息">
        <a href="https://beian.miit.gov.cn/" target="_blank">
          <n-text>
            京ICP备18030352号-1
          </n-text>
        </a>
      </n-descriptions-item>

    </n-descriptions>
  </div>

</template>

<script setup>
import {NDescriptions, NDescriptionsItem, NText} from "naive-ui";
import SiteConfig from "./SiteConfig.vue";
</script>

<style scoped>
  .main {
    height: 200px;
    padding: 40px;
    max-width: 100vw;
  }
  .side_show .main {
    width: 100vw;
  }
  a {
    text-decoration: none;
    filter: brightness(1);
    transition: filter 0.1s;
  }
  a:hover {
    filter: brightness(0.9);
  }
  a:active {
    filter: brightness(0.8);
  }
</style>
