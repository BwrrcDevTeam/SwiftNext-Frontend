<template>
  <div style="width: 100%; height: calc(100vh - 70px); display: flex; align-items: center; justify-content: center;">
    <n-card style="max-width: 600px;height: max-content;" title="快速创建新的账号">
      <n-text type="warning">请务必确保下面的内容正确无误，有些字段暂时无法更改</n-text>
      <div style="height: 20px;"></div>
      <n-form-item required label="姓名">
        <n-input v-model:value="name">

        </n-input>
      </n-form-item>
      <n-form-item required label="邮箱">
        <n-input v-model:value="email">

        </n-input>
      </n-form-item>
      <n-form-item required label="调查小组">
        <n-select filterable v-model:value="groups" multiple :options="all_groups"></n-select>
      </n-form-item>
      <n-form-item required label="用户类型">
        <n-select v-model:value="permission" :options="user_types"></n-select>
      </n-form-item>
      <n-form-item required label="密码">
        <n-input v-model:value="password" type="password">

        </n-input>
      </n-form-item>
      <n-form-item required label="确认密码">
        <n-input v-model:value="password_confirmation" type="password">

        </n-input>
      </n-form-item>
      <template #action>
        <n-button @click="submit" type="primary">确认</n-button>
      </template>

    </n-card>
  </div>
</template>

<script setup>
import {NCard, NFormItem, NInput, NSelect, NButton, useMessage, NText, useNotification} from 'naive-ui';
import {inject, onMounted, ref} from "vue";
import {client, encrypt} from "../apis";
import {useRouter} from "vue-router";

const name = ref("");
const email = ref("");
const password = ref("");
const password_confirmation = ref("");

const all_groups = ref([]);
const groups = ref([]);

const permission = ref(1);

const user_types = ref([
  {label: "管理员", value: 3},
  {label: "小组长", value: 2},
  {label: "志愿者", value: 1},
])

onMounted(() => {
  client.get("/groups").then(res => {
    all_groups.value = res.data.map(group => ({
      label: group.name,
      value: group.id,
      key: group.id,
    }));
  }).catch(err => {
    console.log(err);
  });
});

const message = useMessage();
const t = inject("translate");
const router = useRouter();
const notification = useNotification();

function submit() {
  if (password.value !== password_confirmation.value) {
    message.error("两次输入的密码不一致");
    return;
  }
  if (email.value.length === 0) {
    message.error("请输入邮箱");
    return;
  }
  if (name.value.length === 0) {
    message.error("请输入姓名");
    return;
  }
  if (groups.value.length === 0) {
    message.error("请选择调查小组");
    return;
  }

  encrypt(password.value).then(encrypted => {
    client.post("/users/recovery", {
      name: name.value,
      email: email.value,
      password: encrypted.data.encrypted,
      groups: groups.value,
      permission: permission.value,
    }).then(res => {
      notification.success({
        title: "成功",
        description: "用户创建成功! 您可以登录系统了",
      })
      router.push({name: "home"})
    }).catch(err => {
      message.error(t(err.response.data.message));
    });
  });
}

</script>

<style scoped>

</style>
