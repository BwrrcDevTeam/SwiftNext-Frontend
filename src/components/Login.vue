<template>
  <!--  登陆弹窗-->
  <n-card class="login_modal" size="huge" hoverable>
    <template #header>
      <span>{{ props.title }}</span>
      <br>
      <span class="subtitle" style="font-size: 14px; font-weight: 300;">{{ props.subtitle }}</span>
    </template>

    <template #header-extra>
      <SiteConfig :inline="false"/>
    </template>

    <!--    第一阶段：输入邮箱-->
    <n-collapse-transition :show="stage==='email'">

      <n-input v-model:value="email" size="large" round :placeholder="t({cn: '邮箱 或 姓名', en: 'Email or Name'})"
               @keydown.enter="continue_login" :input-props="{type: 'email'}">
        <template #prefix>
          <EmailFilled style="height: 20px"/>
        </template>
      </n-input>
      <div style="height: 30px"></div>
      <n-spin :show="continue_loading" size="small">
        <login-button class="full" @click="continue_login" :active="continue_loading">{{ t(Login_strings.continue) }}
        </login-button>
      </n-spin>

      <n-divider>{{ t({cn: "或者", en: "Or"}) }}</n-divider>
      <n-spin :show="wechat_loading" size="small">
        <login-button class="full" color="green" @click="wechat_login" :active="wechat_loading">
          <LogoWechat class="logo"/>
          {{ t(Login_strings.wechat_login) }}
        </login-button>
      </n-spin>

    </n-collapse-transition>

    <!--    第1.5阶段: 选择用户-->
    <n-collapse-transition :show="stage==='select_user'">
      <n-text tag="h3">敢问尊姓大名?</n-text>
      <n-list bordered>
        <n-list-item v-for="user in users" class="user-selection" @click="select_user(user)">
          <UserLine :uid="user.id"/>
        </n-list-item>
      </n-list>


    </n-collapse-transition>

    <!--    第二阶段：输入密码-->
    <n-collapse-transition :show="stage==='password'">
      <div class="avatar_area">
        <n-avatar size="large" round class="avatar" :src="user.avatar" v-if="user.avatar">
        </n-avatar>
        <n-avatar size="large" round class="avatar" v-else>
          <n-icon size="50">
            <UserFilled class="dummy_avatar"/>
          </n-icon>
        </n-avatar>
      </div>
      <n-h2 class="username">{{ user.name }}</n-h2>
      <div style="height: 30px"></div>
      <n-input round size="large" :placeholder="t({cn: '密码', en: 'Password'})" v-model:value="password"
               @keydown.enter="login" :input-props="{type: 'password'}" ref="password_area">
        <template #prefix>
          <LockFilled style="height: 20px"/>
        </template>
      </n-input>


      <div style="height: 30px"></div>
      <n-spin :show="login_loading" size="small">
        <login-button class="full" @click="login" :active="login_loading">
          {{ t(Login_strings.login) }}
        </login-button>
      </n-spin>
      <div style="height: 30px"></div>
      <div style="display: flex;align-items: center; justify-content: space-between">
        <div>
          <span>在此设备上保存密码：</span>
          <n-switch v-model:value="save_password"></n-switch>
        </div>

        <n-button text @click="init_storage">清空记录</n-button>
      </div>
    </n-collapse-transition>


    <template #action>
      <n-space justify="space-between">
        <router-link :to="{name: 'register'}" @click="cancel_login">
          <n-text type="success">{{
              t({
                cn: "注册",
                en: "Register"
              })
            }}
          </n-text>
        </router-link>

        <router-link :to="{name: 'declaration'}" class="info" @click="cancel_login">
          <n-text type="info" depth="2">{{
              t({
                cn: "声明",
                en: "Declaration"
              })
            }}
          </n-text>
        </router-link>
      </n-space>
    </template>
  </n-card>
</template>

<script setup>
import {
  NCard,
  NInput,
  NSpin,
  NDivider,
  NSpace,
  NText,
  NButton,
  useNotification,
  NCollapseTransition,
  NAvatar,
  NH2,
  NSwitch,
  NIcon,
    NList,
    NListItem
} from "naive-ui";
import {inject, onMounted, ref} from "vue";
import {Login_strings} from "../i18n";
import LogoWechat from "@vicons/ionicons5/LogoWechat";
import EmailFilled from "@vicons/material/EmailFilled";
import LockFilled from "@vicons/material/LockFilled";
import SiteConfig from "./SiteConfig.vue";
import LoginButton from "./LoginButton.vue";
import {encrypt, log_api, log_error, update_session, client} from "../apis";
import UserFilled from "@vicons/carbon/UserFilled";
import UserLine from "./UserLine.vue";


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

const stage = ref("email"); // 登陆的阶段: email, password, wechat, select_user
const users = ref([]); // 可供选择的用户
const user = ref({});


// 所有的登陆方法的最终目的是请求后端的登陆接口，让后端设置session状态

const password_area = ref(null);

const save_password = ref(true);

async function check_history() {
  // 这里需要延迟一下，否则会因为动画时间导致报错
  password_area.value.focus();
  // 这里检查下有没有历史密码记录
  let saved_password = JSON.parse(localStorage.getItem("saved_password"));
  if (saved_password) {
    if (saved_password.hasOwnProperty(user.value.name)) {
      // 填入密码
      // password.value = saved_password[email.value];
      password.value = "loaded_from_cache";
      // 触发登录
      // 加载动画留着好看～
      setTimeout(login, 500);
    }
  }
}

