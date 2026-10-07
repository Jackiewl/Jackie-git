<template>
  <div class="practice-stage-legend" aria-label="PB、PF、JP、CP 四级实践任务说明">
    <article v-for="stage in stages" :key="stage.code" class="practice-stage" :class="`practice-stage--${stage.tone}`">
      <div class="practice-stage__topline">
        <span class="practice-stage__icon"><component :is="stage.icon" :size="22" :stroke-width="1.8" aria-hidden="true" /></span>
        <span class="practice-stage__code">{{ stage.code }}</span>
        <strong>{{ stage.title }}</strong>
      </div>
      <p>{{ stage.description }}</p>
      <div class="practice-stage__example"><small>无线通信算法工程师示例</small><span>{{ stage.example }}</span></div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { Blocks, Binary, Network, Rocket } from "lucide-vue-next";

const stages = [
  { code: "PB", title: "公共基础", description: "先把环境、协作和验证方法搭起来。", example: "配置 Linux / Git 环境，跑通第一个信号处理实验。", icon: Blocks, tone: "cyan" },
  { code: "PF", title: "专业基础", description: "把通信原理转成可以运行的功能模块。", example: "实现 OFDM 调制解调，并用 BER 曲线完成验证。", icon: Binary, tone: "blue" },
  { code: "JP", title: "岗位实践", description: "围绕目标岗位完成一段真实工程链路。", example: "完成 5G/NR 信道估计模块，记录参数和测试证据。", icon: Network, tone: "amber" },
  { code: "CP", title: "综合实践", description: "把多个模块整合为可展示、可复现的项目。", example: "交付端到端算法原型、报告和可复现实验仓库。", icon: Rocket, tone: "coral" },
];
</script>
