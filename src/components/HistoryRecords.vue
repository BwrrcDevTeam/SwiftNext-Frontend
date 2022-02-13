<template>
  <div style="display: flex;justify-content: center;width: 100%; height: 200px;align-content: center;flex-direction: column" v-if="my_records.length === 0 && engaged.length===0">
    <n-empty size="huge" style="height: fit-content;">
    </n-empty>
  </div>
  <n-card title="我创建的填报"  v-if="my_records.length > 0">
    <n-data-table :columns="columns" :data="my_records" style="width: 100%;">
    </n-data-table>
  </n-card>

  <n-card title="我参与的填报" v-if="engaged.length > 0">
    <n-data-table :columns="columns" :data="engaged" style="width: 100%;">
    </n-data-table>
  </n-card>

</template>

<script setup>
import {inject, onMounted, ref} from "vue";
import {client, records} from "../apis"
import {NDataTable, NEmpty, NCard} from "naive-ui";
import {time_to_db, time_from_db} from "../utils";


const my_records = ref([]);
const engaged = ref([]);

const session = inject("session");


async function format_records(records) {
  return await Promise.all(records.map(async record => {
    return {
      ...record,
      create_time: time_from_db(record.time).toLocaleString(),
      project_name: project_names[record.project],
      position_name: await get_position_name(record.position),
    }
  }));
}

let project_names = {};

async function get_project_names() {
  let projects = (await client.get("/projects")).data;
  projects.forEach(project => {
    project_names[project.id] = project.title;
  });
}

async function get_position_name(position_id) {
  let position = (await client.get("/positions/"+position_id)).data;
  return position.name;
}

onMounted(async () => {
  await get_project_names();

  let data = (await client.get("/records/user/" + session.value.user.uid)).data;
  my_records.value = await format_records(data.records);
  console.log(await format_records(data.records));
  engaged.value = await format_records(data.engaged_records);
});

const columns = [
  {
    title: "项目",
    key: "project_name",
  },
  {
    title: "填报时间",
    key: "create_time"
  },
  {
    title: "位于",
    key: "position_name"
  },
  {
    title: "数量",
    key: "num"
  },
  {
    title: "操作",
  }
]
</script>

<style scoped>

</style>
