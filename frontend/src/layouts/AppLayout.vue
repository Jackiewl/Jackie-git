<template>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  <div class="app-shell" :class="{ 'app-shell--workspace': route.name === 'workspace' }">
    <TopNavigation>
      <template #tools>
        <span class="runtime-badge" :class="{ 'runtime-badge--live': !apiRuntime.useMock }">
          <span class="status-dot" :class="{ 'status-dot--live': !apiRuntime.useMock }"></span>
          {{ apiRuntime.useMock ? "演示模式" : "实时数据" }}
        </span>
        <el-tooltip content="刷新基础数据" placement="bottom">
          <el-button :icon="RefreshCw" circle :loading="system.loading" @click="system.initialize(true)" />
        </el-tooltip>
      </template>
    </TopNavigation>

    <div class="workspace">
      <header class="topbar">
        <div class="topbar__title">
          <p class="topbar__eyebrow">就业决策工作台 <ChevronRight :size="12" /> {{ current.title }}</p>
          <h1>{{ current.title }}</h1>
          <p>{{ current.description }}</p>
        </div>
        <div class="topbar__meta">
          <RouterLink v-if="contextBack" class="context-back glow-action" :to="contextBack.to">
            <ArrowLeft :size="15" />
            <span>{{ contextBack.label }}</span>
          </RouterLink>
          <div class="data-freshness">
            <Database :size="16" />
            <span>数据更新</span>
            <strong>{{ updatedAt }}</strong>
          </div>
        </div>
      </header>

      <main id="main-content" class="page-content" tabindex="-1">
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
import { ArrowLeft, ChevronRight, Database, RefreshCw } from "lucide-vue-next";
import type { RouteLocationRaw } from "vue-router";
import { apiRuntime } from "@/api/client";
import StatePanel from "@/components/common/StatePanel.vue";
import TopNavigation from "@/components/navigation/TopNavigation.vue";
import { useSystemStore } from "@/stores/system";

const route = useRoute();
const system = useSystemStore();
const pageMeta: Record<string, { title: string; description: string }> = {
  workspace: { title: "学生工作台", description: "连接岗位信号、实践任务与能力成长" },
  roles: { title: "岗位画像", description: "从职责边界、核心能力与工具要求认识目标岗位" },
  learning: { title: "学习路径", description: "按 PB / PF / JP / CP 展开岗位实践任务与工具链" },
  admin: { title: "系统管理", description: "查看数据服务状态与管理接口接入进度" },
};
const current = computed(() => pageMeta[String(route.name)] ?? pageMeta.workspace!);
const contextBack = computed<{ label: string; to: RouteLocationRaw } | null>(() => {
  const from = typeof route.query.from === "string" ? route.query.from : "";
  if (from === "cover") return { label: "返回首页", to: "/" };
  if (from === "workspace") return { label: "返回学生工作台", to: "/workspace" };
  if (from === "roles") {
    return { label: "返回岗位画像", to: { name: "roles", query: route.query.role ? { role: route.query.role } : undefined } };
  }
  if (from === "learning") return { label: "返回学习路径", to: "/learning" };
  return null;
});
const updatedAt = computed(() => {
  const date = system.bootstrap?.latest_refresh.finished_at;
  return date ? dayjs(date).format("MM-DD HH:mm") : "--";
});

onMounted(() => void system.initialize().catch(() => undefined));
</script>
