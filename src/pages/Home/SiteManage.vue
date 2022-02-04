<template>
  <n-grid cols="1 400:1 600:2 800:3 4" :y-gap="10" :x-gap="10">
    <n-grid-item>
      <n-card title="项目管理">

      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="用户管理">
        <n-data-table :columns>

        </n-data-table>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="小组管理">

      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="系统健康状态">

      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="数据">
        <n-row>
          <n-col :span="12">
            <n-statistic label="媒体资源" value="114514">
              <template #suffix>
                Gb
              </template>
            </n-statistic>
          </n-col>
          <n-col :span="12">
            <n-statistic label="填报数据" value="114514">
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
import { NCard, NGrid, NGridItem, NButton, NStatistic, NRow, NCol, NDatePicker } from 'naive-ui';
import {ref} from "vue";

// 数据部分
const export_range = ref([Date.now() - 48 * 60 * 60 * 60, Date.now()]);
</script>

<style scoped>

</style>
