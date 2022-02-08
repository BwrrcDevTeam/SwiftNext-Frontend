<template>
  <n-layout has-sider class="content">
    <n-layout-content class="content">
      <n-scrollbar>
        <!--        隐私政策-->
        <n-card id="privacy">
          <n-h1 prefix="bar">
            <n-gradient-text>{{ t(Declaration_strings.privacy) }}</n-gradient-text>
          </n-h1>
          <n-h2>
            <n-gradient-text type="info">Cookie</n-gradient-text>
          </n-h2>
          <n-p>{{ t(Declaration_strings.privacy_line1) }}</n-p>
          <n-p>{{ t(Declaration_strings.privacy_line2) }}</n-p>
          <n-h2>
            <n-gradient-text type="info">{{
                t({
                  cn: "用户数据",
                  en: "User Data"
                })
              }}
            </n-gradient-text>
          </n-h2>
          <n-p>{{ t(Declaration_strings.privacy_line3) }}</n-p>
          <n-p>{{ t(Declaration_strings.privacy_line4) }}</n-p>
        </n-card>
        <!--        关于本站-->
        <br>
        <n-card id="about">
          <n-h1 prefix="bar">
            <n-gradient-text>{{ t(Declaration_strings.about) }}</n-gradient-text>
          </n-h1>
          <n-h2>
            <n-gradient-text type="info">{{
                t({
                  cn: "简介",
                  en: "Introduction"
                })
              }}
            </n-gradient-text>
          </n-h2>
          <n-p>{{ t(Declaration_strings.about_line1) }}</n-p>
          <n-p>{{ t(Declaration_strings.about_line2) }}</n-p>
          <n-ul>
            <n-li v-for="line in Declaration_strings.about_functions">
              {{ t(line) }}
            </n-li>
          </n-ul>

          <n-h2>
            <n-gradient-text type="info">
              {{
                t({
                  cn: "账号 / 注册码",
                  en: "Account / Registration Code"
                })
              }}
            </n-gradient-text>
          </n-h2>
          <n-p>{{ t(Declaration_strings.accounts_line1) }}</n-p>
        </n-card>
      </n-scrollbar>
    </n-layout-content>
<!--    <n-layout-sider class="anchors">-->
<!--      <n-anchor :show-rail="true" :show-background="false" affix>-->
<!--        <n-anchor-link :title="t(Declaration_strings.privacy)"/>-->
<!--        <n-anchor-link :title="t(Declaration_strings.about)"/>-->
<!--      </n-anchor>-->
<!--    </n-layout-sider>-->
  </n-layout>

</template>

<script setup>
import {
  NH1,
  NH2,
  NH3,
  NGradientText,
  NLayout,
  NLayoutSider,
  NLayoutContent,
  NAnchor,
  NAnchorLink,
  NP,
  NCard,
  NScrollbar,
  NUl,
  NOl,
  NLi
} from 'naive-ui';
import {inject} from "vue";
import {Declaration_strings} from "../i18n";

const t = inject("translate");

</script>

<style scoped>
.content {
  padding: 50px;
  transition: all .2s;
}

.anchors {
  transition: all .2s;
}

@media (max-width: 800px) {
  .content {
    padding: 12px 0 12px;
  }

  .anchors {
    opacity: 0;
    width: 0 !important;
  }
}
</style>

<style>
.n-layout-sider {
  background: none;
}

.n-affix {
  position: fixed;
}
</style>
