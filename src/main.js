import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {translate} from "./i18n";
import {initAMapApiLoader} from "@vuemap/vue-amap";
import '@vuemap/vue-amap/dist/style.css'


const app = createApp(App);
initAMapApiLoader({
    key: "f6eb20ddaba5a94666ab6bf25b1715a4",
})
app.use(router);
window.translate = translate;
app.provide('translate', translate);
app.mount("#app");
