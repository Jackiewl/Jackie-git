<template>
  <div class="admin-page">
    <section class="admin-summary">
      <div><span>系统管理</span><h2>管理端接口待接入</h2><p>学生端 15 个数据接口已完成前端适配。用户管理、岗位数据维护、统计重算和操作日志尚未包含在当前接口交付包中。</p></div>
      <ShieldCheck :size="48" />
    </section>
    <section class="admin-grid">
      <article v-for="item in adminModules" :key="item.title" class="admin-module">
        <div><component :is="item.icon" :size="20" /><el-tag type="warning" effect="plain">等待接口</el-tag></div>
        <h3>{{ item.title }}</h3><p>{{ item.description }}</p>
        <el-button disabled>暂不可用</el-button>
      </article>
    </section>
    <section class="data-panel contract-panel">
      <h3>当前数据服务</h3>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="系统名称">{{ system.bootstrap?.system_name ?? "--" }}</el-descriptions-item>
        <el-descriptions-item label="API 版本">{{ system.bootstrap?.api_version ?? "--" }}</el-descriptions-item>
        <el-descriptions-item label="数据模式">{{ system.bootstrap?.data_mode ?? "--" }}</el-descriptions-item>
        <el-descriptions-item label="数据版本">{{ system.bootstrap?.latest_refresh.data_version ?? "--" }}</el-descriptions-item>
        <el-descriptions-item label="岗位分类">{{ system.taxonomy?.counts.families ?? 0 }} 大类 / {{ system.taxonomy?.counts.directions ?? 0 }} 方向 / {{ system.taxonomy?.counts.roles ?? 0 }} 岗位</el-descriptions-item>
        <el-descriptions-item label="学生端接口">15 个 POST JSON 接口</el-descriptions-item>
      </el-descriptions>
    </section>
    <section class="admin-health" aria-label="服务状态矩阵">
      <div class="section-heading"><div><span>DATA SERVICE HEALTH</span><h2>学生端数据链路状态</h2></div><p>基于当前启动数据快照</p></div>
      <div class="admin-health__grid">
        <article v-for="item in serviceHealth" :key="item.label" class="admin-health__item"><div><component :is="item.icon" :size="17" /><strong>{{ item.label }}</strong></div><span :class="`is-${item.tone}`"><i />{{ item.status }}</span><small>{{ item.note }}</small></article>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { BarChart3, DatabaseZap, FileClock, HeartPulse, ShieldCheck, Users } from "lucide-vue-next";
import { useSystemStore } from "@/stores/system";
const system = useSystemStore();
const adminModules = [
  { title: "用户与角色", description: "普通用户、超级管理员、账号状态与角色权限管理。", icon: Users },
  { title: "岗位数据管理", description: "招聘记录查看、清洗结果审核与标准岗位归类维护。", icon: DatabaseZap },
  { title: "统计任务", description: "触发统计重算、查看数据刷新状态与失败任务。", icon: BarChart3 },
  { title: "操作日志", description: "记录管理员的重要操作并支持审计查询。", icon: FileClock },
];
const serviceHealth = [
  { label: "基础启动数据", status: "已加载", tone: "ok", note: "Bootstrap / taxonomy / filter options", icon: HeartPulse },
  { label: "招聘市场分析", status: "可用", tone: "ok", note: "趋势、分布、城市与门槛图表", icon: BarChart3 },
  { label: "岗位画像服务", status: "可用", tone: "ok", note: "能力、微能力与工具要求", icon: DatabaseZap },
  { label: "学习路径服务", status: "可用", tone: "ok", note: "阶段任务与任务详情", icon: FileClock },
];
</script>
