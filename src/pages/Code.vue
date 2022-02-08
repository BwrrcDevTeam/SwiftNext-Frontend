<template>
    <template v-if="code.length > 0">
      <n-spin :show="is_checking_code">
        <n-card class="main">
          <n-result v-show="check_status!==undefined" :status="check_status" :title="check_status==='success' ? '验证成功' : '验证失败'" :description="check_status === 'success' ? '您可以关闭该页面了' : description" class="result">
          </n-result>
        </n-card>
        <template #description>
          正在检验验证码
        </template>
      </n-spin>
    </template>
    <template v-else>
      <n-card class="main">
        <n-result v-if="check_status!==undefined" :status="check_status" :title="check_status==='success' ? '验证成功' : '验证失败'" :description="check_status === 'success' ? '您可以关闭该页面了' : description" class="result">
            <template #footer>
              <n-button v-if="check_status==='error'" @click="code = '';check_status=undefined">再试一次</n-button>
            </template>
        </n-result>
        <template v-if="check_status===undefined">
          <n-h2>手动录入验证码</n-h2>
          <n-form-item label="请输入收到的验证码">
            <n-input @keydown.enter="check_code" v-model="code" placeholder="请输入收到的验证码"></n-input>
          </n-form-item>
          <LoginButton @click="check_code" style="width: 100%;">
              检验验证码
          </LoginButton>
        </template>
      </n-card>
    </template>


</template>

<script setup>

import {
  NSpin,
  NCard,
    NResult,
    NFormItem,
    NInput,
    NH2,
    NButton
} from "naive-ui";

import {inject, onMounted, ref} from "vue";
import {useRoute} from "vue-router";
import {client} from "../apis";
import LoginButton from "../components/LoginButton.vue";

const t = inject("translate");

const route = useRoute()

let code = ref("")

const is_checking_code = ref(true);

const check_status = ref(undefined);

const description = ref("正在检验验证码");

async function check_code() {
  is_checking_code.value = true;
//  暂时只有一种验证码：注册时的验证码
  try {
    let result = await client.post("/users", {
        code: code.value
    })
    check_status.value = "success"
    is_checking_code.value = false
  } catch (e) {
    check_status.value = "error"
    is_checking_code.value = false
    if (e.response.data) {
      description.value = t(e.response.data.message)
    } else {
      description.value = "未知错误"
    }
  }

}

onMounted(() => {
  if (route.params.hasOwnProperty('code')) {
    code.value = route.params.code
    if (code.value.length > 0) {
      check_code()
    }
  } else {
    code.value = ""
  }

})

</script>

<style scoped>
  .main {
    max-width: 600px;
    margin: 50px auto;
    min-height: 300px;
    width: 100%;
  }
  .result {
    margin: 50px auto;
  }

</style>
