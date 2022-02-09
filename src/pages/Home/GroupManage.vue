<template>
<!--小组管理组件-->
  <n-space justify="space-around">
    <n-button>创建认领链接</n-button>
    <n-button>创建小组</n-button>
  </n-space>
  <br>
  <n-data-table :columns="columns" :data="groups">

  </n-data-table>
</template>

<script setup>
import {NDataTable, NSpace, NButton} from "naive-ui";
import {onMounted, ref} from "vue";
import {client} from "../../apis";

const columns = [
  {
    title: "小组名称",
    key: "name"
  },
  {
    title: "创建时间",
    key: "created_time"
  },
  {
    title: "管理员",
    key: "admins"
  },
  {
    title: "操作"
  }
]

function get_offset_seconds() {
  return new Date().getTimezoneOffset() * 60;
}

function utc_stamp_to_local(utc_stamp) {
//  将utc时间戳转换成本地时间
  return new Date(utc_stamp * 1000 + get_offset_seconds() * 1000).toLocaleString();
}

async function parse_groups(data) {
  return await Promise.all(data.map(async (group) => {
    const {id, name, created_at, managers} = group;
    let admins = "";
    for (const manager_id of managers) {
      admins += (await client.get("/users/" + manager_id)).data.name + " ";
    }
    return {
      id,
      name,
      created_time: utc_stamp_to_local(created_at),
      admins
    }
  }))
}

const groups = ref([]);

onMounted(async () => {
  groups.value = await parse_groups((await client.get("/groups")).data);
})
</script>

<style scoped>

</style>
