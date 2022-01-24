<template>
<!--  登陆弹窗-->
  <n-card class="login_modal" size="huge" hoverable>
    <template #header>
      <span>{{props.title}}</span>
      <br>
      <span class="subtitle" style="font-size: 14px; font-weight: 300;">{{props.subtitle}}</span>
    </template>

    <template #header-extra>
      <SiteConfig :inline="false"/>
    </template>

<!--    第一阶段：输入邮箱-->
    <n-collapse-transition :show="stage==='email'">

      <n-input v-model:value="email" size="large" round :placeholder="t({cn: '邮箱地址', en: 'Email'})" @keydown.enter="continue_login" :input-props="{type: 'email'}">
        <template #prefix>
          <EmailFilled style="height: 20px"/>
        </template>
      </n-input>
      <div style="height: 30px"></div>
      <n-spin :show="continue_loading" size="small">
        <login-button class="full" @click="continue_login" :active="continue_loading">{{t(Login_strings.continue)}}</login-button>
      </n-spin>

      <n-divider>{{t({cn: "或者", en: "Or"})}}</n-divider>
      <n-spin :show="wechat_loading" size="small">
        <login-button class="full" color="green" @click="wechat_login" :active="wechat_loading">
          <LogoWechat class="logo"/>
          {{t(Login_strings.wechat_login)}}
        </login-button>
      </n-spin>

    </n-collapse-transition>

<!--    第二阶段：输入密码-->
    <n-collapse-transition :show="stage==='password'">
      <div class="avatar_area">
        <n-avatar size="large" round class="avatar" :src="user.avatar" v-if="user.avatar">
        </n-avatar>
        <n-avatar size="large" round class="avatar" v-else>
          <UserAvatarFilled class="dummy_avatar"/>
        </n-avatar>
      </div>
      <n-h2 class="username">{{user.name}}</n-h2>
      <div style="height: 30px"></div>
      <n-input round size="large" :placeholder="t({cn: '密码', en: 'Password'})" v-model:value="password" @keydown.enter="login" :input-props="{type: 'password'}">
        <template #prefix>
          <LockFilled style="height: 20px"/>
        </template>
      </n-input>
      <div style="height: 30px"></div>
      <n-spin :show="login_loading" size="small">
        <login-button class="full" @click="login" :active="login_loading">
          {{t(Login_strings.login)}}
        </login-button>
      </n-spin>
    </n-collapse-transition>



    <template #action>
      <n-space justify="space-between">
        <router-link :to="{name: 'register'}" @click="cancel_login">
          <n-text type="success">{{t({
            cn: "注册",
            en: "Register"
          })}}</n-text>
        </router-link>

        <router-link :to="{name: 'declaration'}" class="info" @click="cancel_login">
          <n-text type="info" depth="2">{{ t({
            cn: "声明",
            en: "Declaration"
          }) }}</n-text>
        </router-link>
      </n-space>
    </template>
  </n-card>
</template>

<script setup>
import {NCard, NInput, NSpin, NDivider, NSpace, NText, useNotification, NCollapseTransition, NAvatar, NH2} from "naive-ui";
import {inject, ref} from "vue";
import {Login_strings} from "../i18n";
import LogoWechat from "@vicons/ionicons5/LogoWechat";
import EmailFilled from "@vicons/material/EmailFilled";
import UserAvatarFilled from "@vicons/carbon/UserAvatarFilled";
import LockFilled from "@vicons/material/LockFilled";
import SiteConfig from "./SiteConfig.vue";
import LoginButton from "./LoginButton.vue";
import {check_email, encrypt, log_api, log_error} from "../apis";


const props = defineProps({
  title: {
    default: "登陆"
  },
  subtitle: {
    default: "请输入用户名和密码"
  }
})
const t = inject("translate");
const notification = useNotification();
const handle_crucial_error = inject("handle_crucial_error");

const continue_loading = ref(false);

const email = ref("");
// 调试
const stage = ref("password"); // 登陆的阶段: email, password, wechat

// During Debug !!
// 只是为了调试
let user = ref({
  name: "DummyUser",
  email: "li@imlihe.com",
  avatar: "https://tx-free-imgs2.acfun.cn/kimg/bs2/zt-image-host/ChQwOGYwZjgwNzEwYjRmODk4ZDkwMRCYzNcv.png"
});

// 所有的登陆方法的最终目的是请求后端的登陆接口，让后端设置session状态

async function continue_login() {
  continue_loading.value = true;
  log_api("查询邮箱", "Client => Server", "查询当前邮箱用户状态");
  // todo 请求后端登录接口
  try {
    let result = await check_email(email.value);
    log_api("邮箱查询结果", "Server => Client", result.data);
    user.value = result.data;
    stage.value = "password";
  } catch (e) {
    if (e.response) {
      if (e.response.data.code === 1001) {
        log_api("邮箱查询结果", "Server => Client", "没有找到该邮箱");
        notification.error({
          title: t(Login_strings.no_such_email.title),
          content: t(Login_strings.no_such_email.description),
          duration: 3000
        });
      }
    } else {
    //  无法handle的错误
      handle_crucial_error(e);
    }
  }

  setTimeout(() => {
    continue_loading.value = false;
  }, 1000);
}

const login_loading = ref(false);
const password = ref("");

async function login() {
  login_loading.value = true;
  if (password.value.length < 6 || password.value.length > 20) {
    notification.error({
      title: t(Login_strings.password_length_error.title),
      content: t(Login_strings.password_length_error.description),
      duration: 3000
    });
    login_loading.value = false;
    return;
  }
  let encrypted_password = "";
  try {
    encrypted_password = await encrypt(password.value);
    encrypted_password = encrypted_password.data.encrypted;
  } catch (e) {
    // 处理不了的错误...
    handle_crucial_error(e);
    login_loading.value = false;
    return;
  }
  log_api("登录", "Client => Server", "登录:" + encrypted_password);
  // todo 在这里调用后端登录接口
  setTimeout(() => {
    login_loading.value = false;
  }, 1000);
}


const wechat_loading = ref(false);

function wechat_login() {
  wechat_loading.value = true;
  notification.warning({
    title: t({
      cn: "还不支持微信登陆!",
      en: "Wechat login is not supported yet!"
    }),
    description: t({
      cn: "已经在加班了，敬请期待!",
      en: "I'm working hard to support wechat login!"
    }),
    duration: 5000,
  });
  setTimeout(() => {
    wechat_loading.value = false;
  }, 500);
}

const show_login = inject("show_login");

function cancel_login() {
  show_login.value = false;
}

</script>

<style scoped>
  .login_modal {
    width: 500px;
  }
  @media screen and (max-width: 500px) {
    .login_modal {
      width: 90%;
    }
  }
  .full {
    width: 100%;
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
  .light .subtitle {
    color: rgba(0,0,0, 0.55)
  }
  .black .subtitle {
    color: rgba(255,255,255, 0.55)
  }
  .logo {
    display: inline;
    height: 23px;
    margin-right: 10px;
  }
  .avatar_area {
    text-align: center;
  }
  .avatar {
    width: 100px;
    height: 100px;
  }
  .username {
    width: 100%;
    text-align: center;
    margin-top: 0;
  }
</style>

<style>

</style>
