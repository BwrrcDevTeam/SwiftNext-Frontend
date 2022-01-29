<template>
<!--  点标记地图-->
  <div class="container" :class="{hide: switching_theme}" ref="container" @click.right.prevent="show_menu" @click="menu=false">
    <n-popover trigger="manual" :x="menu_x" :y="menu_y" :show="menu" placement="right-start">
      <span class="new_point" @click="new_point">新建调查点</span>
    </n-popover>
    <el-amap @init="init" :zoom="zoom" :center="center">
      <el-amap-marker v-for="point in points" :position="[point.longitude, point.latitude]">
        <n-popover :show="show_popover===point.key" :x="popover_x" :y="popover_y" v-if="props.editable">
          <template #header>
            <span v-if="editing !== point.key" style="line-height: 34px;">{{point.name.length>0 ? point.name : "未指定名称"}}</span>
            <n-input v-else v-model:value="point.name" style="max-width: 300px;min-width: 100px;" autofocus autosize :maxlength="10" :minlength="3"></n-input>
          </template>
          <n-button size="small" type="primary" @click="switch_editing(point.key)">
            {{editing === point.key ? '完成' : '编辑'}}
          </n-button>
          <n-button style="float: right;margin-left:10px;" size="small" type="error" @click="delete_point(point.key)">
            删除
          </n-button>
        </n-popover>
        <n-popover v-else :show="show_popover===point.key" :x="popover_x" :y="popover_y">
            <span v-if="editing !== point.key" style="line-height: 34px;">{{point.name.length>0 ? point.name : "未指定名称"}}</span>
            <n-input v-else v-model:value="point.name" style="max-width: 300px;min-width: 100px;" autofocus autosize :maxlength="10" :minlength="3"></n-input>
        </n-popover>
        <n-icon size="large" class="point" @click.prevent="on_click(point.key)" :class="'marker-'+point.key">
          <CircleFilled/>
        </n-icon>
      </el-amap-marker>
    </el-amap>
  </div>

</template>

<script setup>
import {ElAmap, ElAmapMarker} from '@vuemap/vue-amap'
import {inject, onMounted, onUnmounted, reactive, ref, watch} from "vue";
import CircleFilled from "@vicons/carbon/CircleFilled";
import {NIcon, NPopover, NButton, NInput} from 'naive-ui'

let map = null;

const container = ref(null);

const emit = defineEmits(['update:points', 'new_point', 'delete_point'])

const props = defineProps({
  points: {
    type: Array,
    default: () => []
  },
  editable: {
    type: Boolean,
    default: false
  },
})

const points = ref(props.points);

function scale_2_zoom(scale) {
  if (scale <= 10) return 19;
  else if (scale <= 25) return 18;
  else if (scale <= 50) return 17;
  else if (scale <= 100) return 16;
  else if (scale <= 200) return 15;
  else if (scale <= 500) return 14;
  else if (scale <= 1000) return 13;
  else if (scale <= 2000) return 12;
  else if (scale <= 5000) return 11;
  else if (scale <= 10000) return 10;
  else if (scale <= 20000) return 9;
  else if (scale <= 30000) return 8;
  else if (scale <= 50000) return 7;
  else if (scale <= 100000) return 6;
  else if (scale <= 200000) return 5;
  else if (scale <= 500000) return 4;
  else if (scale <= 1000000) return 3;
  else if (scale > 1000000) return 2;
  return 20;
}


function get_center_and_zoom_level(points) {
  let min_longitude = 180;
  let max_longitude = -180;
  let min_latitude = 90;
  let max_latitude = -90;
  for (let point of points) {
    min_longitude = Math.min(min_longitude, point.longitude);
    max_longitude = Math.max(max_longitude, point.longitude);
    min_latitude = Math.min(min_latitude, point.latitude);
    max_latitude = Math.max(max_latitude, point.latitude);
  }
  let center_longitude = (min_longitude + max_longitude) / 2;
  let center_latitude = (min_latitude + max_latitude) / 2;
  let longitude_to_meter = (max_longitude - min_longitude) * 111000;
  let latitude_to_meter = (max_latitude - min_latitude) * 111000;
  let zoom_level = scale_2_zoom(Math.max(longitude_to_meter, latitude_to_meter)) + 2;
  // 只有一个点的时候，不能缩放
  if (points.length === 1) {
    zoom_level = 12;
  }
  return {center_longitude, center_latitude, zoom_level};
}

const center = ref([116.344852,39.928658]);
const zoom = ref(5);

const theme = inject('theme');
const switching_theme = ref(false);

