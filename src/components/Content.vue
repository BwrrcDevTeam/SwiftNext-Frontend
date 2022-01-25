<template>
  <n-spin :show="contacting_server">
      <n-layout>
        <n-layout-header>
          <Header/>
        </n-layout-header>
        <Modals v-model:show_admin_contact="show_admin_contact" :full_traceback="full_traceback" :login_text="login_text" v-model:show_login="show_login"/>
        <n-scrollbar v-if="true" style="max-height: calc(100vh - 70px)">
          <n-layout-content class="content">
              <router-view/>
          </n-layout-content>
          <n-layout-footer>
            <Footer/>
          </n-layout-footer>
        </n-scrollbar>
      </n-layout>
  </n-spin>

</template>

<script setup>
import {computed, getCurrentInstance, inject, onMounted, provide, reactive, ref} from "vue";
import {useRoute, useRouter} from "vue-router";
import {useLoadingBar, NLayout, NLayoutHeader,NLayoutContent, NLayoutFooter, NSpin, NScrollbar} from "naive-ui";
import Header from "./Header.vue";
import Footer from "./Footer.vue";
import {init_session, log_api, log_error, update_session} from "../apis";
import {Content_strings} from "../i18n";
import Modals from "./Modals.vue";

const loading_bar = useLoadingBar();
const router = useRouter();
const route = useRoute();
const t = inject("translate");

router.beforeEach((to, from, next) => {
  loading_bar.start();
  next();
});

router.afterEach((to, from) => {
  if (to.name === "error") {
    // 前往错误页面时，显示红条
    loading_bar.error();
  } else {
    // 其他情况，显示绿条
    loading_bar.finish();
  }
});

// 模态框相关
let show_admin_contact = ref(false);
let show_login = ref(false);
let login_text = reactive({
  title: "",
  sub_title: "",
})
let full_traceback = ref("");
window.notify_admin = () => {
  show_admin_contact.value = true;
}

// 为子孙提供模态框的引用
provide("show_login", show_login);

// 展示登陆框
async function login(title, subtitle) {
  console.log("开始登录进程");
  show_login.value = true;
  login_text.title = t(title);
  login_text.subtitle = t(subtitle)
  await new Promise(resolve => {
    setInterval(() => {
      if (JSON.parse(sessionStorage.getItem("session")).login) {
        // 登录成功
        show_login.value = false;
        resolve(true);
      }
      if (show_login.value === false) {
        // 登录失败 或 登录取消
        show_login.value = false;
        resolve(false);
      }
    }, 500);
  });
  console.log("登录成功!");
}
provide("login", login);

// 处理致命错误
function handle_crucial_error(e) {
  // 把加载框停了
  contacting_server.value = false;
  if (e.response) {
    // 如果有响应, 展示服务器的错误信息
    log_error("Server => Client", t(e.response.data.message));
    // 这个错误导致程序无法继续运行 前往错误页面
    full_traceback.value = JSON.stringify({
      message: e.message,
      response: e.response.data,
    });
    let status = e.response.status.toString();
    if (status !== "404" || status !== "403" || status !== "500" || status !== "418") {
      status = "404";
    }
    router.push({
      name: "error",
      query: {
        status,
        title: JSON.stringify({
          cn: "致命错误",
          en: "Fatal Error",
        }),
        callback_text: JSON.stringify({
          cn: "去上报问题",
          en: "Report a problem"
        }),
        callback: "notify_admin",
        description: JSON.stringify({
          cn: "远程服务器引起了一个致命错误，请稍后重试，并通知管理员",
          en: "The remote server caused a fatal error, please try again later and notify the administrator",
        }),
        enable_reload: true,
      },
    });
  } else {
    // 如果没有响应, 展示客户端的错误信息
    log_error("Client=>Client", e.message);
    // 这个错误导致程序无法继续运行 前往错误页面
    // 这个错误多半是客户端自己作的
    full_traceback.value = JSON.stringify({
      message: e.message,
    });
    router.push({
      name: "error",
      query: {
        status: "418",
        title: JSON.stringify({
          cn: "致命错误",
          en: "Fatal Error",
        }),
        callback_text: JSON.stringify({
          cn: "去上报问题",
          en: "Report a problem"
        }),
        callback: "notify_admin",
        description: JSON.stringify({
          cn: "本地设备产生了一个离谱的错误，请检查网络并稍后重试！",
          en: "The local device has generated an outrageous error, please check the network and try again later!",
        }),
        enable_reload: true,
      },
    });
  }
  // 在错误页面时，终止一切任务
  login = async () => {}
  show_login.value = false;
}
// 提供给子孙
provide("handle_crucial_error", handle_crucial_error);



// 显示转圈动画
let contacting_server = ref(true);

// 全局session
let session = ref({});
provide("session", session);


// 挂载完毕后, 初始化session
onMounted(async () => {
  if (location.pathname==="/error") {
    // 如果是错误页面，则不初始化session
    contacting_server.value = false;
    return;
  }
  contacting_server.value = true;
  try {
    let _session = await update_session();
    contacting_server.value = false;
    session.value = _session;
    // if (!session.login && !route.meta.no_auth) {
    //   // 这里await一个登陆的弹窗
    //   await login(Content_strings.welcome_title, Content_strings.welcome_subtitle)
    // }
  } catch (e) {
    // 无法继续运行 执行handle_crucial_error
    contacting_server.value = null;
    handle_crucial_error(e);
    return;
  }
  contacting_server.value = false;
});

let first_load = true;

async function is_login() {
  if (contacting_server.value) {
    // 联系服务器时，不允许登录
    // 先等待服务器联系完毕
    console.log("等待连接服务器...");
    let result = await new Promise((resolve, reject) => {
      let id = setInterval(() => {
        if (contacting_server.value===null) {
          // 连接服务器失败了，不需要再等了
          clearInterval(id)
          resolve(false)
        }
        if (contacting_server.value===false) {
          clearInterval(id)
          resolve(true)
        }

      }, 500)
    });
    if (!result) {
    // 连接服务器过程中发生错误 停止正常的路由解析
      return true;
    }
  }
  return session.value.login;
}
router.beforeEach(async (to, from, next) => {
  if (to.meta.no_auth) {
    show_login.value = false;
  } else if (! await is_login()) {
    // 等待login结束
    if (first_load) {
      await login(Content_strings.welcome_title, Content_strings.welcome_subtitle);
      first_load = false;
    } else {
      await login(Content_strings.need_login, Content_strings.need_login_subtitle);
    }

  }
  next();
})
</script>

<style scoped>
.content {
  min-height: calc(100vh - 70px);
}
</style>
