<template>
  <div class="learning-diagram" aria-label="招聘岗位经过专业能力、技术工具和四级实践任务，形成学习路径">
    <div v-for="(node, index) in nodes" :key="node.title" class="learning-diagram__step">
      <div class="learning-diagram__node" :class="`learning-diagram__node--${node.tone}`">
        <span class="learning-diagram__glyph"><component :is="node.icon" :size="24" :stroke-width="1.6" aria-hidden="true" /></span>
        <span class="learning-diagram__text"><small>{{ node.index }}</small><strong>{{ node.title }}</strong><em>{{ node.detail }}</em></span>
      </div>
      <div v-if="index < nodes.length - 1" class="learning-diagram__connector" aria-hidden="true"><span></span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BookOpenCheck, BriefcaseBusiness, Blocks, Cpu, Wrench } from "lucide-vue-next";

const nodes = [
  { index: "01", title: "招聘岗位", detail: "市场需求", icon: BriefcaseBusiness, tone: "cyan" },
  { index: "02", title: "专业能力", detail: "能力画像", icon: Blocks, tone: "blue" },
  { index: "03", title: "技术工具", detail: "技术要求", icon: Wrench, tone: "cyan" },
  { index: "04", title: "四级实践任务", detail: "PB / PF / JP / CP", icon: Cpu, tone: "amber" },
  { index: "05", title: "学习路径", detail: "资源与项目", icon: BookOpenCheck, tone: "coral" },
];
</script>
