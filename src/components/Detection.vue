<template>
  <n-spin :show="loading">
    <div class="main" @contextmenu.prevent @mousedown.prevent="handle_click" @wheel.prevent="handle_wheel" @mouseup="handle_up" @mousemove="handle_move" @mouseout="handle_up" @keydown.prevent="handle_keydown" @keyup="handle_keyup" ref="main">
      <canvas class="points"  @click.left="left_click" :style="{transform: 'translateX(' + transition_x + 'px) translateY(' + transition_y + 'px) scale('+scale+')', width: image_width, height: image_height, transformOrigin: `${origin_x} ${origin_y}`}" :width="image_width" :height="image_height" ref="canvas"></canvas>
    </div>
    <div class="tool">
      <n-button-group>
        <n-button round @click="zoom_in">
          <template #icon>
            <n-icon>
              <Plus/>
            </n-icon>
          </template>
        </n-button>
        <n-button @click="scale=1;transition_x=0;transition_y=0;">
          1:1
        </n-button>
        <n-button @click="auto_scale">
          <template #icon>
            <n-icon>
              <Recording/>
            </n-icon>
          </template>
        </n-button>
        <n-button @click="save_result">
          <template #icon>
            <n-icon>
              <Save/>
            </n-icon>
          </template>
        </n-button>
        <n-button round @click="zoom_out">
          <template #icon>
            <n-icon>
              <Minus/>
            </n-icon>
          </template>
        </n-button>
      </n-button-group>
    </div>
  </n-spin>
</template>

<script setup>
import {NButton, NButtonGroup, NIcon, NSpin, useMessage} from "naive-ui"
import {onMounted, onUnmounted, ref, watch} from "vue";
import {client, log_api, storage} from "../apis"

import Plus from "@vicons/tabler/Plus"
import Minus from "@vicons/tabler/Minus"
import Save from "@vicons/fluent/Save16Regular"

import Recording from "@vicons/carbon/Recording"

const props = defineProps({
  detection: {
    type: String,
    required: true
  },
  editable: {
    type: Boolean,
    default: true
  },
})

const detection = ref(null);
const image = ref(null);

const loading = ref(true);

const main = ref(null);

async function update_detection() {
  loading.value = true;
  log_api("检测", "Client => Server", "获取检测结果");
  let result = (await client.get("/detector/" + props.detection)).data;
  if (result.status === 'finished') {
    log_api("检测", "Server => Client", "检测已经完成");
    detection.value = result.result;
    image.value = storage.get_inline_url(result.attachment);
    image_height.value = result.image_shape[0];
    image_width.value = result.image_shape[1];

    // 计算默认缩放比例
    auto_scale()
    loading.value = false;
    setTimeout(draw, 100)
  } else {
    log_api("检测", "Server => Client", "检测未完成, 1秒后重试");
    detection.value = null;
    image.value = null;
    loading.value = true;
    setTimeout(update_detection, 1000);
  }
}

//交互

const scale = ref(1);
const transition_x = ref(0); // 左右平移
const transition_y = ref(0); // 上下平移

function zoom_in() {
  scale.value *= 1.1;
}
function zoom_out() {
  scale.value /= 1.1;
}

let middle_click = false;

function handle_click(event) {
  switch (event.button) {
    case 0:
      // left click
      break;
    case 1:
      // middle click
        middle_click = true;
      break;
    case 2:
      // right click
      break;
  }
}

function handle_up() {
  middle_click = false;
}

function left_click(event) {
  if (props.editable) {
  //  将点击的位置转换为相对于画布canvas的位置
    let scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    let scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    let x = event.pageX || event.clientX + scrollX;
    let y = event.pageY || event.clientY + scrollY;
    let rect = canvas.value.getBoundingClientRect();
    x = x - rect.left;
    y = y - rect.top;

    x = x / scale.value;
    y = y / scale.value;

    // 遍历检测结果，找到距离小于5的点，将其删除
    let del_num = 0;
    let result = detection.value;
    let new_result = [];
    for (let i = 0; i < result.length; i++) {
      let point = result[i];
      if (Math.abs(point.x - x) > 5 || Math.abs(point.y - y) > 5) {
        new_result.push(point);
      } else {
        del_num++;
      }
    }
    // 如果一个都没删除，则添加一个新的点 置信度为1
    if (del_num === 0) {
      new_result.push({x: x, y: y, score: 1});
    }
    detection.value = new_result;
  }
}

function handle_move(event) {
  if (middle_click) {
    transition_x.value += event.movementX;
    transition_y.value += event.movementY;
  }
}

