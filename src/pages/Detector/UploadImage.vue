<template>
  <n-upload class="upload" :action="storage.get_upload_url()" :on-finish="upload_finish" :on-error="upload_error" @before-upload="check_type" :show-file-list="false" with-credentials>
    <n-upload-dragger class="drag">
      <div style="margin-bottom: 20px;">
        <n-icon size="48">
          <Image/>
        </n-icon>
        <n-h3>请将图片文件拖拽至此</n-h3>
        <n-text>支持PNG, JPEG, GIF, TIFF等通用格式 暂不支持NEF等专用格式</n-text>
        <div style="height: 20px"/>
        <n-text depth="3">不支持上传多张图片</n-text>
      </div>
    </n-upload-dragger>
  </n-upload>
</template>

<script setup>
import {
  NUpload,
  NUploadDragger,
  NIcon,
  NH3,
  NText, useMessage
} from 'naive-ui';

import Image from "@vicons/ionicons5/Image";

import {client, storage} from "../../apis";
import {ref} from "vue";

const emit = defineEmits(['finish'])

const message = useMessage();

const status = ref(undefined);
function check_type({file, file_list}) {
  if (file.file.type.includes('image')) {
    status.value = message.loading("正在上传图片...");
    return true
  } else {
    message.error('不支持该类型文件上传');
    return false
  }
}

function upload_finish({file, event}) {
  let resp = JSON.parse(event.target.response);
  status.value.destroy();
  message.success("上传成功");
  emit('finish', {fid: resp.id});
}

function upload_error({file, event}) {
  status.value.destroy();
  message.error("上传失败");
}
</script>

<style scoped>
  .upload {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .drag {
    width: 100%;
    max-width: 500px;
  }
</style>
