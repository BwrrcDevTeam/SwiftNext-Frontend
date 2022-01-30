<template>
  <n-card :title="t(strings.title)" :closable="stage!=='select_method'" @close="close_card" class="new_report" :class="stage">

    <transition mode="out-in" name="fade">
      <n-space justify="center" class="select_method" v-if="stage==='select_method'">
        <n-button type="primary" size="large" round @click="stage='upload_images'">
          {{ t(strings.from_images) }}
        </n-button>
        <n-el tag="span" class="or">
          {{ t({
            "cn": "或",
            "en": "or"
          }) }}
        </n-el>
        <n-button secondary type="primary" size="large" round>
          {{ t(strings.manuel) }}
        </n-button>
      </n-space>
      <n-upload v-else-if="stage==='upload_images'" :action="storage.get_upload_url()" v-model:file-list="image_list" class="upload" @before-upload="check_type"
                :with-credentials="true" :on-remove="delete_image" ref="upload" @click="submit" @finish="upload_finish">
        <n-upload-dragger class="drag">
          <div style="margin-bottom: 12px;">
            <n-icon size="40">
              <Images/>
            </n-icon>
          </div>

          <n-text>
            {{ t(strings.upload_tips) }}
          </n-text>
          <n-p>
            {{ t(strings.upload_tips_2) }}
          </n-p>
        </n-upload-dragger>
        <n-button type="info" size="large" secondary v-if="image_list.length > 0" style="margin-top: 20px;" @click="detect_and_create">提交检测</n-button>
      </n-upload>
    </transition>
    <n-collapse-transition :show="stage==='filling'">
      <NewReport :default_detect_list="detect_list"></NewReport>
    </n-collapse-transition>

  </n-card>
  <n-collapse-transition :show="stage!=='filling'">
    <n-card :title="t(strings.history)" style="margin-top: 20px;">
      <div style="display: flex;justify-content: center;width: 100%; height: 200px;align-content: center;flex-direction: column">
        <n-empty size="huge" style="height: fit-content;">
        </n-empty>
      </div>
    </n-card>
  </n-collapse-transition>

</template>

<script setup>
import {NButton, NCard, NEl, NEmpty, NIcon, NP, NSpace, NText, NUpload, NUploadDragger, useMessage, NCollapseTransition} from 'naive-ui'
import {inject, onMounted, onUnmounted, ref} from "vue";
import strings from "../../strings/Home/Reports.json";
import NewReport from "./NewReport.vue";

import Images from "@vicons/ionicons5/Images";

import {storage} from "../../apis";

const upload = ref(null);

function submit() {
  upload.value.submit();
}

const t = inject("translate")

// const stage = ref('select_method')
const stage = ref('filling')

const image_list = ref([]);
const message = useMessage();

async function close_card() {
  await clean_images()
  stage.value='select_method'
}

onMounted(() => {
  window.onbeforeunload = (e) => {
    e = window.event || e;
    if (stage.value === 'upload_images') {
      // e.returnValue = t({
      //   "cn": "离开页面后将会删除所有上传的图片",
      //   "en": "Leaving the page will delete all uploaded images"
      // });
    }
  }

  window.onunload = async (e) => {
  //  清理全部图片

  }
})

onUnmounted(() => {
  window.onbeforeunload = null;
  window.onunload = null;
})

function upload_finish({ file, event }) {
  file.fid = JSON.parse(event.target.response).id;
}

async function clean_images() {
  if (stage.value === 'upload_images') {
    for (const item of image_list.value) {
      console.log(item)
      await storage.delete_file(item.response.id)
    }
  }
}

async function check_type({file, file_list}) {
  if (file.file.type !== 'image/jpeg' && file.file.type !== 'image/png') {
    message.error(t(strings.type_error));
    return false;
  }
  const {size} = file.file;
  if (size > 1024 * 1024 * 50) {
    message.error(t(strings.size_error));
    return false;
  }
  return true;
}

async function delete_image({file, file_list}) {
  console.log(file)
  if (file.status === 'uploading') {
    return true;
  }
  try {
    await storage.delete_file(file.fid);
    message.success(t(strings.delete_success));
    return true
  } catch (e) {
    console.log(e)
    message.error(t(strings.delete_error));
    return false
  }
}

const detect_list = ref([])

async function detect_and_create() {
  if (image_list.value.length === 0) {
    message.error(t(strings.no_image));
    return
  }
  for (const image of image_list.value) {
    let result = await storage.detect_image(image.fid)
    console.log(result)
  }
  // stage.value = 'filling'
}
</script>

<style scoped>
  .or {
    margin: 0 10px;
    line-height: 40px;
  }
  .n-space.select_method {
    height: 224px;
    align-items: center;
  }
  .upload {
    height: max-content;
    align-items: center;
    text-align: center;
    margin: auto;
    width: 100%;
    max-width: 500px;
  }
  .drag {
    width: 100%;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .2s ease-in-out;
  }
  .fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
    opacity: 0;
  }
  .new_report {
    height: max-content;
    transition: all .2s cubic-bezier(0.4, 0, 0.2, 1);
  }

</style>

<style>
.n-upload-trigger {
  width: 500px;
  padding: 20px;
  max-width: 500px;
}
@media screen and (max-width: 600px) {
  .n-upload-trigger {
    width: 100%;
    padding: 0;
    max-width: 100%;
  }
}

</style>
