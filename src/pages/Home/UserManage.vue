<template>
  <!--  用户管理组件-->
  <n-modal v-model:show="deleting" preset="dialog" title="确认删除" content="这个操作无法撤销（除了回档）" positive-text="确认" negative-text="取消" @positive-click="confirm_delete"></n-modal>
  <!--  创建邀请card-->
  <n-modal v-model:show="new_invitation" preset="card" style="max-width: 600px" title="创建注册邀请">
    <n-form-item label="调查小组">

    </n-form-item>
    <n-form-item label="新用户权限">

    </n-form-item>
    <template #action>
      <n-button type="primary">确定</n-button>
    </template>
  </n-modal>
  <!--  创建用户card-->
  <n-modal v-model:show="new_user" preset="card" style="max-width: 600px" @close="clean_new_form" title="创建用户">
    <n-form-item label="姓名" required :validation-status="new_user_feedback.name===undefined ? undefined : 'error'"
                 :feedback="new_user_feedback.name">
      <n-input v-model:value="new_user_form.name" placeholder="请输入姓名"></n-input>
    </n-form-item>
    <n-form-item label="邮箱" required :validation-status="new_user_feedback.email===undefined ? undefined : 'error'"
                 :feedback="new_user_feedback.email">
      <n-input v-model:value="new_user_form.email" placeholder="请输入邮箱"></n-input>
    </n-form-item>
    <n-form-item label="密码" required :validation-status="new_user_feedback.password===undefined ? undefined : 'error'"
                 :feedback="new_user_feedback.password">
      <n-input v-model:value="new_user_form.password" placeholder="请输入密码"></n-input>
    </n-form-item>
    <n-form-item label="确认密码" required
                 :validation-status="new_user_feedback.re_password===undefined ? undefined : 'error'"
                 :feedback="new_user_feedback.re_password">
      <n-input v-model:value="new_user_form.re_password" placeholder="请再次输入密码"></n-input>
    </n-form-item>
    <n-form-item label="用户类型" required>
      <n-radio-group v-model:value="new_user_form.permission">
        <n-radio :value="1">志愿者</n-radio>
        <n-radio :value="2">小组长</n-radio>
        <n-radio :value="3">管理员</n-radio>
      </n-radio-group>
    </n-form-item>
    <n-form-item label="调查小组">
      <n-select v-model:value="new_user_form.groups" multiple filterable :options="groups">
      </n-select>
    </n-form-item>
    <template #action>
      <n-button type="primary" @click="create_user">创建</n-button>
    </template>
  </n-modal>

<!--  编辑用户card-->
  <n-modal v-model:show="editing_user" preset="card" style="max-width: 600px" @close="clean_new_form" title="编辑用户">
    <n-form-item label="用户名">
      <n-input v-model:value="editing.name"></n-input>
    </n-form-item>
    <n-form-item label="用户权限">
      <n-select :options="permissions" v-model:value="editing.permission"></n-select>
    </n-form-item>
  </n-modal>

  <n-space justify="space-around">
    <n-button @click="new_user=true;">创建用户</n-button>
    <n-button @click="new_invitation=true;">创建邀请</n-button>
  </n-space>
  <br>
  <n-data-table :columns="columns" :data="users">

  </n-data-table>
</template>

<script setup>
import {
  NModal,
  NButton,
  NSpace,
  NDataTable,
  NFormItem,
  NInput,
  NSelect,
  NRadio,
  NRadioGroup,
} from 'naive-ui'
import {h, onMounted, ref} from "vue";
import {client, encrypt} from "../../apis";

const new_user = ref(false)
const new_invitation = ref(false)

const columns = [
  {
    title: "用户名",
    key: "name",
  },
  {
    title: "邮箱",
    key: "email",
  },
  {
    title: "调查小组",
    key: "group_name",
  },
  {
    title: "操作",
    key: "actions",
    render(row) {
      return [
        h(
            NButton,
            {
              size:"small",
              onClick() {
                editing_user.value = true;
                console.log(row)
                editing.value = {
                  ...row,
                };
              }
            },
            {
              default: () => "编辑"
            }
        ),
          h(
              NButton,
              {
                type:"error",
                size: "small",
                onClick() {
                  is_deleting.value = true;
                  deleting.value = row;
                }
              },
              {
                default: () => "删除"
              }
          )
      ]
    }
  }
]

const users = ref([])

async function parse_users(data) {
  return await Promise.all(data.map(async user => {
    if (user.groups) {
      let group_name = "";
      for (let group of user.groups) {
        group_name += (await client.get("/groups/" + group)).data.name + "、"
      }
      group_name = group_name.substr(0, group_name.length - 1)
      user.group_name = group_name
    } else {
      user.group_name = "无"
    }
    return {
      name: user.name,
      email: user.email,
      groups: user.groups,
      id: user.id,
      permission: user.permission,
      group_name: user.group_name,
    }
  }))
}

const groups = ref([]);

onMounted(async () => {
  try {
    users.value = await parse_users((await client.get("/users")).data)
  } catch (e) {

  }

  try {
    groups.value = (await client.get("/groups")).data
  } catch (e) {

  }
})


// 新用户

const new_user_form = ref({
  name: "",
  email: "",
  groups: [],
  password: "",
  re_password: "",
  permission: 1,
})

const new_user_feedback = ref({
  name: undefined,
  email: undefined,
  password: undefined,
  re_password: undefined,
})

function clean_new_form() {
  setTimeout(() => {
    new_user_form.value = {
      name: "",
      email: "",
      group: undefined,
      password: "",
      re_password: "",
      permission: 1,
    }
  }, 500)
}


async function evaluate_new_user_form() {
  let form = new_user_form.value;
  if (form.name.length < 1) {
    new_user_feedback.value.name = "姓名不能为空"
  } else {
    new_user_feedback.value.name = undefined
  }
  if (form.password.length < 8) {
    new_user_feedback.value.password = "密码不能少于8位"
  } else {
    new_user_feedback.value.password = undefined
  }
  if (form.password !== form.re_password) {
    new_user_feedback.value.re_password = "两次密码不相同"
  } else {
    new_user_feedback.value.re_password = undefined
  }

  let encrypted = (await encrypt(form.password)).data.encrypted;
  if (form.group) {
    return {
      name: form.name,
      email: form.email,
      password: encrypted,
      permission: form.permission,
      group: form.group
    }
  } else {
    return {
      name: form.name,
      email: form.email,
      password: encrypted,
      permission: form.permission
    }
  }
}

async function create_user() {
  let form = await evaluate_new_user_form();
}

const permissions = [
  {
    value: 1,
    label: "志愿者"
  },
  {
    value: 2,
    label: "小组长"
  },
  {
    value: 3,
    label: "管理员"
  }
]

const editing_user = ref(false);
const editing = ref(undefined);
const is_deleting = ref(false);
const deleting = ref(undefined);

async function confirm_delete() {
  if (deleting.value) {
    try {
      await client.delete("/users/" + deleting.value.id)
      users.value = users.value.filter(user => user.id !== deleting.value.id)
      is_deleting.value = false
    } catch (e) {
      console.log(e)
    }
  }
}
</script>

<style scoped>

</style>
