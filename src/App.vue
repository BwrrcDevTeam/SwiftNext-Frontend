<script setup>
import {NConfigProvider, NNotificationProvider, NCard, NLoadingBarProvider,NSpin, NModal, useOsTheme, darkTheme, zhCN, dateZhCN, enUS, dateEnUS} from "naive-ui";
import {inject, onMounted, provide, reactive, ref} from "vue";
import {init_session, log_api, log_error} from "./apis";
import {useRoute, useRouter} from "vue-router";
import {get_lang} from "./i18n";
import Login from "./components/Login.vue";
import Content from "./components/Content.vue";
// 翻译模块
const t = inject("translate");
const router = useRouter();
const route = useRoute();


function get_theme() {
  if (window.localStorage.getItem("theme")) {
    return ref(window.localStorage.getItem("theme"));
  } else {
    window.localStorage.setItem("theme", useOsTheme().value==="dark"? "dark": "light");
    return get_theme();
  }
}

// 默认的主题颜色
// 主题色可以在不刷新页面的前提下修改! 因此加了ref
let theme = get_theme();

// 界面是支持多语言的!
let locale = get_lang() === 'cn'? zhCN : enUS;
let date_locale = get_lang() === 'cn'? dateZhCN : dateEnUS;

// 为子孙提供主题颜色 (ref)
provide("theme", theme);

</script>

<template>
  <div id="wrapper" :class="theme">
    <n-config-provider :theme="theme === 'dark'? darkTheme : null" :locale="locale" :date-locale="date_locale">
      <n-loading-bar-provider>
        <n-notification-provider>
  <!--        路由页面-->
          <Content></Content>
        </n-notification-provider>
      </n-loading-bar-provider>
    </n-config-provider>
  </div>
</template>

<style scoped>
  #wrapper {
    min-height: 100%;
    min-width: 100%;
    position: absolute;
    user-select: none;
  }
  #wrapper.dark {
    background-color: #101014;
  }
  #wrapper.light {
    background-color: #f5f5f5;
  }
</style>
<style>
  * {
    /*禁止拖拽 选中 修改*/
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
    -webkit-user-drag: none;
    cursor: default;
  }
</style>
