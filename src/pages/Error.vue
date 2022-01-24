<template>
  <div class="outer">
      <n-card class="card">
        <n-result :status="props.status" :description="t(props.description)" :title="t(props.title)" >
          <template #footer v-if="props.callback">
            <n-button @click="props.callback">{{t(props.callback_text)}}</n-button>
            <span style="padding: 5px;"></span>
            <n-button secondary @click="re0">{{t(Error_strings.reload)}}</n-button>
          </template>
        </n-result>
      </n-card>
  </div>

</template>

<script setup>
import {NCard, NResult, NButton} from "naive-ui";
import {inject} from "vue";
import {useRoute} from "vue-router";
import {Error_strings} from "../i18n";

const t = inject("translate");
const route = useRoute();

let props = {
    status: "404",
    description: {
        cn: "直接访问 '/error' 并不能制造更多错误",
        en: "Visiting '/error' will not generates more errors"
    },
    title: {
        cn: "这里啥都没有 w(ﾟДﾟ)w",
        en: "Nothing here w(ﾟДﾟ)w"
    },
    callback_text: {
        cn: "返回",
        en: "Back"
    },
    callback: () => {
        window.location.href = "/";
    }
}
if (route.query.hasOwnProperty("status")) {
  // 使用传入的参数
  props = route.query;
  props.title = JSON.parse(props.title);
  props.description = JSON.parse(props.description);
  if (props.callback_text) {
    props.callback_text = JSON.parse(props.callback_text);
  }
  if (props.callback) {
    props.callback = window[props.callback];
  }
}

function re0() {
  console.log("重开...");
  window.location.href = "/";
}
</script>

<style scoped>
.card {
  position: relative;
  width: 500px;
  margin: auto;
  padding: 30px;
}
.outer {
  align-items: center;
  justify-content: center;
  display: flex;
  min-height: calc(100vh - 70px);
}
@media screen and (max-width: 500px) {
  .card {
    width: 90%;
    padding-top: 60px;
    padding-bottom: 60px;
  }
}
</style>
