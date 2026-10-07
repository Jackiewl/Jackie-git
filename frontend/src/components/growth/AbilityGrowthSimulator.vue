<template>
  <section class="growth-lab" aria-labelledby="growth-lab-title">
    <header class="growth-lab__header">
      <div>
        <span class="hud-kicker"><Activity :size="14" /> 任务成长模拟</span>
        <h2 id="growth-lab-title">完成任务后，能力贡献如何被激活</h2>
      </div>
      <div class="growth-lab__state" role="status" aria-live="polite">
        <span :class="{ 'is-active': completed }"></span>
        {{ completed ? "任务贡献已激活" : "等待任务完成" }}
      </div>
    </header>

    <StatePanel v-if="loading" loading compact />
    <StatePanel v-else-if="!task" compact />
    <div v-else class="growth-lab__body">
      <div class="ability-radar">
        <div class="ability-radar__frame" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
        <EChart :option="radarOption" aria-label="任务完成前后能力训练贡献雷达图" />
        <div class="ability-radar__legend">
          <span><i></i>未激活</span>
          <span><i class="is-after"></i>完成任务后</span>
        </div>
      </div>

      <article class="mission-console">
        <div class="mission-console__meta">
          <span>{{ task.task.task_level }}</span>
              <b>实践任务</b>
          <small>标准任务</small>
        </div>
        <h3>{{ task.task.task_name }}</h3>
        <p>{{ task.task.task_objective }}</p>

        <div class="mission-console__readout">
          <div><strong>{{ task.micro_abilities.length }}</strong><span>微能力映射</span></div>
          <div><strong>{{ task.tools.length }}</strong><span>工具映射</span></div>
          <div><strong>{{ task.steps.length }}</strong><span>验收步骤</span></div>
        </div>

        <el-button
          class="mission-console__action"
          :class="{ 'is-complete': completed }"
          :icon="completed ? RotateCcw : CheckCircle2"
          @click="toggleCompletion"
        >
          {{ completed ? "重置演示" : "完成任务并查看提升" }}
        </el-button>
        <p class="mission-console__notice"><ShieldCheck :size="14" /> 本页只展示任务声明的 T/d 贡献，不计算或保存个人掌握度 M。</p>
      </article>

      <div class="ability-modules" aria-label="能力模块训练贡献">
        <div class="module-heading">
          <div><Cpu :size="16" /><strong>微能力模块</strong></div>
          <span>T 训练贡献</span>
        </div>
        <article v-for="(ability, index) in displayedAbilities" :key="ability.micro_ability_code" class="ability-module">
          <div class="ability-module__index">{{ String(index + 1).padStart(2, "0") }}</div>
          <div class="ability-module__content">
            <div><strong>{{ ability.micro_ability_name }}</strong><span>{{ ability.training_label }}</span></div>
            <div class="ability-module__track" :aria-label="`${ability.micro_ability_name} T ${ability.training_value.toFixed(1)}`">
              <span :style="{ transform: `scaleX(${completed ? ability.training_value : 0})` }"></span>
            </div>
          </div>
          <b>T {{ ability.training_value.toFixed(1) }}</b>
        </article>
        <p v-if="hiddenAbilityCount" class="ability-modules__more">另有 {{ hiddenAbilityCount }} 项微能力已纳入任务贡献计算</p>
      </div>

      <div class="tool-modules" aria-label="工具提升度">
        <div class="module-heading">
          <div><Wrench :size="16" /><strong>工具技术栈</strong></div>
          <span>d 提升度</span>
        </div>
        <div class="tool-orbit">
          <article v-for="tool in task.tools" :key="tool.tool_code" class="tool-node" :class="{ 'is-active': completed }">
            <strong>{{ tool.tool_name }}</strong>
            <b>d {{ tool.improvement_value.toFixed(1) }}</b>
            <small>{{ tool.improvement_label }}</small>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { EChartsCoreOption } from "echarts/core";
import { Activity, CheckCircle2, Cpu, RotateCcw, ShieldCheck, Wrench } from "lucide-vue-next";
import EChart from "@/components/charts/EChart.vue";
import StatePanel from "@/components/common/StatePanel.vue";
import type { TaskDetailData } from "@/types/api";

const props = defineProps<{ task: TaskDetailData | null; loading?: boolean }>();
const completed = ref(false);
const displayedAbilities = computed(() => (props.task?.micro_abilities ?? []).slice(0, 3));
const hiddenAbilityCount = computed(() => Math.max(0, (props.task?.micro_abilities.length ?? 0) - displayedAbilities.value.length));

const radarDimensions = computed(() => {
  const abilityDimensions = (props.task?.micro_abilities ?? []).slice(0, 5).map((item) => ({
    name: item.micro_ability_name,
    value: item.training_value,
  }));
  const maxTool = Math.max(0, ...(props.task?.tools ?? []).map((item) => item.improvement_value));
  return [...abilityDimensions, { name: "工具应用", value: maxTool }];
});

const radarOption = computed<EChartsCoreOption>(() => ({
  animationDuration: 650,
  animationEasing: "cubicOut",
  tooltip: { trigger: "item", backgroundColor: "#111b23", borderColor: "#26d9c7", textStyle: { color: "#eafdf9" } },
  radar: {
    center: ["50%", "50%"],
    radius: "66%",
    splitNumber: 5,
    shape: "polygon",
    indicator: radarDimensions.value.map((item) => ({ name: item.name, max: 100 })),
    axisName: { color: "#c1d5d2", fontSize: 11, lineHeight: 15 },
    axisLine: { lineStyle: { color: "rgba(38, 217, 199, 0.26)" } },
    splitLine: { lineStyle: { color: "rgba(125, 161, 164, 0.22)" } },
    splitArea: { areaStyle: { color: ["rgba(9, 20, 27, 0.08)", "rgba(9, 20, 27, 0.36)"] } },
  },
  series: [{
    type: "radar",
    symbolSize: 6,
    data: [
      {
        name: "未激活",
        value: radarDimensions.value.map(() => 0),
        lineStyle: { color: "#6f7f87", width: 1, type: "dashed" },
        itemStyle: { color: "#6f7f87" },
        areaStyle: { color: "rgba(111, 127, 135, 0.06)" },
      },
      {
        name: "完成任务后",
        value: radarDimensions.value.map((item) => (completed.value ? item.value * 100 : 0)),
        lineStyle: { color: "#26d9c7", width: 2 },
        itemStyle: { color: "#ffd166", borderColor: "#08141b", borderWidth: 2 },
        areaStyle: { color: "rgba(38, 217, 199, 0.22)" },
      },
    ],
  }],
}));

function toggleCompletion() {
  completed.value = !completed.value;
}

watch(() => props.task?.task.task_code, () => { completed.value = false; });
</script>
