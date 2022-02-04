<template>
  <div class="main">
    <n-config-provider :hljs="hljs">
      <h1>调试页面</h1>
      <p>用来Debug的页面!</p>
      <h2>Session信息: </h2>
      <n-code :hljs="hljs" :code="JSON.stringify(session, null, 4)" language="javascript">
      </n-code>
      <h2>组件单元测试</h2>
      <h3>标注地图组件</h3>
      <p>标注地图组件是reactive的! 这两个地图的数据是相关联的</p>
      <PointedMap :points="demo_points" style="height: 300px;width: 500px;">

      </PointedMap>
      <h3>可修改的标注地图</h3>
      <PointedMap v-model:points="demo_points" style="height: 300px;width: 500px" editable>

      </PointedMap>
      <h3>多个用户展示</h3>
      <n-list style="max-width: 300px;">
        <n-list-item>
          <UserLine uid="61eccd70d646dc17f4430bd2"></UserLine>
        </n-list-item>
        <n-list-item>
          <UserLine uid="61f3ed15d2784457e4706812"></UserLine>
        </n-list-item>
        <n-list-item>
          <UserLine uid="61f3ed30d2784457e4706813"></UserLine>
        </n-list-item>
      </n-list>
      <h3>小组展示</h3>
<!--      <GroupCard group_id="61f616ce59d266356a4efc14" style="max-width: 700px;">-->
<!--      </GroupCard>-->
      <h3>小组编辑</h3>
      <GroupCard group_id="61f616ce59d266356a4efc14" style="max-width: 700px;" manageable>
      </GroupCard>
      <h3>指南针组件</h3>
      <Compass v-model:orientation="ori" style="width: 200px; height: 200px;"/>
      <n-input-number v-model:value="ori" style="width: 200px;" max="360" min="0" step="10"></n-input-number>
      <h3>检测结果展示组件</h3>
      <Detection editable detection="61fb95448307a4ead06860d5" style="width: 500px; height: 400px;">

      </Detection>
    </n-config-provider>
  </div>
</template>

<script setup>
import {NCode, NConfigProvider, NList, NListItem, NInputNumber} from "naive-ui";
import {inject, ref} from "vue";
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import PointedMap from "../components/PointedMap.vue";
import UserLine from "../components/UserLine.vue";
import GroupCard from "../components/GroupCard.vue";
import Compass from "../components/Compass.vue";
import Detection  from "../components/Detection.vue";

hljs.registerLanguage('javascript', javascript)

const session = inject("session");

const demo_points = [
  {
    name: "某个调查点",
    longitude: 116.397428,
    latitude: 39.90923,
    key: 1,
  },
  {
    name: "调查点2",
    longitude: 117.397428,
    latitude: 39.90923,
    key: 2,
  }
]


const ori = ref(0);
</script>

<style scoped>
.main {
  padding: 50px;
}
</style>
