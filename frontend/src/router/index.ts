import { createRouter, createWebHistory } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppLayout,
      children: [
        { path: "", redirect: "/market" },
        { path: "market", name: "market", component: () => import("@/views/MarketView.vue") },
        { path: "roles", name: "roles", component: () => import("@/views/RolesView.vue") },
        { path: "relations", name: "relations", component: () => import("@/views/RelationsView.vue") },
        { path: "learning", name: "learning", component: () => import("@/views/LearningView.vue") },
        { path: "admin", name: "admin", component: () => import("@/views/AdminView.vue") },
      ],
    },
    { path: "/:pathMatch(.*)*", redirect: "/market" },
  ],
});

router.afterEach((to) => {
  const titles: Record<string, string> = {
    market: "就业市场",
    roles: "岗位画像",
    relations: "岗位关系",
    learning: "学习路径",
    admin: "系统管理",
  };
  document.title = `${titles[String(to.name)] ?? "大学生就业画像"} - 大学生就业画像平台`;
});

export default router;
