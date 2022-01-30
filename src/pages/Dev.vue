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
    </n-config-provider>
  </div>
</template>

<script setup>
import {NCode, NConfigProvider, NList, NListItem} from "naive-ui";
import {inject} from "vue";
import hljs from 'highlight.js/lib/core'
import javascript from 'highlight.js/lib/languages/javascript'
import PointedMap from "../components/PointedMap.vue";
import UserLine from "../components/UserLine.vue";

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

</script>

<style scoped>
.main {
  padding: 50px;
}
</style>
