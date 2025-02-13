<template>
  <n-layout has-sider class="">
    <!--    侧边菜单-->
    <n-layout-sider class="side" :class="{'show': side_menu_show, 'hide': !side_menu_show}">
      <n-menu :options="menu_options" :value="menu_active">

      </n-menu>
    </n-layout-sider>
    <!--    正文内容-->
    <!--    <div class="mask" :class="{'show': side_menu_show, 'hide': !side_menu_show}" @click.prevent="side_menu_show = false" @scroll.prevent="null">-->
    <n-scrollbar style="height: calc(100vh - 70px);transition: margin-left .3s"
                 :class="{'side_show': side_menu_show, 'side_hide': !side_menu_show}">
      <n-layout-content class="content">
        <router-view></router-view>
      </n-layout-content>
      <n-layout-footer class="footer">
        <Footer/>
      </n-layout-footer>
    </n-scrollbar>
    <!--    </div>-->


  </n-layout>
</template>

<script setup>
import {
  NLayout,
  NLayoutContent,
  NLayoutSider,
  NScrollbar,
  NLayoutFooter,
  NMenu,
  NIcon,
  useNotification
} from "naive-ui";
import Footer from "../components/Footer.vue";
import {computed, inject, onMounted, ref, h} from "vue";
import {useRoute, useRouter} from "vue-router";
import strings from "../strings/Home.json";

import Home from "@vicons/carbon/Home";
import Settings from "@vicons/carbon/Settings";
import ContentPasteOutlined from "@vicons/material/ContentPasteOutlined";
import GroupOutlined from "@vicons/material/GroupOutlined";
import AccountCircleOutlined from "@vicons/material/AccountCircleOutlined";

import {RouterLink, RouterView} from 'vue-router';

const t = inject("translate");

// 路由
const router = useRouter();
const route = useRoute();

let supported = ['home_index', 'home_reports', 'home_group', 'home_site_manage', 'home_user']
const menu_active = ref(supported.includes(route.name) ? route.name : null);
const session = inject("session");

const notification = useNotification();

function renderIcon(icon) {
  return () => h(NIcon, null, {default: () => h(icon)})
}

const side_menu_show = inject("side_menu_show");

const menu_options = computed(() => {
  let base_options = [ // 所有级别都有的
    //  首页
    {
      label: () =>
          h(
              RouterLink,
              {
                to: {
                  name: 'home_index',
                }
              },
              {
                default: () => t(strings.index),
              }
          ),
      key: "home_index",
      icon: renderIcon(Home),
    },
    {
      label: () =>
          h(
              RouterLink,
              {
                to: {
                  name: 'home_reports',
                }
              },
              {
                default: () => t(strings.reports),
              }
          ),
      key: "home_reports",
      icon: renderIcon(ContentPasteOutlined),
    },
    {
      label: () =>
          h(
              RouterLink,
              {
                to: {
                  name: 'home_group',
                }
              },
              {
                default: () => t(strings.group),
              }
          ),
      key: "home_group",
      icon: renderIcon(GroupOutlined),
    },
    {
      label: () =>
          h(
              RouterLink,
              {
                to: {
                  name: 'home_user',
                }
              },
              {
                default: () => t(strings.user_center),
              }
          ),
      key: "home_user",
      icon: renderIcon(AccountCircleOutlined),
    },
  ]

  if (session.value.permission === 3) {
    base_options.push({
      // 只有管理员才有的：全站管理
      label: () =>
          h(
              RouterLink,
              {
                to: {
                  name: 'home_site_manage',
                }
              },
              {
                default: () => t(strings.site_manage),
              }
          ),
      key: "home_site_manage",
      icon: renderIcon(Settings),
    })
  }
  return base_options;
})

router.beforeEach((to, from, next) => {
  if (to.name === "home") {
    menu_active.value = "home_index";
    next({
      name: "home_index"
    });
  } else {
    if (supported.includes(to.name)) {
      // 先检查权限
      if (to.meta.hasOwnProperty('perm') && session.permission < to.meta.perm) {
        notification.error({
          title: t(strings.perm_error.title),
          description: t(strings.perm_error.description),
        });
        menu_active.value = "home_index";
        next({
          name: "home_index"
        });
        return;
      }

      menu_active.value = to.name;
    } else {
      menu_active.value = null;
    }
    next();
  }
});
</script>

<style scoped>
.mask, .content, .footer {
  width: 100%;
  max-width: 100%;
}

.content {
  padding: 15px;
}

.mask {
  width: 100vw;
  max-width: 100vw;
  height: calc(100vh - 70px);
  transition: all .2s ease-in-out;
}

.mask.show {
  filter: brightness(0.5);
}

.mask.hide {
  filter: brightness(1);
  /*width: 0;*/
}

.content {
  min-height: calc(100vh - 350px);
}

@media screen and (max-width: 800px) {
  aside {
    position: absolute;
    height: calc(100vh - 70px);
    transition: all 0.3s;
    z-index: 2;
  }

  aside.show {
    left: 0;
  }

  aside.hide {
    left: -100vw !important;
  }

  .content {
    width: 100vw;
    max-width: 100vw;
  }

  .footer {
    width: 100vw;
  }
}


</style>

<style>
.side_show {
  margin-left: 272px;
  width: 100vw !important;
}

.side_hide {
  margin-left: 0;
  width: 100vw;
}
</style>