watch(theme, (new_theme) => {
  switching_theme.value = true;
  if (map) {
    setTimeout(() => {
      if (new_theme === 'dark') {
        map.setMapStyle('amap://styles/dark');
      } else {
        map.setMapStyle('amap://styles/whitesmoke');
      }
    }, 100);
  }
  setTimeout(() => {
    switching_theme.value = false;
  }, 200);
});





const show_popover = ref(null);
const popover_x = ref(0);
const popover_y = ref(0);

function on_click(key) {
  if (show_popover.value === key) {
    show_popover.value = null;
  } else {
    let element = container.value.getElementsByClassName('marker-' + key)[0];
    popover_x.value = element.getBoundingClientRect().left + 9;
    popover_y.value = element.getBoundingClientRect().top;
    show_popover.value = key;
  }
  if (editing.value === key) {
    switch_editing(key);
  }
}

function handle_drag(e) {
  if (show_popover.value) {
      let point = props.points.filter(point => point.key === show_popover.value)[0];
      let element_longitude = point.longitude;
      let element_latitude = point.latitude;
      let lngLat = new AMap.LngLat(element_longitude, element_latitude);
      let element_position = map.lngLatToContainer(lngLat);
      if (element_position.x<0 || element_position.x>container.value.clientWidth || element_position.y<0 || element_position.y>container.value.clientHeight) {
        show_popover.value = null;
      } else {
        popover_x.value = element_position.x + container.value.getBoundingClientRect().left + 9;
        popover_y.value = element_position.y + container.value.getBoundingClientRect().top;
      }
  }
}


function init(e) {
  // 初始化地图
  // 计算中心点：根据多个标记点的坐标，计算出中心点的坐标
  const {center_longitude, center_latitude, zoom_level} = get_center_and_zoom_level(props.points);
  setTimeout(() => {
    center.value = [center_longitude, center_latitude];
  }, 100);
  setTimeout(() => {
    zoom.value = zoom_level;
  }, 500);
  map = e;
  if (theme.value === 'dark') {
    map.setMapStyle('amap://styles/dark');
  } else {
    map.setMapStyle('amap://styles/whitesmoke');
  }

  map.on("mapmove", handle_drag);
}

const editing = ref(null)
function switch_editing(key) {
  if (editing.value === key) {
    // context.emit('update:points', points.value);
    emit('update:points', props.points);
    editing.value = null;
  } else {
    editing.value = key;
  }
}
const menu_x = ref(0);
const menu_y = ref(0);
const menu = ref(false);
function show_menu(e) {
  if (!props.editable) {
    return;
  }
  show_popover.value = null;
  menu.value = true;
  menu_x.value = e.clientX - 5;
  menu_y.value = e.clientY - 15;
}

function new_point(e) {
  let x = menu_x.value;
  let y = menu_y.value;
  let pixel = new AMap.Pixel(x - container.value.getBoundingClientRect().left, y - container.value.getBoundingClientRect().top);
  let lngLat = map.containerToLngLat(pixel);
  let new_key = Math.random().toString(36).substr(2, 9);
  points.value.push({
    name: "新调查点",
    longitude: lngLat.lng,
    latitude: lngLat.lat,
    key: new_key,
  })
  // 立马关闭菜单 转入新增点的编辑状态
  menu.value = false;
  setTimeout(() => {
    on_click(new_key);
    switch_editing(new_key);
  }, 100);
  emit('new_point', {
    longitude: lngLat.lng,
    latitude: lngLat.lat,
    key: new_key,
  });
  emit('update:points', points.value);
}

function delete_point(key) {
  console.log(key);
  points.value = points.value.filter(_point => _point.key !== key)
  emit('delete_point', key);
  emit('update:points', points.value);
}

function on_wheel(e) {
  if (show_popover.value !== null) {
    show_popover.value = null;
  }
  if (!menu.value) {
    menu.value = false;
  }
}

onMounted(() => {
  window.addEventListener("wheel", on_wheel);
})

onUnmounted(() => {
  window.removeEventListener("wheel", on_wheel);
})

</script>

<style scoped>
.container.hide {
  /*filter: blur(100px);*/
  opacity: 0;
}
.container {
  transition: all .1s ease-in-out;
  /*filter: brightness(1);*/
  opacity: 1;
}
.point {
  transition: color .2s;
}
.point:hover {
  color: #62d3ad;
}
.new_point {
  transition: color .2s;
}
.new_point:hover {
  color: #62d3ad;
}
.new_point:active {
  filter: brightness(.8);
}
</style>

