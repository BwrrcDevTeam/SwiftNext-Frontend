<template>
  <n-grid cols="1 400:1 800:2 1200:3" x-gap="20" y-gap="20">
    <!--    分配到的任务-->
    <n-grid-item>
      <n-card :title="t(strings.week_overview)">
        <!--        本周已进行 n 次调查 / 本周尚未进行任何调查填报-->
        <n-alert type="info" v-if="week_reports.length===0">
          {{ t(strings.no_reports_this_week) }}
        </n-alert>
      </n-card>
    </n-grid-item>
    <n-grid-item>
<!--      项目信息-->
      <n-card :title="t(strings.project_overview)">
        <n-row>
          <n-col :span="12">
            <n-statistic :label="t(strings.project_num)">
              {{ projects.length }}
            </n-statistic>
          </n-col>
          <n-col :span="12">
            <n-statistic :label="t(strings.project_reports)">
              <n-number-animation :from="0" :to="project_reports">
              </n-number-animation>
            </n-statistic>
          </n-col>
        </n-row>

      </n-card>
    </n-grid-item>
    <n-grid-item>
<!--      调查小组信息-->
      <n-card :title="t(strings.group_overview)">

      </n-card>
    </n-grid-item>
    <n-grid-item>
<!--      通知-->
      <n-card :title="t(strings.notifications)">
        <n-alert type="default" v-if="notifications.length===0">
          {{ t(strings.no_notifications) }}
        </n-alert>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import {NGrid, NGridItem, NCard, useNotification, NAlert, NStatistic, NRow, NCol, NNumberAnimation} from 'naive-ui';
import strings from "../../strings/Home/IndexReport.json";
import {inject, onMounted, ref} from "vue";
import {records, notifications as notify_api, projects as projects_api, log_api, log_error} from "../../apis"

const t = inject("translate");
const session = inject("session");
const notification = useNotification();

const week_reports = ref([]);
const notifications = ref([]);
const projects = ref([]);
const project_reports = ref(114514); // 项目填报数量

onMounted(async () => {
  try {
    log_api("本周调查报告", "Client => Server", "获取用户本周的调查报告");
    week_reports.value = (await records.get_week_report(session.value)).data;
    log_api("本周调查报告", "Server => Client", "查询到 " + week_reports.value.length + " 条调查报告");
  } catch (e) {


  }
  log_api("通知", "Client => Server", "获取用户通知");
  notifications.value = (await notify_api.get_notifications()).data;
  log_api("通知", "Server => Client", "查询到 " + notifications.value.length + " 条通知");
  log_api("项目", "Client => Server", "获取全站项目");
  projects.value = (await projects_api.get_all_projects()).data;
  log_api("项目", "Server => Client", "查询到 " + projects.value.length + " 条项目");
})
</script>

<style scoped>

</style>
