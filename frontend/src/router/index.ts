import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", name: "cover", component: () => import("@/views/CoverView.vue") },
    {
      path: "/app",
      component: AppLayout,
      children: [
        { path: "", redirect: "/workspace" },
        { path: "/workspace", name: "workspace", component: () => import("@/views/MarketView.vue") },
        { path: "/roles", name: "roles", component: () => import("@/views/RolesView.vue") },
        { path: "/relations", redirect: "/roles" },
        { path: "/learning", name: "learning", component: () => import("@/views/LearningRouteView.vue") },
        { path: "/learning/route", redirect: (to) => ({ name: "learning", query: to.query, hash: to.hash }) },
        { path: "/admin", name: "admin", component: () => import("@/views/AdminView.vue") },
      ],
    },
    { path: "/market", redirect: "/workspace" },
    { path: "/:pathMatch(.*)*", redirect: "/" },
  ],
});

router.afterEach((to) => {
  const titles: Record<string, string> = {
    cover: "首页",
    workspace: "学生工作台",
    roles: "岗位画像",
    learning: "学习路径",
    admin: "系统管理",
  };
  document.title = `${titles[String(to.name)] ?? "大学生就业画像"} - 就业智能体`;
});

export default router;
