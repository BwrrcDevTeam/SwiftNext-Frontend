import {createRouter, createWebHashHistory, createWebHistory} from "vue-router";

const routes = [
    // 用户主页
    {
        path: "/",
        name: "home",
        component: () => import("./pages/Home.vue"),
        children: [
            {
                path: "/",
                name: "home_index",
                component: () => import("./pages/Home/IndexReport.vue"), // 数据报表页
            },
            {
                path: "/reports",
                name: "home_reports",
                component: () => import("./pages/Home/Reports.vue"), // 填报页
                children: [
                    // {
                    //     path: "/reports/:id",
                    //     name: "home_reports_detail",
                    //     component: () => import("./pages/Home/ReportsDetail.vue"), // 填报详情页
                    // },
                    {
                        path: "/reports/new",
                        name: "home_reports_new",
                        component: () => import("./pages/Home/NewReport.vue"), // 新建填报页
                    }
                ]
            },
            {
                path: "/group",
                name: "home_group",
                component: () => import("./pages/Home/MyGroup.vue"), // 我的小组页
            },
            {
                path: "/site_manage",
                name: "home_site_manage",
                component: () => import("./pages/Home/SiteManage.vue"), // 站点管理页(管理员)
                meta: {
                    perm: 3,
                }
            }
            // 目前就想到这些
        ]
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
    {
        path: "/dev",
        name: "dev",
        component: () => import("./pages/Dev.vue"),
        meta: {
            no_auth: true
        }
    },
    // 验证码应用页
    {
        path: "/code/:code",
        name: "code",
        component: () => import("./pages/Code.vue"),
        meta: {
            no_auth: true
        }
    },
    {
        path: "/code",
        name: "code_manual",
        component: () => import("./pages/Code.vue"),
        meta: {
            no_auth: true
        }
    },
    {
        path: "/detector",
        name: "detector",
        component: () => import("./pages/Detector.vue"),
        meta: {
            no_auth: true
        }
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
    },


]

export default createRouter({
    history: createWebHistory(),
    routes
});
