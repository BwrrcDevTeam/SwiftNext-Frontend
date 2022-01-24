<template>
  <div class="config" :class="{inline: props.inline, n_inline: !props.inline}">
      <n-button class="select_lang" tertiary @click="change_lang">{{ lang_name[get_lang()] }}</n-button>
      <div style="width: 30px;"/>
      <n-switch v-model:value="dark_mode" :on-update:value="change_theme" class="select_theme">
        <template #checked>
          {{
            t({
              'en': 'Dark',
              'cn': '暗色'
            })
          }}
        </template>
        <template #unchecked>
          {{
            t({
              'en': 'Light',
              'cn': '亮色'
            })
          }}
        </template>
      </n-switch>
  </div>
</template>

<script setup>
import {computed, inject, ref} from "vue";
import {get_lang} from "../i18n";
import {useRouter} from "vue-router";
import {NButton, NSwitch} from 'naive-ui'

const router = useRouter();
const t = inject("translate");
const theme = inject("theme");
let lang = ref(get_lang());
let dark_mode = computed(() => theme.value === "dark");

// 这个不是bug
const lang_name = {
  cn: 'English',
  en: '简体中文'
}

const props = defineProps({
  inline: {
    type: Boolean,
    default: true,
  },
})

function change_theme(value) {
  theme.value = value ? "dark" : "light";
  localStorage.setItem("theme", theme.value);
}

function change_lang() {
  if (get_lang() === "cn") {
    localStorage.setItem("lang", "en");
  } else {
    localStorage.setItem("lang", "cn");
  }
  router.go(0);
}
</script>

<style scoped>
  .config.inline {
    height: 70px;
    line-height: 70px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  .config {
    padding-bottom: 10px;
    text-align: right;
  }
  .select_lang {
    width: 100px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 10px;
  }
  .n_inline .select_lang {
    margin-bottom: 10px;
  }
  .n_inline .select_theme {
    width: 100px;
  }
  .n_inline {
    border: 0;
  }
</style>
