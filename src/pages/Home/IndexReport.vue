<template>
  <n-grid cols="1 400:1 800:2 1200:3" x-gap="20" y-gap="20">
    <!--    分配到的任务-->
    <n-grid-item>
      <n-card :title="t(strings.week_overview)">
        <!--        本周已进行 n 次调查 / 本周尚未进行任何调查填报-->
        <n-alert type="info" v-if="week_reports.length===0" :title="t(strings.no_reports_this_week.title)" @click="router.push({'name': 'home_reports'})" class="clickable">
          <template #icon>
            <n-icon>
              <ContentPasteOffOutlined/>
            </n-icon>
          </template>
          {{ t(strings.no_reports_this_week.description) }}
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
        <n-alert type="warning" v-if="!session.user.hasOwnProperty('group')" :title="t(strings.no_group.title)" class="clickable" @click="router.push({name: 'home_group'})">
          <template #icon>
            <n-icon>
              <GroupOffOutlined/>
            </n-icon>
          </template>
          {{ t(strings.no_group.description) }}
        </n-alert>
        <template v-else-if="group">
          <n-h2>{{ group.name }}</n-h2>
          <n-row>
            <n-col :span="12">
              <n-statistic label="小组已经运行了">
                <n-number-animation :from="0" :to="get_group_running_time()"/>
                <template #suffix>
                  天
                </template>
              </n-statistic>
            </n-col>
            <n-col :span="12">
              <n-statistic label="小组填报数量">
                <n-number-animation :from="0" :to="group_reports"/>

              </n-statistic>
            </n-col>
          </n-row>

        </template>
<!--        <GroupCard v-else :group_id="session.user.groups[0]" brief/>-->
      </n-card>
    </n-grid-item>
    <n-grid-item>
<!--      通知-->
      <n-card :title="t(strings.notifications)">
        <n-alert type="default" v-if="notifications.length===0" :show-icon="false">

          {{ t(strings.no_notifications) }}

        </n-alert>
      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import {NGrid, NGridItem, NCard, useNotification, NAlert, NStatistic, NRow, NCol, NNumberAnimation, NIcon, NH2} from 'naive-ui';
import strings from "../../strings/Home/IndexReport.json";
import {inject, onMounted, ref} from "vue";
import {
  records,
  notifications as notify_api,
  projects as projects_api,
  log_api,
  log_error,
  update_session,
    client
} from "../../apis"

import GroupOffOutlined from "@vicons/material/GroupOffOutlined";
import ContentPasteOffOutlined from "@vicons/material/ContentPasteOffOutlined";
import {useRouter} from "vue-router";

import GroupCard from "../../components/GroupCard.vue";


const router = useRouter();

const t = inject("translate");
const session = inject("session");
const notification = useNotification();

const week_reports = ref([]);
const notifications = ref([]);
const projects = ref([]);
const project_reports = ref(0); // 项目填报数量

const group = ref(null);
const group_reports = ref(0); // 小组填报数量

onMounted(async () => {
  log_api("会话", "Client => Server", "更新会话");
  try {
    session.value = await update_session();
  } catch (e) {

  }

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


  log_api("填报", "Client => Server", "获取全部填报数量");
  try {
    project_reports.value = (await records.get_count()).data;
    log_api("填报", "Server => Client", "查询到 " + project_reports.value + " 条填报");
  } catch (e) {

  }

  log_api("填报", "Client => Server", "获取小组填报数量");
  try {
    group_reports.value = (await records.get_group_count(session.value.group)).data;
    log_api("填报", "Server => Client", "查询到 " + group_reports.value + " 条填报");
  } catch (e) {

  }


  if (session.value.user.hasOwnProperty('group')) {
    log_api("小组", "Client => Server", "获取用户所在的小组");
    group.value = (await client.get("/groups/" + session.value.user.group)).data;
    log_api("小组", "Server => Client", "查询到 " + group.value.name);
  }

})

function get_group_running_time() {
  if (group.value === null) {
    return 0;
  }
  let utc_now = new Date().getTime() / 1000;
  let utc_start = group.value.created_at;
  // 计算时间差 并转换为天数
  return Math.ceil((utc_now - utc_start) / (60 * 60 * 24));
}
</script>

<style scoped>
  .clickable {
    cursor: pointer !important;
    transition: all .2s ease-in-out;
  }
  .clickable:hover {
    filter: brightness(0.9);
  }
  .clickable:active {
    filter: brightness(0.8);
  }
</style>
