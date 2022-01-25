<template>
  <n-layout has-sider class="">
<!--    侧边菜单-->
    <n-layout-sider class="side">
      #Sider
    </n-layout-sider>
<!--    正文内容-->
    <n-scrollbar style="height: calc(100vh - 70px)">
      <n-layout-content>
        <router-view></router-view>
      </n-layout-content>
      <n-layout-footer>
        <Footer/>
      </n-layout-footer>
    </n-scrollbar>


  </n-layout>
</template>

<script setup>
import { NLayout, NLayoutContent, NLayoutSider, NScrollbar, NLayoutFooter } from "naive-ui";
import Footer from "../components/Footer.vue";
import {inject, onMounted} from "vue";
import {useRoute, useRouter} from "vue-router";

const t = inject("translate");

// 路由
const router = useRouter();
const route = useRoute();

router.beforeEach((to, from, next) => {
  if (to.name === "home") {
    next({
      name: "home_index"
    });
  } else {
    next();
  }
});
</script>

<style scoped>

</style>
