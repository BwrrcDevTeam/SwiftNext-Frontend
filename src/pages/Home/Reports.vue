<template>
  <n-card v-if="projects===0" class="center_alert">
    <n-result status="info" title="填报未开放" description="没有运行中的调查项目">
      <template #footer>
        <n-button @click="router.push({name: 'home'})">看看别的?</n-button>
      </template>
    </n-result>
  </n-card>
  <n-card v-else :title="t(strings.title)" :closable="route.name==='home_reports_new'" @close="close_card"
          class="new_report">
    <n-collapse-transition :show="route.name!=='home_reports_new'">
      <n-space justify="center" class="select_method" v-if="route.name!=='home_reports_new'">
        <LoginButton style="min-width: 200px;min-height: 50px;" @click="new_report">新建填报</LoginButton>
      </n-space>
    </n-collapse-transition>
    <n-collapse-transition :show="route.name==='home_reports_new'">
      <router-view/>
    </n-collapse-transition>


  </n-card>
  <n-collapse-transition :show="route.name!=='home_reports_new'">
    <n-card :title="t(strings.history)" style="margin-top: 20px;">
      <HistoryRecords/>
    </n-card>
  </n-collapse-transition>

</template>

<script setup>
import {
  NButton,
  NCard,
  NEl,
  NResult,
  NIcon,
  NP,
  NSpace,
  NText,
  NUpload,
  NUploadDragger,
  useMessage,
  NCollapseTransition
} from 'naive-ui';
import {inject, onMounted, onUnmounted, ref} from "vue";
import strings from "../../strings/Home/Reports.json";

import {client, storage} from "../../apis";
import HistoryRecords from "../../components/HistoryRecords.vue";
import {useRoute, useRouter} from "vue-router";
import LoginButton from "../../components/LoginButton.vue";

const t = inject("translate")

const message = useMessage();

function close_card() {
  router.push({name: 'home_reports'})
}

const projects = ref(undefined);

onMounted(async () => {
  projects.value = (await client.get("/projects/running")).data.length;
})

function new_report() {
  router.push({name: 'home_reports_new'})
}

const router = useRouter();
const route = useRoute();
</script>

<style scoped>
.or {
  margin: 0 10px;
  line-height: 40px;
}

.n-space.select_method {
  height: 224px;
  align-items: center;
}

.upload {
  height: max-content;
  align-items: center;
  text-align: center;
  margin: auto;
  width: 100%;
  max-width: 500px;
}

.drag {
  width: 100%;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .2s ease-in-out;
}

.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */
{
  opacity: 0;
}

.new_report {
  height: max-content;
  transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
}

.center_alert {
  padding: 20px;
}
</style>

<style>
.upload .n-upload-trigger {
  width: 500px;
  padding: 20px;
  max-width: 500px;
}

@media screen and (max-width: 600px) {
  .upload .n-upload-trigger {
    width: 100%;
    padding: 0;
    max-width: 100%;
  }
}

</style>
