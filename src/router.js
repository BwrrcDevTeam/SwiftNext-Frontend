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
    }
]

export default createRouter({
    history: createWebHistory(),
    routes
});
