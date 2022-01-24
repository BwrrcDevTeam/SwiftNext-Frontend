<template>
  <div class="main">
    <div class="logo" @click="router.push({'name': 'home'})">SwiftNext</div>
    <n-menu class="menu" :options="menu_options"/>
    <div class="config">
      <SiteConfig/>
      <div style="width: 30px;"/>
      <n-avatar round>
        <img v-if="session.user" :src="session.user.avatar" :alt="session.user.name"/>
        <img v-else src='@sicons/carbon/UserAvatarFilled.svg' alt="" class="dummy_avatar">
      </n-avatar>
    </div>

  </div>
</template>

<script setup>
import {NSpace, NMenu, NForm, NFormItem, NSelect, NSwitch, NIcon, NAvatar} from 'naive-ui';
import {inject, h, resolveComponent, ref, getCurrentInstance} from "vue";
import {get_lang, Header_strings} from "../i18n";
import {useRouter} from "vue-router";
import {Home} from "@vicons/carbon";
import {Communication24Regular} from "@vicons/fluent";
import SiteConfig from "./SiteConfig.vue";

const t = inject("translate");
const router = useRouter();

const session = inject("session");




function renderIcon (icon) {
  return () => h(NIcon, null, { default: () => h(icon) })
}

const menu_options = [
  {
    label: (type, children) => h(resolveComponent("router-link"), {
      to: {
        name: "home"
      }
    }, {
      default: () => t(Header_strings.menu.home)
    }),
    key: "home",
    icon: renderIcon(Home)
  },
  {
    label: (type, children) => h(resolveComponent("router-link"), {
      to: {
        name: "community"
      }
    }, {
      default: () => t(Header_strings.menu.community)
    }),
    key: "community",
    icon: renderIcon(Communication24Regular)
  }
]
</script>

<style scoped>
  .main {
    height: 70px;
    align-items: center;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: 1fr;
    grid-column-gap: 0;
    grid-row-gap: 0;
    padding-left: 30px;
    padding-right: 0;
    transition: border-bottom-color .3s cubic-bezier(.4, 0, .2, 1);
  }
  .logo {
    font-size: 24px;
    font-weight: bold;
    /*margin-left: 30px;*/
    line-height: 70px;
    font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
    display: flex;
    width: 100px;
    grid-area: 1 / 1 / 2 / 2;
    transition: color .2s cubic-bezier(.4, 0, .2, 1);
    user-select: none;
  }
  .light .logo {
    color: #000;
  }
  .dark .logo {
    color: #fff;
  }
  .menu {
    display: flex;
    align-items: center;
    grid-area: 1 / 2 / 2 / 4;
  }
  .config {
    grid-area: 1 / 4 / 2 / 6;
    height: 70px;
    line-height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all .2s cubic-bezier(.4, 0, .2, 1);
  }

  .dummy_avatar {
    width: 34px;
    height: 34px;
    text-align: center;
    vertical-align: middle;
  }
  .dark .dummy_avatar {
    color: white;
  }
  .light .dummy_avatar {
    color: black;
  }
  .light .main {
    border-bottom: 1px solid #eee;
  }
  .dark .main {
    border-bottom: 1px solid #333;
  }
  @media screen and (max-width: 800px) {
    .main {
      display: grid;
      grid-template-columns: 150px repeat(4, 1fr);
      grid-template-rows: 1fr;
      grid-column-gap: 0;
      grid-row-gap: 0;
    }
    .logo {
      grid-area: 1 / 1 / 2 / 2;
    }
    .menu {
      grid-area: 1 / 2 / 2 / 6;
    }
    .config {
      opacity: 0;
      margin-left: 100vw;
    }
  }

</style>

<style>
.n-menu-item-content {
  padding-left: 15px !important;
}
</style>
