import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {translate} from "./i18n";

const app = createApp(App);
app.use(router);
window.translate = translate;
app.provide('translate', translate);
app.mount("#app");
