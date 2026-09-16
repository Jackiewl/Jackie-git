<template>
  <div class="app-shell">
    <aside class="sidebar">
      <RouterLink class="brand" to="/market" aria-label="大学生就业画像平台">
        <span class="brand__mark"><Radar :size="21" /></span>
        <span class="brand__copy"><strong>职途镜像</strong><small>就业画像平台</small></span>
      </RouterLink>

      <nav class="nav" aria-label="主导航">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="nav__item">
          <component :is="item.icon" :size="18" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <div class="sidebar__status">
        <span class="status-dot" :class="{ 'status-dot--live': !apiRuntime.useMock }"></span>
        <span>{{ apiRuntime.useMock ? "Mock 数据" : "实时接口" }}</span>
      </div>
    </aside>

    <div class="workspace">
      <header class="topbar">
        <div>
          <p class="topbar__eyebrow">STUDENT LABOR MARKET INTELLIGENCE</p>
          <h1>{{ current.title }}</h1>
          <p>{{ current.description }}</p>
        </div>
        <div class="topbar__meta">
          <div class="data-freshness">
            <Database :size="16" />
            <span>数据更新</span>
            <strong>{{ updatedAt }}</strong>
          </div>
          <el-tooltip content="刷新基础数据" placement="bottom">
            <el-button :icon="RefreshCw" circle :loading="system.loading" @click="system.initialize(true)" />
          </el-tooltip>
        </div>
      </header>

      <main class="page-content">
        <StatePanel v-if="system.error" :error="system.error" @retry="system.initialize(true)" />
        <RouterView v-else />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import dayjs from "dayjs";
import {
  BookOpenCheck,
  Database,
  GitCompareArrows,
  MapPinned,
  Radar,
  RefreshCw,
  Settings,
  TrendingUp,
} from "lucide-vue-next";
import { apiRuntime } from "@/api/client";
import StatePanel from "@/components/common/StatePanel.vue";
import { useSystemStore } from "@/stores/system";

const route = useRoute();
const system = useSystemStore();
const navItems = [
  { to: "/market", label: "就业市场", icon: TrendingUp },
  { to: "/roles", label: "岗位画像", icon: MapPinned },
  { to: "/relations", label: "岗位关系", icon: GitCompareArrows },
  { to: "/learning", label: "学习路径", icon: BookOpenCheck },
  { to: "/admin", label: "系统管理", icon: Settings },
];
const pageMeta: Record<string, { title: string; description: string }> = {
  market: { title: "就业市场", description: "追踪招聘需求、岗位变化与企业用人门槛" },
  roles: { title: "岗位画像", description: "从职责边界、核心能力与工具要求认识目标岗位" },
  relations: { title: "岗位关系", description: "辨析相近岗位的能力边界与发展差异" },
  learning: { title: "学习路径", description: "依据岗位标准画像组织能力与实践任务" },
  admin: { title: "系统管理", description: "查看数据服务状态与管理接口接入进度" },
};
const current = computed(() => pageMeta[String(route.name)] ?? pageMeta.market!);
const updatedAt = computed(() => {
  const date = system.bootstrap?.latest_refresh.finished_at;
  return date ? dayjs(date).format("MM-DD HH:mm") : "--";
});

onMounted(() => void system.initialize());
</script>
