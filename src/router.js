import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";

const routes = [
    // 用户主页
    {
        path: "/",
        name: "home",
        component: () => import("./pages/Home.vue")
    },
    // 错误展示页
    {
        path: "/error",
        name: "error",
        component: () => import("./pages/Error.vue"),
        meta: {
            no_auth: true
        }
    },
    // 注册页
    {
        path: "/register",
        name: "register",
        component: () => import("./pages/Register.vue"),
        meta: {
            no_auth: true
        }
    },
    // 乱七八糟的声明页
    {
        path: "/declaration",
        name: "declaration",
        component: () => import("./pages/Declaration.vue"),
        meta: {
            no_auth: true
        }
    },
    // 社区页
    {
        path: "/community",
        name: "community",
        component: () => import("./pages/Community.vue"),
    },
    // 走错了
    {
        path: "/:pathMatch(.*)",
        name: "404",
        component: () => import("./pages/Error.vue"),
        meta: {
            no_auth: true
        },
        props: {
            status: "404",
            title: {
                cn: "走错门了吧 (ーー゛)",
                en: "Page Not Found (ーー゛)"
            },
            description: {
                cn: "您访问的页面不存在，请检查您的网址是否正确。",
                en: "The page you are looking for does not exist, please check your URL."
            },
            enable_reload: false,
            callback_text: {
                cn: "返回首页",
                en: "Back to Home"
            }
        }
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
});
