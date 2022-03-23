<template>
  <n-grid cols="1 400:1 600:2 800:2 1000:3" :y-gap="10" :x-gap="10">
    <n-grid-item>
      <n-card title="项目管理" class="module">
        <n-scrollbar style="max-height: 500px">
          <ProjectsManage/>
        </n-scrollbar>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="用户管理" class="module">
        <n-scrollbar style="max-height: 500px">
          <UserManage/>
        </n-scrollbar>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="小组管理" class="module">
        <n-scrollbar style="max-height: 500px">
          <GroupManage/>
        </n-scrollbar>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="系统健康状态" class="module">

      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="数据" class="module">
        <n-row>
          <n-col :span="12">
            <n-statistic label="媒体资源" value="114514">
              <template #suffix>
                Gb
              </template>
            </n-statistic>
          </n-col>
          <n-col :span="12">
            <n-statistic label="填报数据" :value="count">
              <template #suffix>
                份
              </template>
            </n-statistic>
          </n-col>
        </n-row>
        <br>
        <n-date-picker v-model:value="export_range" type="daterange"></n-date-picker>
        <br>
        <n-button>导出填报数据</n-button>
      </n-card>
    </n-grid-item>
  </n-grid>

</template>

<script setup>
import { NCard, NGrid, NGridItem, NButton, NStatistic, NRow, NCol, NDatePicker, NScrollbar } from 'naive-ui';
import {onMounted, ref} from "vue";
import UserManage from "./UserManage.vue";
import GroupManage from "./GroupManage.vue";
import ProjectsManage from "./ProjectsManage.vue";
import {client} from "../../apis";

// 数据部分
const export_range = ref([Date.now() - 24 * 60 * 60 * 1000, Date.now()]);

const count = ref(0);

onMounted(async () => {
  try {
    count.value = (await client.get("/records/count")).data;
  } catch (e) {
    console.error(e);
  }

})
</script>

<style scoped>
  .module {
    height: 100%;
  }
</style>
