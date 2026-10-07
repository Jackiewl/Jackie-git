<template>
  <div class="learning-route-page">
    <section class="route-command-bar">
      <div><span class="hud-kicker">STANDARD ROUTE / PB → PF → JP → CP</span><h1>{{ path?.role.role_name ?? "标准学习路线" }}</h1><p>把岗位目标拆成可执行的实践序列：主任务建立骨架，补强任务补齐能力和技术工具覆盖。</p></div>
      <el-button class="route-command-bar__back glow-action" :icon="ArrowLeft" @click="backToRoles">返回岗位画像</el-button>
    </section>

    <RoleSelector :model-value="selectedRole" @change="selectRole" />
    <StatePanel v-if="loading" loading />
    <StatePanel v-else-if="error" :error="error" @retry="loadPath" />
    <template v-else-if="path">
      <section class="route-summary-grid">
        <div class="route-summary-grid__main"><span>路径协议</span><strong>PB → PF → JP → CP</strong><p>{{ path.role.direction_name }} · {{ path.summary.total_task_count }} 项任务 · {{ path.summary.main_task_count }} 项主任务</p></div>
        <div><span>综合覆盖</span><strong>{{ Math.round(path.coverage.overall_satisfaction * 100) }}%</strong><small>微能力与技术工具双目标</small></div>
        <div><span>任务结构</span><strong>{{ path.summary.supplement_task_count }}+</strong><small>补强任务</small></div>
      </section>
      <section class="route-coverage-panel" aria-label="学习路径覆盖概览">
        <div><span>PATH COVERAGE</span><strong>能力覆盖</strong><small>{{ Math.round(path.coverage.core_micro_ability_pass_rate * 100) }}%</small><i><em :style="{ width: `${path.coverage.core_micro_ability_pass_rate * 100}%` }" /></i></div>
        <div><span>TOOL FIT</span><strong>工具适配</strong><small>{{ Math.round(path.coverage.tool_weighted_satisfaction * 100) }}%</small><i><em :style="{ width: `${path.coverage.tool_weighted_satisfaction * 100}%` }" /></i></div>
        <div><span>CORE ROUTE</span><strong>主任务完成</strong><small>{{ path.summary.main_task_count }} 项</small><i><em :style="{ width: `${Math.min(100, path.summary.main_task_count / Math.max(path.summary.total_task_count, 1) * 100)}%` }" /></i></div>
        <div><span>OVERALL</span><strong>综合满意度</strong><small>{{ Math.round(path.coverage.overall_satisfaction * 100) }}%</small><i><em :style="{ width: `${path.coverage.overall_satisfaction * 100}%` }" /></i></div>
      </section>

      <section class="route-flow">
        <header class="route-flow__heading"><div><span class="hud-kicker">MISSION SEQUENCE</span><h2>标准学习路线节点</h2></div><p>每张任务卡都带有阶段标识、工具图标和训练角色</p></header>
        <div class="route-stage-grid">
          <article v-for="stage in path.stages" :key="stage.stage_code" class="route-stage" :class="`route-stage--${stage.stage_code.toLowerCase()}`">
            <header class="route-stage__header"><span>{{ stage.stage_code }}</span><div><strong>{{ stage.stage_name }}</strong><small>阶段 {{ stage.stage_order }}</small></div><i>{{ stage.tasks.length }} TASKS</i></header>
            <div class="route-stage__tasks">
              <button v-for="task in stage.tasks" :key="task.task_code" class="route-task-card" :class="{ 'route-task-card--focus': focusedAbility && isAbilityTask(task.task_code) }" @click="openTask(task.task_code)">
                <div class="route-task-card__icon" :class="`route-task-card__icon--${taskIconKey(task.task_name)}`"><component :is="taskIcon(task.task_name)" :size="23" /></div>
                <div class="route-task-card__body"><div class="route-task-card__meta"><b>{{ task.task_role === "main" ? "主任务" : "补强" }}</b></div><strong>{{ task.task_name }}</strong><small>{{ task.selection_reason }}</small><div class="route-task-card__tools"><span v-for="tool in taskTools(task.task_name)" :key="tool.name"><component :is="tool.icon" :size="12" />{{ tool.name }}</span></div></div><ArrowUpRight :size="17" class="route-task-card__arrow" />
              </button>
            </div>
          </article>
        </div>
      </section>
    </template>

    <el-drawer v-model="drawerOpen" size="min(680px, 94vw)" :with-header="false" destroy-on-close>
      <StatePanel v-if="taskLoading" loading />
      <StatePanel v-else-if="taskError" :error="taskError" @retry="activeTaskCode && openTask(activeTaskCode)" />
      <div v-else-if="taskDetail" class="route-task-detail"><el-button class="task-detail__close" :icon="X" circle aria-label="关闭任务详情" @click="drawerOpen = false" /><span class="hud-kicker">{{ taskDetail.task.task_level }}</span><h2>{{ taskDetail.task.task_name }}</h2><p class="route-task-detail__objective">{{ taskDetail.task.task_objective }}</p><section><h3>任务内容</h3><p>{{ taskDetail.task.task_content }}</p></section><section><h3>实施步骤与验收</h3><ol class="step-list"><li v-for="step in taskDetail.steps" :key="step.subitem_code"><b>{{ step.step_no }}</b><div><strong>{{ step.original_text }}</strong><p>{{ step.detail_text }}</p><small>验收：{{ step.acceptance_criteria }}</small></div></li></ol></section><section><h3>工具提升度 d</h3><div class="route-tool-evidence"><span v-for="tool in taskDetail.tools" :key="tool.tool_code"><component :is="toolIcon(tool.tool_name)" :size="16" /><b>{{ tool.tool_name }}</b><small>d {{ tool.improvement_value.toFixed(1) }}</small></span></div></section></div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter, type LocationQuery } from "vue-router";
