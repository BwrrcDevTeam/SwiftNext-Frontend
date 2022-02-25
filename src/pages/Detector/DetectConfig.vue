<template>
  <n-grid cols="1 400:2 800:3" x-gap="20" y-gap="20">
    <n-grid-item>
      <n-card title="模式1" class="preset" hoverable id="preset1" :class="{target: preset===1}" @click="select(1)">
        <n-text type="info">适用于</n-text>
        <n-ul>
          <n-li>图片分辨率中等或较低</n-li>
          <n-li>雨燕在图片中较大</n-li>
          <n-li>检测速度较快</n-li>
        </n-ul>
        <n-text type="info">参数值</n-text>
        <n-ul>
          <n-li>
            <n-text>窗口大小：
              <n-text depth="3">{{ preset_1.window_size }}</n-text>
            </n-text>
          </n-li>
          <n-li>
            <n-text>区块重叠：
              <n-text depth="3">{{ preset_1.overlap }}</n-text>
            </n-text>
          </n-li>
          <n-li>
            <n-text>单区块最大数量：
              <n-text depth="3">{{ preset_1.tile_max_num }}</n-text>
            </n-text>
          </n-li>
          <n-li>
            <n-text>模型名称：
              <n-text depth="3">{{ preset_1.model_name }}</n-text>
            </n-text>
          </n-li>
        </n-ul>
      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="模式2" class="preset" hoverable id="preset2" :class="{target: preset===2}" @click="select(2)">
        <n-text type="info">适用于</n-text>
        <n-ul>
          <n-li>图片分辨率较高</n-li>
          <n-li>雨燕在图片中较小</n-li>
          <n-li>检测速度较慢</n-li>
        </n-ul>
        <n-text type="info">参数值</n-text>
        <n-ul>
          <n-li>
            <n-text>窗口大小：
              <n-text depth="3">{{ preset_2.window_size }}</n-text>
            </n-text>
          </n-li>
          <n-li>
            <n-text>区块重叠：
              <n-text depth="3">{{ preset_2.overlap }}</n-text>
            </n-text>
          </n-li>
          <n-li>
            <n-text>单区块最大数量：
              <n-text depth="3">{{ preset_2.tile_max_num }}</n-text>
            </n-text>
          </n-li>
          <n-li>
            <n-text>模型名称：
              <n-text depth="3">{{ preset_2.model_name }}</n-text>
            </n-text>
          </n-li>
        </n-ul>

      </n-card>
    </n-grid-item>
    <n-grid-item>
      <n-card title="自定义" class="preset" hoverable id="custom" :class="{target: preset===3}" @click="select(3)">
        <n-text type="info">参数值</n-text>
        <div style="height: 20px;"></div>

        <n-form-item label="窗口大小">
          <n-slider v-model:value="custom.window_size" :min="100" :max="1500" :step="50"></n-slider>
          <div style="width: 20px;"></div>
          <n-input-number v-model:value="custom.window_size" min="100" max="1500" step="50">
            <template #suffix>
              Px
            </template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="区块重叠">
          <n-slider v-model:value="custom.overlap" :min="0" :max="custom.window_size / 4" :step="1"></n-slider>

          <div style="width: 20px;"></div>
          <n-input-number v-model:value="custom.overlap" min="0" :max="custom.window_size / 4" step="1">
            <template #suffix>
              Px
            </template>
          </n-input-number>
        </n-form-item>

        <n-form-item label="单区块最大数量">
          <n-slider v-model:value="custom.tile_max_num" :min="50" :max="2000" :step="50"></n-slider>

          <div style="width: 20px;"></div>
          <n-input-number v-model:value="custom.tile_max_num" min="50" :max="2000" step="50">
          </n-input-number>
        </n-form-item>

        <n-form-item label="模型">
          <n-select :options="[{label: 'ResNet-18', value: 'resnet18'}, {label: 'Darknet Reference', value: 'darknet'}]"
                    v-model:value="custom.model_name">

          </n-select>
        </n-form-item>

      </n-card>
    </n-grid-item>
  </n-grid>
</template>

<script setup>
import {
  NGrid,
  NGridItem,
  NCard,
  NText,
  NLi,
  NUl,
  NFormItem,
  NInputNumber,
  NSelect,
  NSlider
} from 'naive-ui';
import {onMounted, reactive, ref, watch} from "vue";

const props = defineProps(['preset', 'config']);

const preset = ref(props.preset);

const preset_1 = {
  window_size: 800,
  overlap: 20,
  tile_max_num: 500,
  model_name: 'resnet18',
};

const preset_2 = {
  window_size: 600,
  overlap: 10,
  tile_max_num: 500,
  model_name: 'resnet18',
};

const custom = reactive({
  window_size: 800,
  overlap: 20,
  tile_max_num: 500,
  model_name: 'resnet18',
});

const emit = defineEmits(["finish"])

function select(_preset) {
  preset.value = _preset;
  if (_preset === 1) {
    emit("finish", {config: preset_1, preset: 1})
  } else if (_preset === 2) {
    emit("finish", {config: preset_2, preset: 2})
  } else {
    emit("finish", {config: custom, preset: 3})
  }
}

watch(custom, (value => {
  emit("finish", {config: value, preset: 3})
}))

onMounted(() => {
  if (props.preset !== undefined) {
    // 这是有备而来
    select(props.preset)
  }
  if (props.config !== undefined && props.preset === 3) {
    // 这是有备而来
    custom.window_size = props.config.window_size;
    custom.overlap = props.config.overlap;
    custom.tile_max_num = props.config.tile_max_num;
    custom.model_name = props.config.model_name;
  }
})
</script>

<style scoped>
.target {
  border-color: var(--n-color-target);
}

.preset {
  text-align: left;
  height: 100%;
}
</style>
