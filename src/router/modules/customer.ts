const Layout = () => import("@/layout/index.vue");
export default [
    {
        path: "/system1",
        component: Layout,
        meta: {
            icon: "ri:settings-2-line",
            title: "系统管理2",
            showLink: true,
            rank: 211
        },
        children: [
            // {
            //     path: "/system/project/index",
            //     name: "SystemProject",
            //     component: () => import("@/views/system/project/index.vue"),
            //     meta: {
            //         icon: "fa-solid:project-diagram",
            //         title: "项目管理",
            //         showLink: true,
            //         rank: 600,
            //         showParent: true,
            //         auths: ["auth:project:save", "auth:project:update", "auth:project:batch:remove", "auth:project:details"]
            //     }
            // },
            // {
            //     path: "/system/post/index",
            //     name: "SystemPost",
            //     component: () => import("@/views/system/post/index.vue"),
            //     meta: {
            //         icon: "fa-solid:project-diagram",
            //         title: "岗位管理",
            //         showLink: true,
            //         rank: 601,
            //         showParent: true,
            //         auths: ["auth:post:batch:remove", "auth:post:details", "auth:post:do:status", "auth:post:page:list","auth:post:save","auth:post:update"]
            //     }
            // },
            // {
            //     path: "/system/role/index",
            //     name: "SystemRole",
            //     component: () => import("@/views/system/role/index.vue"),
            //     meta: {
            //         icon: "fa-solid:project-diagram",
            //         title: "角色管理",
            //         showLink: true,
            //         rank: 602,
            //         showParent: true,
            //         auths: ["auth:role:batch:remove","auth:role:details","auth:role:page:list","auth:role:save","auth:role:update","auth:role:update:status"]
            //     }
            // },
            // {
            //     path: "/system/dept/index",
            //     name: "SystemDept",
            //     component: () => import("@/views/system/dept/index.vue"),
            //     meta: {
            //         icon: "fa-solid:project-diagram",
            //         title: "部门管理",
            //         showLink: true,
            //         rank: 603,
            //         showParent: true,
            //         auths: ["auth:dept:batch:remove","auth:dept:details","auth:dept:do:status","auth:dept:page:list","auth:dept:save","auth:dept:update"]
            //     }
            // },
            // {
            //     path: "/system/menu/index",
            //     name: "SystemMenu",
            //     component: () => import("@/views/system/menu/index.vue"),
            //     meta: {
            //         icon: "fa-solid:project-diagram",
            //         title: "菜单管理",
            //         showLink: true,
            //         rank: 604,
            //         showParent: true,
            //         auths: ["auth:menu:batch:remove","auth:menu:details","auth:menu:page:list","auth:menu:save","auth:menu:update"]
            //     }
            // }
        ]
    }
] satisfies Array<RouteConfigsTable>;
