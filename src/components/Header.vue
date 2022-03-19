<template>
  <div class="main">
    <n-icon class="icon_menu" :class="is_computer? 'hide' : 'show'" :size="25"
            @click="side_menu_show = !side_menu_show" v-if="route.name && route.name.includes('home')">
      <transition name="fade" mode="out-in">
        <Close v-if="side_menu_show"></Close>
        <Menu v-else></Menu>
      </transition>
    </n-icon>
    <n-icon class="icon_menu" v-else :size="25">
      <transition name="fade" mode="out-in">
        <LightModeOutlined v-if="theme==='dark'" @click="theme='light'"/>
        <DarkModeOutlined v-else @click="theme='dark'"/>
      </transition>
    </n-icon>
    <img src="../assets/logo.png" class="logo" @click="router.push({'name': 'home_index'})"/>
    <n-menu class="menu" :options="menu_options" :value="menu_value"/>
    <div class="config">
      <SiteConfig/>
      <div style="width: 30px;"/>
      <n-dropdown v-if="session.hasOwnProperty('user')" :trigger="is_computer? 'hover': 'click'"
                  :options="login_options" @select="handle_select">
        <!--        登录后的用户头像-->
        <n-avatar round :src="session.user.avatar" v-if="session.user.hasOwnProperty('avatar')">
        </n-avatar>
        <n-avatar round v-else>
          {{ session.user.name }}
        </n-avatar>
      </n-dropdown>
      <n-dropdown v-else :trigger="is_computer? 'hover': 'click'" :options="not_login_options" @select="handle_select">
        <n-avatar round>
          <UserFilled class="dummy_avatar"/>
        </n-avatar>
      </n-dropdown>
    </div>

  </div>
</template>

<script setup>
import {NAvatar, NDropdown, NIcon, NMenu, useNotification, NText} from 'naive-ui';
import {h, inject, onUnmounted, ref, resolveComponent} from "vue";
import {Content_strings, Header_strings} from "../i18n";
import {useRoute, useRouter} from "vue-router";
import Home from "@vicons/carbon/Home";
import Communication24Regular from "@vicons/fluent/Communication24Regular";
import BoxMargin from "@vicons/tabler/BoxMargin";
import UserFilled from "@vicons/carbon/UserFilled";
import Menu from "@vicons/carbon/Menu";
import Close from "@vicons/carbon/Close";
import LightModeOutlined from "@vicons/material/LightModeOutlined";
import DarkModeOutlined from "@vicons/material/DarkModeOutlined";

import SiteConfig from "./SiteConfig.vue";
import {log_api, log_error, update_session, users} from '../apis';

const t = inject("translate");
const router = useRouter();
const route = useRoute();

const session = inject("session");

function _is_computer() {
  return window.innerWidth > 800;
}

let is_computer = ref(_is_computer());

window.onresize = () => {
  is_computer.value = _is_computer();
};

onUnmounted(() => {
  window.onresize = null;
});

const login_options = [
  {
    label: t({
      cn: "退出",
      en: "Logout"
    }),
    key: 'logout'
  }
]

const not_login_options = [
  {
    label: t({
      cn: "登录",
      en: "Login"
    }),
    key: 'login'
  }
]

const handle_crucial_error = inject("handle_crucial_error");
const notification = useNotification();
const theme = inject("theme");
const login = inject("login");

const reload = inject("reload");

async function handle_select(key) {
  if (key === 'logout') {
    try {
      log_api("登出", "Client => Server", "登出当前会话");
      await users.logout();
      log_api("登出", "Server => Client", "登出成功");
      notification.success({
        title: t({
          cn: "登出成功",
          en: "Logout Successfully"
        }),
        description: t({
          cn: "您已成功退出登陆，本地密码已清除",
          en: "You have successfully logged out, your local password has been cleared"
        }),
        duration: 3000
      });
      localStorage.removeItem("saved_password");
      session.value = await update_session();
      reload()
    } catch (e) {
      if (e.response) {
        if (e.response.data.code === 1) {
          notification.error({
            title: t({
              cn: "登出失败",
              en: "Logout Failed"
            }),
            description: t({
              cn: "尚未登陆，无法登出",
              en: "Not logged in, cannot logout"
            }),
            duration: 3000
          });
        }
        log_error("Server => Client", e.response.data);
      } else {
        handle_crucial_error(e);
      }
    }

  } else if (key === 'login') {
    await login(Content_strings.welcome_title, Content_strings.welcome_subtitle);
  }
}

function renderIcon(icon) {
  return () => h(NIcon, null, {default: () => h(icon)})
}

const menu_options = [
  {
    label: (type, children) => h(resolveComponent("router-link"), {
      to: {
        name: "home_index"
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
  },
  {
    label: (type, children) => h(resolveComponent("router-link"), {
      to: {
        name: "detector"
      }
    }, {
      default: () => t(Header_strings.menu.detector)
    }),
    key: "detector",
    icon: renderIcon(BoxMargin)
  }
]

const menu_value = ref(null);

router.afterEach((to, from) => {
  if (to.name.includes("home")) {
    menu_value.value = "home";
  } else if (to.name.includes("community")) {
    menu_value.value = "community";
  } else if (to.name.includes("detector")) {
    menu_value.value = "detector";
  } else {
    menu_value.value = null;
  }
})

const side_menu_show = inject("side_menu_show");
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
  width: 130px;
  grid-area: 1 / 1 / 2 / 2;
  transition: all .2s cubic-bezier(.4, 0, .2, 1);
  user-select: none;
}

.icon_menu.hide {
  opacity: 0;
  display: none;
}

.icon_menu.show {
  opacity: 1;
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
  width: 23px;
  height: 23px;
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
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .logo {
    opacity: 0;
    margin-left: -100vw;
    /*grid-area: 1 / 1 / 2 / 2;*/
  }

  .icon_menu {
  }

  .menu {
    width: max-content;
  }

  .config {
    position: absolute;
    opacity: 0;
    left: 100vw;
    /*width: 0;*/
  }
}

.icon_menu {
  transition: all .2s cubic-bezier(.4, 0, .2, 1);
}

.icon_menu:hover {
  /*color: #62d3ad;*/
  filter: brightness(.8);
}

.icon_menu:active {
  filter: brightness(.5);
}

.fade-enter-active, .fade-leave-active {
  transition: all .2s ease-in-out;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
  /*opacity: 0;*/
  filter: brightness(0);
}
</style>

<style>
.n-menu-item-content {
  padding-left: 15px !important;
}
</style>
