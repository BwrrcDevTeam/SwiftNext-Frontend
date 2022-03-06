<template>
  <div class="container">
    <n-grid cols="1 500:2" x-gap="12" y-gap="12">
      <n-grid-item>
        <n-card v-if="loading_name" class="name-part">
          <n-skeleton :repeat="3" text></n-skeleton>
        </n-card>
        <n-card class="name-part" v-else>
          <div class="top">
            <n-avatar :size="100" round class="avatar">
              <n-icon size="50">
                <UserFilled class="dummy_avatar"/>
              </n-icon>
            </n-avatar>
            <div class="name">
              <n-text tag="h2" style="margin: 0;">{{ user.name }}</n-text>
              <n-text>{{ job() }}</n-text>
            </div>
          </div>
        </n-card>
      </n-grid-item>
      <n-grid-item>
        <n-card class="statics-part" v-if="loading_statics">
          <n-skeleton :repeat="3" text></n-skeleton>
        </n-card>
        <n-card class="statics-part" v-else>
          <div style="display: flex;justify-content: space-around;align-items: center;height: 100%">
            <n-statistic label="共计填报" :value="statics.total">
              <template #suffix>
                份
              </template>
            </n-statistic>
            <n-statistic label="填报天数" :value="statics.days">
              <template #suffix>
                天
              </template>
            </n-statistic>
          </div>
        </n-card>
      </n-grid-item>
    </n-grid>
    <n-card class="chart" style="margin-top: 12px;">
      FUTURE: CHART HERE
    </n-card>

  </div>

</template>

<script setup>
import {
  NCard,
  NAvatar,
  NText,
  NStatistic,
  NGrid,
  NGridItem,
  NIcon,
  NSkeleton,

} from "naive-ui";
import {useRoute, useRouter} from "vue-router";
import {inject, onMounted, ref} from "vue";
import UserFilled from "@vicons/carbon/UserFilled";
import {client} from "../apis";

const route = useRoute()
const router = useRouter()

const session = inject("session");

let user_id = undefined;

if (route.params.id) {
  user_id = route.params.id;
} else {
  user_id = session.value.user.uid;
}

const user = ref(null);

function job() {
  if (user.value.permission === 1) {
    return "小组志愿者"
  } else if (user.value.permission === 2) {
    return "小组组长"
  } else if (user.value.permission === 3) {
    return "系统管理员"
  }
}

const loading_name = ref(true);
const loading_statics = ref(true);

async function fetch_user() {
  try {
    user.value = (await client.get("/users/" + user_id)).data;
    loading_name.value = false;
  } catch (e) {
    console.log(e.response.data.code)
    if (e.response.data.code === 4) {
      await router.push("/404");
    }
  }
}

const statics = ref({
  total: 0,
  days: 0,
});

async function fetch_statics() {
  try {
    let records = (await client.get("/records?uid=" + user_id)).data;
    statics.value = {
      total: records.length,
      days: records.map(r => r.time).filter((v, i, a) => a.indexOf(v) === i).length,
    }
    loading_statics.value = false;
  } catch (e) {

  }

}

onMounted(() => {
  fetch_user();
  fetch_statics();
});

</script>

<style scoped>
.container {
  max-width: 70rem;
  margin: 50px auto;
}

.top {
  display: flex;
  align-items: center;
}

.name {
  display: flex;
  margin-left: 20px;
  justify-items: left;
  text-align: left;
  flex-direction: column;
}

.name-part, .statics-part {
  height: 100%;
}

</style>