import { ArrowLeft, ArrowUpRight, Boxes, Code2, Cpu, Database, GitBranch, Network, Terminal, X } from "lucide-vue-next";
import { learningApi } from "@/api/services";
import RoleSelector from "@/components/learning/RoleSelector.vue";
import StatePanel from "@/components/common/StatePanel.vue";
import { useSystemStore } from "@/stores/system";
import type { LearningPathData, TaskDetailData } from "@/types/api";

const route = useRoute();
const router = useRouter();
const system = useSystemStore();
const selectedRole = computed(() => typeof route.query.role === "string" && route.query.role ? route.query.role : system.roles[0]?.role_code ?? "P1.1.1");
const path = ref<LearningPathData | null>(null);
const loading = ref(false);
const error = ref("");
const drawerOpen = ref(false);
const taskLoading = ref(false);
const taskError = ref("");
const activeTaskCode = ref("");
const taskDetail = ref<TaskDetailData | null>(null);
let pathRequest = 0;
const focusedAbility = computed(() => typeof route.query.ability === "string" ? route.query.ability : "");
const iconMap = { python: Code2, git: GitBranch, network: Network, core: Cpu, data: Database, project: Boxes, terminal: Terminal };
function taskIconKey(name: string) { if (name.includes("Python")) return "python"; if (name.includes("数据结构")) return "data"; if (name.includes("Git") || name.includes("程序")) return "git"; if (name.includes("5G") || name.includes("OFDM") || name.includes("MIMO") || name.includes("DSP")) return "core"; if (name.includes("网络")) return "network"; return "project"; }
function taskIcon(name: string) { return iconMap[taskIconKey(name) as keyof typeof iconMap]; }
function toolIcon(name: string) { if (name.toLowerCase().includes("git")) return GitBranch; if (name.toLowerCase().includes("python")) return Code2; if (name.toLowerCase().includes("matlab")) return Terminal; if (name.toLowerCase().includes("linux")) return Terminal; return Cpu; }
function taskTools(name: string) {
  if (name.includes("Python")) return [{ name: "Python", icon: Code2 }, { name: "Git", icon: GitBranch }];
  if (name.includes("OFDM") || name.includes("MIMO") || name.includes("5G NR")) return [{ name: "MATLAB", icon: Terminal }, { name: "5G NR", icon: Network }];
  if (name.includes("网络") || name.includes("微服务")) return [{ name: "Linux", icon: Terminal }, { name: "Git", icon: GitBranch }];
  return [{ name: "通信仿真", icon: Cpu }, { name: "工程交付", icon: Boxes }];
}
async function loadPath() {
  const request = ++pathRequest;
  loading.value = true; error.value = ""; path.value = null;
  try {
    const result = await learningApi.path(selectedRole.value);
    if (request === pathRequest) path.value = result;
  } catch (caught) {
    if (request === pathRequest) error.value = caught instanceof Error ? caught.message : "学习路径加载失败";
  } finally {
    if (request === pathRequest) loading.value = false;
  }
}
async function openTask(code: string) { activeTaskCode.value = code; drawerOpen.value = true; taskLoading.value = true; taskError.value = ""; try { taskDetail.value = await learningApi.task(code); } catch (caught) { taskError.value = caught instanceof Error ? caught.message : "任务详情加载失败"; } finally { taskLoading.value = false; } }
function isAbilityTask(code: string) { const map: Record<string, string[]> = { "A1-02": ["JP-P1-04", "JP-P1-10"], "A2-01": ["PB-02", "PB-04", "PB-07"], "A5-04": ["JP-P1-10", "CP-06"], "A8-04": ["PF1-13", "JP-P1-02"], "B1-06": ["JP-P1-03", "JP-P1-09", "CP-10"] }; return map[focusedAbility.value]?.includes(code) ?? false; }
function selectRole(code: string) {
  if (code === selectedRole.value) return;
  const query: LocationQuery = { ...route.query, role: code };
  delete query.ability;
  void router.replace({ name: "learning", query, hash: route.hash });
}
function backToRoles() { void router.push({ name: "roles", query: { role: selectedRole.value, from: "learning" } }); }
watch(selectedRole, () => { drawerOpen.value = false; void loadPath(); }, { immediate: true });
</script>
