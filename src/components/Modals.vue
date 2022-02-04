<template>
  <div>
    <n-modal :show="props.show_admin_contact" @update:show="admin_contact_update">
      <n-card
        class="contact_modal"
        size="huge"
        :title="t(Modal_strings.contact_modal_title)">
        {{ t(Modal_strings.contact_modal_line1) }}
        <br>
        {{ t(Modal_strings.contact_modal_line2) }}
        <br>
        {{ t(Modal_strings.contact_modal_line3) }}
        <br>
        <br>
        {{ t(Modal_strings.contact_modal_line4) }}:
        <br>
        {{props.full_traceback}}
        <template #footer>
          <span style="color: #adadad">
            {{ t(Modal_strings.contact_modal_footer) }} :(
          </span>
        </template>
      </n-card>
    </n-modal>
    <n-modal :show="props.show_login">
      <Login :title="props.login_text.title" :subtitle="props.login_text.subtitle"></Login>
    </n-modal>
  </div>
</template>

<script setup>
import Login from './Login.vue'
import {inject, onMounted, ref} from "vue";
import {Modal_strings} from "../i18n"
import {NModal, NCard} from 'naive-ui'
const t = inject("translate");
const emit = defineEmits(["update:show_admin_contact", "update:show_login"]);

const props = defineProps({
  show_admin_contact: {
    default: ref(false),
  },
  show_login: {
    default: ref(false),
  },
  login_text: {
    type: Object,
    default: () => ({
      title: "",
      subtitle: "",
    }),
  },
  full_traceback: {
    type: String,
    default: localStorage.getItem("full_traceback"),
  },
});


function admin_contact_update(show) {
  emit("update:show_admin_contact", show);
}

function login_update(show) {
  emit("update:show_login", show);
}
</script>

<style scoped>
  .contact_modal {
    width: 500px;
  }
  @media screen and (max-width: 500px) {
    .contact_modal {
      width: 90%;
    }
  }
</style>
