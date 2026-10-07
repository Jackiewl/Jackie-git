<template>
  <header class="top-navigation">
    <RouterLink class="brand" to="/" aria-label="就业智能体首页">
      <span class="brand__mark"><Radar :size="21" /></span>
      <span class="brand__copy"><strong>就业智能体</strong><small>大学生就业能力平台</small></span>
    </RouterLink>

    <div class="top-navigation__right">
      <nav class="top-navigation__menu" aria-label="主导航">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to" class="top-navigation__item">
          <component :is="item.icon" :size="15" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>

      <slot name="tools" />
    </div>
  </header>
</template>

<script setup lang="ts">
import {
  BookOpenCheck,
  LayoutDashboard,
  MapPinned,
  Radar,
  Settings,
} from "lucide-vue-next";

const navItems = [
  { to: "/workspace", label: "学生工作台", icon: LayoutDashboard },
  { to: "/roles", label: "岗位画像", icon: MapPinned },
  { to: "/learning", label: "学习路径", icon: BookOpenCheck },
  { to: "/admin", label: "系统管理", icon: Settings },
];
</script>