async function continue_login() {
  if (continue_loading.value) {
    return;
  }
  if (stage.value !== 'email') {
    return;
  }
  continue_loading.value = true;
  // 正则校验下 检查是邮箱还是姓名
  // 不会有人的名字是邮箱吧[-_-]
  let email_regex = /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/;
  if (!email_regex.test(email.value)) {
    log_api("查询用户", "Client => Server", "查询叫做" + email.value + "的用户");
    try {
      user.value = (await client.post("/users/check_name", {
        name: email.value
      })).data;
      stage.value = "password";
      setTimeout(check_history, 500);

    } catch (e) {
      if (e.response) {
        if (e.response.data.code === 1001) {
          log_api("用户名查询结果", "Server => Client", "没有找到该用户名");
          notification.error({
            title: t(Login_strings.no_such_name.title),
            content: t(Login_strings.no_such_name.description),
            duration: 3000
          });
        }
      } else {
        //  无法handle的错误
        handle_crucial_error(e);
      }
    }

  } else {
    log_api("查询邮箱", "Client => Server", "查询当前邮箱用户状态");
    try {
      let result = await client.post("/users/check_email", {
        email: email.value
      });
      log_api("邮箱查询结果", "Server => Client", result.data);
      if (result.data.length === 1) {
        user.value = result.data[0];
        stage.value = "password";
      } else if (result.data.length === 0) {
        log_api("邮箱查询结果", "Server => Client", "没有找到该邮箱");
        notification.error({
          title: t(Login_strings.no_such_email.title),
          content: t(Login_strings.no_such_email.description),
          duration: 3000
        });
      } else {
        //  多个用户
        users.value = result.data;
        stage.value = "select_user"
      }
    } catch (e) {
      if (e.response) {
      } else {
        //  无法handle的错误
        handle_crucial_error(e);
      }
    }

  }


  setTimeout(() => {
    continue_loading.value = false;
  }, 1000);
}

const login_loading = ref(false);
const password = ref("");
const session = inject("session");

onMounted(() => {
//  检查有没有保存的密码账号，如果有就直接登录
  let saved_password = JSON.parse(localStorage.getItem("saved_password"));
  if (saved_password) {
    for (let key in saved_password) {
      let enc_password = saved_password[key];
      email.value = key;
      continue_login()
      return;
    }
  }
})

async function login() {
  if (login_loading.value) {
    return;
  }
  login_loading.value = true;
  if (password.value.length < 6 || password.value.length > 20) {
    notification.error({
      title: t(Login_strings.password_length_error.title),
      content: t(Login_strings.password_length_error.description),
      duration: 3000
    });
    setTimeout(() => {
      login_loading.value = false;
    }, 1000);
    return;
  }
  let encrypted_password = "";
  // 检查是否有已保存的密码

  let saved_password = JSON.parse(localStorage.getItem("saved_password"));
  if (saved_password && saved_password.hasOwnProperty(user.value.name)) {
    // 填入密码
    encrypted_password = saved_password[user.value.name];
  } else {
    try {
      encrypted_password = await encrypt(password.value);
      encrypted_password = encrypted_password.data.encrypted;
    } catch (e) {
      // 处理不了的错误...
      handle_crucial_error(e);
      login_loading.value = false;
      return;
    }
  }

  log_api("登录", "Client => Server", "登录:" + encrypted_password);
  try {
    let result = await client.post("/users/login", {
      id: user.value.id,
      password: encrypted_password
    });
    // 刷新session
    let _session = await update_session();
    if (_session.login) {
      session.value = _session;
      log_api("登录成功", "Server => Client", "登录成功");
      // 保存密码
      let saved_password = JSON.parse(localStorage.getItem('saved_password'));
      if (saved_password === null) {
        saved_password = {};
      }
      saved_password[user.value.name] = encrypted_password;
      localStorage.setItem('saved_password', JSON.stringify(saved_password))
    } else {
      log_error("Server => Client", "尽管服务器返回了登录成功，但是session更新失败");
      notification.error({
        title: t(Login_strings.session_not_updated.title),
        content: t(Login_strings.session_not_updated.description),
        duration: 3000
      });
    }
    login_loading.value = false;
    return;
  } catch (e) {
    if (e.response) {
      if (e.response.data.code === 1001) {
        log_api("登录结果", "Server => Client", "密码错误");
        notification.error({
          title: t(Login_strings.password_error.title),
          content: t(Login_strings.password_error.description),
          duration: 3000
        });
        // 删除保存的密码
        let saved_password = JSON.parse(localStorage.getItem('saved_password'));
        if (saved_password === null) {
          saved_password = {};
        }
        if (saved_password.hasOwnProperty(user.value.id)) {
          // saved_password.delete(email.value);
          delete saved_password[user.value.id];
        }
        localStorage.setItem('saved_password', JSON.stringify(saved_password))
      }
      if (e.response.data.code === 4) {
        //  一些字段错误
        log_api("登录结果", "Server => Client", "字段错误");
        notification.error({
          title: t(Login_strings.field_error.title),
          description: t(e.response.data.message),
          duration: 3000
        })
      }
      login_loading.value = false;

    } else {
      //  无法handle的错误
      login_loading.value = false;
      handle_crucial_error(e);
    }
  }
  login_loading.value = false;

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

function init_storage() {
  let saved_password = JSON.parse(localStorage.getItem('saved_password'));
  if (saved_password === null) {
    saved_password = {};
  }
  localStorage.setItem('saved_password', JSON.stringify(saved_password))
  stage.value = "email";
}

function select_user(_user) {
  user.value = _user;
  stage.value = "password";
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
  color: rgba(0, 0, 0, 0.55)
}

.black .subtitle {
  color: rgba(255, 255, 255, 0.55)
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
.user-selection {
  transition: all .2s;
}
.user-selection:hover {
  filter: brightness(.8);
}
.user-selection:active {
  filter: brightness(.5);
}
</style>
