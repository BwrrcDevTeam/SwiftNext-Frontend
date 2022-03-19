<template>
  <div class="outer">
    <n-card class="main" size="huge" :title="t({cn: '注册', en: 'Register'})">
      <!--      <transition name="fade" mode="out-in">-->

      <n-collapse-transition :show="stage==='input_code'">
        <!--          状态1：输入注册邀请码-->
        <n-form-item label="如果您已经有注册邀请码了，请在此输入：">
          <n-input v-model:value="code" placeholder="如: QUhSJdXbzN" @keyup.enter="check_code_and_continue"></n-input>
        </n-form-item>
        <n-collapse-transition :show="code.length > 3">
          <n-spin :show="checking_code" style="margin-bottom: 20px;" size="small">
            <LoginButton style="width: 100%;" @click="check_code_and_continue">继续</LoginButton>
          </n-spin>
        </n-collapse-transition>

      </n-collapse-transition>

      <n-collapse-transition :show="stage === 'input_info'">
        <!--          状态2：输入注册信息-->
        <n-card title="邀请信息">
          <n-text depth="2">
            小组：
            <n-text depth="1" type="info">
              {{invitation_info.groups}}
            </n-text>
          </n-text>
          <br>
          <n-text depth="2">
            过期时间：
            <n-text depth="1" type="info">{{ invitation_info.expire_time.toLocaleString() }}</n-text>
          </n-text>
          <br>
          <n-text depth="2">
            用户角色：
            <n-text depth="1" type="info">{{ invitation_info.role }}</n-text>
          </n-text>
          <template #footer>
            <div style="display: flex;justify-content: space-between">
              <n-text depth="3">
                请核验邀请信息
              </n-text>
              <n-text type="warning" class="how_code" @click="re_input">
                重新输入邀请码
              </n-text>
            </div>

          </template>
        </n-card>
        <n-card title="注册信息" style="margin-top: 20px;">
          <n-form-item label="邮箱" required>
            <n-input v-model:value="register_form.email" placeholder="请输入邮箱"></n-input>
          </n-form-item>
          <n-form-item label="姓名" required>
            <n-input v-model:value="register_form.name" placeholder="请输入您的姓名"></n-input>
          </n-form-item>
          <n-form-item label="密码" required>
            <n-input v-model:value="register_form.password" type="password" placeholder="请设置密码"
                     show-password-on="click"></n-input>
          </n-form-item>
          <n-form-item label="确认密码" required>
            <n-input v-model:value="register_form.re_password" type="password" placeholder="请再次输入密码"
                     show-password-on="click"></n-input>
          </n-form-item>

          <template #footer>
            <n-spin :show="login_loading" size="small">
              <LoginButton style="width: 100%;" @click="register">注册</LoginButton>
            </n-spin>

          </template>
        </n-card>
      </n-collapse-transition>

      <n-collapse-transition :show="stage === 'success'">
        <n-result status="success" title="注册已受理" description="系统已向您填写的邮箱地址发送了一封验证邮件，请在5分钟内查看"
                  style="max-width: 300px;margin: auto;">
          <template #footer>
            <n-text type="info" @click="router.push({name: 'home'})" class="how_code">进入个人主页</n-text>
            <br>
            <br>
            <n-text type="warning" @click="re_register" class="how_code">注册信息有误？重新填写</n-text>
          </template>
        </n-result>
      </n-collapse-transition>


      <!--      <template #footer v-if="stage === 'input_code'">-->
      <!--        <n-text depth="3" @click="router.push({name: 'declaration'})" class="how_code">这是什么？如何获得注册邀请码？</n-text>-->
      <!--      </template>-->
    </n-card>
  </div>
</template>

<script setup>
import {NCard, NFormItem, NInput, NText, NResult, NCollapseTransition, NSpin, useMessage} from 'naive-ui';
import LoginButton from "../components/LoginButton.vue";
import {inject, ref} from "vue";
import {useRouter} from "vue-router";
import {client, log_api, encrypt} from "../apis";

import {get_lang} from "../i18n";
import {time_from_db} from "../utils";