let cmd_key = false;
let ctrl_key = false;

function handle_keydown(event) {
  // 如果按下了 ctrl 键
  if (event.keyCode === 17) {
    ctrl_key = true;
  }
  // 如果按下了 cmd 键
  if (event.keyCode === 224) {
    cmd_key = true;
  }
}

function handle_keyup(event) {
  console.log('up')
  if (ctrl_key) {
    ctrl_key = false;
  }
  // 如果按下了 cmd 键
  if (cmd_key) {
    cmd_key = false;
  }
}

function handle_wheel(event) {
//  CTRL/CMD+滚轮可以控制缩放
//  这里的缩放是以鼠标为中心的
  if (ctrl_key || cmd_key) {
    //  计算x，y的偏移
    let scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
    let scrollY = document.documentElement.scrollTop || document.body.scrollTop;
    let mouse_x = event.pageX || event.clientX + scrollX;
    let mouse_y = event.pageY || event.clientY + scrollY;
    let rect = canvas.value.getBoundingClientRect();
    // 计算公式：(scale后的高度 - 开始的高度) * 鼠标在图片高度位置的比例
    let canvas_height = rect.height;
    let canvas_width = rect.width;
    let mouse_height_scale =  (mouse_y - rect.top) / canvas_height;
    let mouse_width_scale = (mouse_x  - rect.left) / canvas_width;

    let after_height = canvas_height;
    let after_width = canvas_width;
    if (event.deltaY > 0) {
      scale.value *= 1.1;
      after_height *= 1.1;
      after_width *= 1.1;
    } else {
      scale.value /= 1.1;
      after_height /= 1.1;
      after_width /= 1.1;
    }



    // transition_x.value += (after_width - canvas_width) * mouse_width_scale;
    // transition_y.value += (after_height - canvas_height) * mouse_height_scale;
  }

}

function auto_scale() {
  scale.value = Math.min(main.value.offsetWidth / image_width.value, main.value.offsetHeight / image_height.value);
  transition_x.value = 0;
  transition_y.value = 0;
}

// 绘图区
const canvas = ref(null);

let image_width = ref(10);
let image_height = ref(10);


function draw() {
  console.log(image_width.value, image_height.value)

  let ctx = canvas.value.getContext('2d');
  let _image = new Image();
  _image.src = image.value;
  _image.onload = (event) => {
    ctx.drawImage(_image, 0, 0, image_width.value, image_height.value);
    console.log(_image)
    let width = canvas.value.width; // 画布宽度
    let height = canvas.value.height; // 画布高度
    for (let point of detection.value) {
    //  画一个圆
      ctx.beginPath();
      ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      ctx.strokeStyle = `rgba(255,0,0,${point.score})`;
      ctx.stroke()
    }
  }

}
watch(detection, draw)

const message = useMessage();

async function save_result() {
//  向后端通信，更新识别结果
  let msg = message.loading("保存识别结果中...", {duration: 0});
  try {
    await client.put("/detector/" + props.detection, detection.value)
    msg.type = "success";
    msg.content = "保存成功";
    setTimeout(msg.destroy, 500);
  } catch (e) {
    msg.type="error";
    msg.content = "保存失败";
    setTimeout(msg.destroy, 500)
  }

}

const origin_x = ref(1);
const origin_y = ref(1);

function calc_origin() {
//  计算变化源
//  1. 求出main的中点
  let main_rect = main.value.getBoundingClientRect();
  let main_center_x = main_rect.left + (main_rect.width) / 2
  let main_center_y = main_rect.top + (main_rect.height) / 2
//  2. 求出main中点相对于canvas的位置
  let canvas_rect = canvas.value.getBoundingClientRect();
  origin_x.value = main_center_x - canvas_rect.left;
  origin_y.value = main_center_y - canvas_rect.top;
}


onMounted(async () => {
  window.addEventListener('keydown', handle_keydown);
  window.addEventListener('keyup', handle_keyup);
  try {
    await update_detection();
  } catch (e) {
    console.error(e);
  }
  calc_origin()
})

onUnmounted(() => {
  window.removeEventListener('keydown', handle_keydown);
  window.removeEventListener('keyup', handle_keyup);
})
</script>

<style scoped>
  .main {
    text-align: center;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    overflow: hidden;

  }
  .image {
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.1s;
  }
  .points {
    object-fit: contain;
    transition: transform 0.1s;
    cursor: crosshair;

  }
  .tool {
    text-align: center;
  }
</style>

<style>
  .n-spin-content {
    width: 100%;
    height: 100%;
  }
</style>
