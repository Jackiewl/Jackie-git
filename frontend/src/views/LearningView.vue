<template>
  <div class="learning-page">
    <section class="learning-selector">
      <div>
        <span>TARGET ROLE</span>
        <h2>选择目标岗位</h2>
      </div>
      <el-select v-model="selectedRole" filterable placeholder="搜索 117 个标准岗位" @change="loadPath">
        <el-option v-for="role in system.roles" :key="role.role_code" :label="`${role.role_name} · ${role.role_code}`" :value="role.role_code" />
      </el-select>
    </section>

    <StatePanel v-if="loading" loading />
    <StatePanel v-else-if="error" :error="error" @retry="loadPath" />
    <template v-else-if="path">
      <section class="path-overview">
        <div class="path-overview__role">
          <span>{{ path.role.role_code }} · {{ path.role.direction_name }}</span>
          <h2>{{ path.role.role_name }}</h2>
          <p>标准学习路径覆盖 {{ path.summary.total_task_count }} 项实践任务，其中 {{ path.summary.main_task_count }} 项为主任务。</p>
        </div>
        <div class="coverage-ring">
          <el-progress type="dashboard" :percentage="path.coverage.overall_satisfaction * 100" :width="118" :stroke-width="10" color="#136f63">
            <template #default="{ percentage }"><strong>{{ Math.round(percentage) }}%</strong><span>综合覆盖</span></template>
          </el-progress>
        </div>
        <div class="coverage-grid">
          <div v-for="item in coverageItems" :key="item.label"><span>{{ item.label }}</span><strong>{{ Math.round(item.value * 100) }}%</strong></div>
        </div>
      </section>

      <section class="path-section">
        <div class="section-heading"><div><span>PB / PF / JP / CP</span><h2>标准学习路线</h2></div><p>由公共基础逐步进入综合岗位实践</p></div>
        <div class="stage-flow">
          <article v-for="stage in path.stages" :key="stage.stage_code" class="stage-column">
            <div class="stage-column__head">
              <b>{{ stage.stage_code }}</b>
              <div><h3>{{ stage.stage_name }}</h3><span>阶段 {{ stage.stage_order }}</span></div>
            </div>
            <div class="stage-column__tasks">
              <button v-for="task in stage.tasks" :key="task.task_code" class="task-card" @click="openTask(task.task_code)">
                <div><span>{{ task.task_code }}</span><el-tag size="small" :type="task.task_role === 'main' ? 'success' : 'info'">{{ task.task_role === "main" ? "主任务" : "补充" }}</el-tag></div>
                <h4>{{ task.task_name }}</h4><p>{{ task.selection_reason }}</p><ArrowUpRight :size="16" />
              </button>
              <div v-if="!stage.tasks.length" class="stage-empty">当前阶段暂无任务</div>
            </div>
          </article>
        </div>
      </section>
    </template>
    <StatePanel v-else />

    <el-drawer v-model="drawerOpen" size="min(620px, 92vw)" :with-header="false" destroy-on-close>
      <StatePanel v-if="taskLoading" loading />
      <StatePanel v-else-if="taskError" :error="taskError" @retry="activeTaskCode && openTask(activeTaskCode)" />
      <div v-else-if="taskDetail" class="task-detail">
        <div class="task-detail__head"><span>{{ taskDetail.task.task_level }} · {{ taskDetail.task.task_code }}</span><h2>{{ taskDetail.task.task_name }}</h2><p>{{ taskDetail.task.task_objective }}</p></div>
        <section><h3>工程背景</h3><p>{{ taskDetail.task.engineering_background }}</p></section>
        <section><h3>任务内容</h3><p>{{ taskDetail.task.task_content }}</p></section>
        <section><h3>实施步骤与验收</h3><ol class="step-list"><li v-for="step in taskDetail.steps" :key="step.subitem_code"><b>{{ step.step_no }}</b><div><strong>{{ step.original_text }}</strong><p>{{ step.detail_text }}</p><small>验收：{{ step.acceptance_criteria }}</small></div></li></ol></section>
        <section><h3>能力训练贡献 T</h3><div class="value-list"><div v-for="ability in taskDetail.micro_abilities" :key="ability.micro_ability_code"><span>{{ ability.micro_ability_name }}</span><strong>T {{ ability.training_value.toFixed(1) }}</strong><small>{{ ability.training_label }}</small></div></div></section>
        <section><h3>工具提升度 d</h3><div class="value-list"><div v-for="tool in taskDetail.tools" :key="tool.tool_code"><span>{{ tool.tool_name }}</span><strong>d {{ tool.improvement_value.toFixed(1) }}</strong><small>{{ tool.improvement_label }}</small></div></div></section>
        <section><h3>交付成果</h3><ul><li v-for="item in taskDetail.outputs" :key="item.output_text">{{ item.output_text }}</li></ul></section>
      </div>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ArrowUpRight } from "lucide-vue-next";
import { learningApi } from "@/api/services";
import StatePanel from "@/components/common/StatePanel.vue";
import { useSystemStore } from "@/stores/system";
import type { LearningPathData, TaskDetailData } from "@/types/api";

const route = useRoute();
const system = useSystemStore();
const selectedRole = ref("");
const path = ref<LearningPathData | null>(null);
const loading = ref(false);
const error = ref("");
const drawerOpen = ref(false);
const taskLoading = ref(false);
const taskError = ref("");
const activeTaskCode = ref("");
const taskDetail = ref<TaskDetailData | null>(null);
const coverageItems = computed(() => path.value ? [
  { label: "微能力加权满足度", value: path.value.coverage.micro_ability_weighted_satisfaction },
  { label: "核心微能力通过率", value: path.value.coverage.core_micro_ability_pass_rate },
  { label: "工具加权满足度", value: path.value.coverage.tool_weighted_satisfaction },
  { label: "核心工具通过率", value: path.value.coverage.core_tool_pass_rate },
] : []);
async function loadPath() {
  if (!selectedRole.value) return;
  loading.value = true; error.value = "";
  try { path.value = await learningApi.path(selectedRole.value); }
  catch (caught) { error.value = caught instanceof Error ? caught.message : "学习路径加载失败"; }
  finally { loading.value = false; }
}
async function openTask(code: string) {
  activeTaskCode.value = code; drawerOpen.value = true; taskLoading.value = true; taskError.value = "";
  try { taskDetail.value = await learningApi.task(code); }
  catch (caught) { taskError.value = caught instanceof Error ? caught.message : "任务详情加载失败"; }
  finally { taskLoading.value = false; }
}
function resolveInitialRole() {
  const fromQuery = typeof route.query.role === "string" ? route.query.role : "";
  selectedRole.value = fromQuery || system.roles[0]?.role_code || "P1.1.1";
  void loadPath();
}
watch(() => system.roles.length, (count) => { if (count && !selectedRole.value) resolveInitialRole(); });
onMounted(resolveInitialRole);
</script>