const t = inject("translate");
const router = useRouter();
const message = useMessage();

// 邀请码
const code = ref("");
const checking_code = ref(false);

// 当前状态 输入注册码 / 填写注册信息 / 注册成功
const stage = ref("input_code");

const invitation_info = ref({});

function get_offset() {
  return new Date().getTimezoneOffset() * 60;
}

function utc_stamp_to_local(utc_stamp) {
  const d = new Date(utc_stamp * 1000 - get_offset() * 1000);
  return d.toLocaleString();
}

async function update_invitation_info(data) {
  invitation_info.value = data;
  let groups = "";
  for (const group_id of data.groups) {
    let group = (await client.get("/groups/" + group_id)).data;
    groups += group.name + " ";
  }

  invitation_info.value.groups = groups;
  if (data.permission === 3) {
    invitation_info.value.role = "管理员";
  }
  if (data.permission === 2) {
    invitation_info.value.role = "组长";
  }
  if (data.permission === 1) {
    invitation_info.value.role = "志愿者";
  }
  invitation_info.value.expire_time = time_from_db(data.expire_at)
}

function re_input() {
  code.value = "";
  invitation_info.value = {};
  stage.value = "input_code";
}

async function check_code_and_continue() {
  if (checking_code.value) return;
  checking_code.value = true;
  if (code.value.length !== 10) {
    message.error("邀请码长度不正确!", {duration: 2000});
    setTimeout(() => {
      checking_code.value = false;
    }, 2000);
    return;
  }

  // 通过后端检查注册邀请
  try {
    let result = await client.get("/users/register_invitations/" + code.value);
    await update_invitation_info(result.data);
    stage.value = "input_info";
    checking_code.value = false;
  } catch (e) {
    message.error(t(e.response.data.message), {duration: 2000});
    setTimeout(() => {
      checking_code.value = false;
    }, 2000);
  }
}

// 注册部分

const register_form = ref({
  name: undefined,
  email: undefined,
  password: undefined,
  re_password: undefined,
})

function init_form() {
  register_form.value.name = undefined;
}

function re_register() {
  init_form();
  stage.value = "input_info";
  login_loading.value = false;
}


const login_loading = ref(false);

async function register() {
  if (login_loading.value) return;
  login_loading.value = true;
  if (register_form.value.email.length === 0) {
    message.error("请输入邮箱地址!", {duration: 2000});
    setTimeout(() => {
      login_loading.value = false;
    }, 2000);
    return;
  }
  if (register_form.value.password.length === 0) {
    message.error("请输入密码!", {duration: 2000});
    setTimeout(() => {
      login_loading.value = false;
    }, 2000);
    return;
  }
  if (register_form.value.password !== register_form.value.re_password) {
    message.error("两次输入的密码不一致!", {duration: 2000});
    setTimeout(() => {
      login_loading.value = false;
    }, 2000);
    return;
  }
  if (register_form.value.name.length === 0) {
    message.error("请输入姓名!", {duration: 2000});
    setTimeout(() => {
      login_loading.value = false;
    }, 2000);
    return;
  }
  try {
    let encrypted_password = (await encrypt(register_form.value.password)).data.encrypted;
    let result = await client.post("/users/inactive", {
      name: register_form.value.name,
      password: encrypted_password,
      email: register_form.value.email,
      invitation: code.value,
      lang: get_lang(),
    });
    stage.value = "success";
  } catch (e) {
    message.error(t(e.response.data.message), {duration: 2000});
    setTimeout(() => {
      login_loading.value = false;
    }, 2000);
  }
//  之后请求发送验证邮件
}

</script>

<style scoped>
.main {
  max-width: 500px;
  margin: 50px auto;
  /*min-height: 500px;*/
}

.outer {
  align-items: center;
  justify-content: center;
  display: flex;
  min-height: calc(100vh - 70px);
}

@media screen and (max-width: 500px) {
  .main {
    width: 90%;
  }
}

.how_code {
  transition: all .3s;
}

.how_code:hover {
  filter: brightness(.8);
}

.how_code:active {
  filter: brightness(.5);
}
</style>
