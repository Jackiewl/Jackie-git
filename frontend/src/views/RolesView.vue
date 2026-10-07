<template>
  <div class="roles-page">
    <section class="toolbar-row">
      <el-select v-model="familyCodes" multiple collapse-tags placeholder="筛选岗位大类" clearable @change="loadMap">
        <el-option v-for="item in system.taxonomy?.families" :key="item.family_code" :label="item.family_name" :value="item.family_code" />
      </el-select>
      <el-input v-model="keyword" :prefix-icon="Search" clearable placeholder="搜索岗位名称、方向或职责" />
      <span class="toolbar-row__count">{{ filteredRoles.length }} 个岗位 · 能力轨道模式</span>
    </section>

    <StatePanel v-if="loadingMap" loading />
    <StatePanel v-else-if="error && !roleMap" :error="error" @retry="loadMap" />
    <div v-else class="role-workbench role-workbench--orbit">
      <section class="role-list" aria-label="岗位列表">
        <button
          v-for="role in filteredRoles"
          :key="role.role_code"
          class="role-card"
          :class="{ 'role-card--active': selectedCode === role.role_code }"
          @click="selectRole(role.role_code)"
        >
          <div class="role-card__head"><strong>{{ formatNumber(role.active_job_count) }} 在招</strong></div>
          <h3>{{ role.role_name }}</h3>
          <p>{{ role.work_scope }}</p>
          <div class="role-card__meta"><span><BrainCircuit :size="14" />{{ role.ability_count }} 项能力</span><span><Wrench :size="14" />{{ role.tool_count }} 项工具</span></div>
        </button>
        <StatePanel v-if="!filteredRoles.length" compact />
      </section>

      <section class="orbit-console" aria-live="polite">
        <StatePanel v-if="loadingProfile" loading compact />
        <StatePanel v-else-if="profileError" :error="profileError" compact @retry="selectedCode && selectRole(selectedCode)" />
        <template v-else-if="profile">
          <header class="orbit-console__header">
            <div><span class="hud-kicker">ROLE PORTRAIT</span><h1>{{ profile.role.role_name }}</h1><p>{{ profile.role.direction_name }} · {{ profile.role.work_scope }}</p></div>
            <el-button type="primary" :icon="Route" @click="goLearning()">完整学习路径</el-button>
          </header>

          <div class="orbit-console__metrics">
            <div><span>岗位需求</span><strong>{{ formatNumber(profile.market.active_job_count) }}</strong><small>近期开招</small></div>
            <div><span>能力单元</span><strong>{{ profile.ability_groups.length }}</strong><small>正式矩阵</small></div>
            <div><span>微能力</span><strong>25</strong><small>5 × 5 细分</small></div>
            <div><span>技术工具</span><strong>{{ profile.tools.length }}</strong><small>R 要求度</small></div>
          </div>

          <div class="orbit-layout">
            <section class="orbit-map" aria-label="能力权重轨道图">
              <div class="orbit-map__legend"><span>能力卫星轨道</span><small>点击节点查看微能力与任务映射</small></div>
              <div class="orbit-map__stage">
                <span class="orbit-map__scan orbit-map__scan--one" /><span class="orbit-map__scan orbit-map__scan--two" />
                <div class="orbit-ring orbit-ring--outer" /><div class="orbit-ring orbit-ring--inner" />
                <div class="orbit-core"><strong>无线通信<br />算法工程师</strong><small>岗位目标</small></div>
                <button
                  v-for="(ability, index) in profile.ability_groups"
                  :key="ability.ability_unit_code"
                  class="ability-satellite"
                  :class="{ 'ability-satellite--active': selectedAbilityCode === ability.ability_unit_code }"
                  :style="satelliteStyle(index)"
                  :aria-label="`查看${ability.ability_unit_name}，权重 ${ability.support_weight}`"
                  @click="selectAbilityAndNavigate(ability.ability_unit_code)"
                >
                  <strong>{{ ability.ability_unit_name }}</strong>
                  <b>W {{ ability.support_weight.toFixed(1) }}</b>
                </button>
              </div>
              <div class="orbit-map__foot"><span><i class="orbit-dot orbit-dot--core" />岗位定义性核心</span><span><i class="orbit-dot orbit-dot--high" />高度重要</span><span><i class="orbit-dot orbit-dot--support" />重要支撑</span></div>
            </section>

            <aside class="ability-inspector">
              <div class="ability-inspector__head"><div><span class="hud-kicker">ABILITY INSPECTOR</span><h2>{{ selectedAbility.ability_unit_name }}</h2><p>{{ selectedAbility.definition }}</p></div><el-tag effect="dark" :type="selectedAbility.support_weight >= 1 ? 'danger' : 'success'">W {{ selectedAbility.support_weight.toFixed(1) }}</el-tag></div>
              <div class="inspector-block"><div class="inspector-block__title"><h3>微能力细节</h3><span>5 项可训练单元</span></div><div class="micro-list"><button v-for="micro in selectedAbility.micro_abilities" :key="micro.micro_ability_code" class="micro-item" @click="goLearning(micro.micro_ability_code)"><strong>{{ micro.micro_ability_name }}</strong><small>{{ micro.definition }}</small><ArrowUpRight :size="15" /></button></div></div>
              <div class="inspector-block"><div class="inspector-block__title"><h3>关联学习任务</h3><span>{{ relatedTasks.length }} 项映射</span></div><div class="task-link-list"><button v-for="task in relatedTasks" :key="task.task_code" @click="goLearning(selectedAbility.ability_unit_code)"><span>{{ task.stage_code }}</span><strong>{{ task.task_name }}</strong><small>训练贡献 T {{ task.training_value.toFixed(1) }}</small><ArrowRight :size="14" /></button></div></div>
              <el-button class="inspector-cta" type="primary" plain :icon="Route" @click="goLearning(selectedAbility.ability_unit_code)">围绕该能力生成学习路径</el-button>
            </aside>
          </div>

          <section class="tools-strip"><div class="inspector-block__title"><h3>技术工具雷达</h3><span>R 要求度 · {{ profile.tools.length }} 项</span></div><div class="tool-orbit-list"><span v-for="tool in profile.tools" :key="tool.tool_code" :class="{ 'tool-orbit-list__core': tool.requirement_value >= 0.6 }"><b>{{ tool.standard_name }}</b><small>R {{ tool.requirement_value.toFixed(1) }}</small></span></div></section>
        </template>
        <StatePanel v-else compact />
      </section>
    </div>

    <section class="embedded-relations" aria-labelledby="embedded-relations-title">
      <div class="section-heading">
        <div>
          <span>ROLE RELATIONSHIP ANALYSIS</span>
          <h2 id="embedded-relations-title">岗位关系分析与对比</h2>
        </div>
        <p>比较目标岗位之间的共享能力、差异能力与技术工具要求。</p>
      </div>
      <RelationsView embedded />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowRight, ArrowUpRight, BrainCircuit, Route, Search, Wrench } from "lucide-vue-next";
import { roleApi } from "@/api/services";
import StatePanel from "@/components/common/StatePanel.vue";
import RelationsView from "@/views/RelationsView.vue";
import { useSystemStore } from "@/stores/system";
import type { RoleMapData, RoleProfileData } from "@/types/api";

const router = useRouter();
const route = useRoute();
const system = useSystemStore();
const familyCodes = ref<string[]>([]);
const keyword = ref("");
const selectedCode = ref("");
const selectedAbilityCode = ref("");
const roleMap = ref<RoleMapData | null>(null);
const profile = ref<RoleProfileData | null>(null);
const loadingMap = ref(false);
const loadingProfile = ref(false);
const error = ref("");
const profileError = ref("");
const filteredRoles = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  const roles = roleMap.value?.roles ?? [];
  if (!query) return roles;
  return roles.filter((role) => [role.role_name, role.direction_name, role.work_scope].some((value) => value.toLowerCase().includes(query)));
});
const selectedAbility = computed(() => profile.value?.ability_groups.find((item) => item.ability_unit_code === selectedAbilityCode.value) ?? profile.value?.ability_groups[0] ?? { ability_unit_code: "", ability_unit_name: "选择能力卫星", definition: "点击中间轨道中的能力节点查看详情。", support_weight: 0, weight_label: "", micro_abilities: [] });
const relatedTasks = computed(() => {
  const code = selectedAbility.value.ability_unit_code;
  const map: Record<string, Array<{ task_code: string; task_name: string; stage_code: "PB" | "PF" | "JP" | "CP"; training_value: number }>> = {
    "A1-02": [{ task_code: "JP-P1-04", task_name: "5G NR链路级仿真实践", stage_code: "JP", training_value: 0.8 }, { task_code: "JP-P1-10", task_name: "通信系统原型验证实践", stage_code: "JP", training_value: 0.6 }],
    "A2-01": [{ task_code: "PB-02", task_name: "Python程序设计与工程数据处理实践", stage_code: "PB", training_value: 0.8 }, { task_code: "PB-04", task_name: "数据结构与算法工程实践", stage_code: "PB", training_value: 0.8 }, { task_code: "PB-07", task_name: "网络程序设计实践", stage_code: "PB", training_value: 0.6 }],
    "A5-04": [{ task_code: "JP-P1-10", task_name: "通信系统原型验证实践", stage_code: "JP", training_value: 0.8 }, { task_code: "CP-06", task_name: "虚拟5G专网规划、部署与优化综合实践", stage_code: "CP", training_value: 0.6 }],
    "A8-04": [{ task_code: "PF1-13", task_name: "DSP通信算法工程实现实践", stage_code: "PF", training_value: 0.8 }, { task_code: "JP-P1-02", task_name: "OFDM系统设计实践", stage_code: "JP", training_value: 0.6 }],
    "B1-06": [{ task_code: "JP-P1-03", task_name: "MIMO通信算法实践", stage_code: "JP", training_value: 0.8 }, { task_code: "JP-P1-09", task_name: "通感一体化系统实践", stage_code: "JP", training_value: 0.8 }, { task_code: "CP-10", task_name: "通信网络创新挑战项目实践", stage_code: "CP", training_value: 0.6 }]
  };
  return map[code] ?? [];
});
const orbitPositions = [{ x: 50, y: 13 }, { x: 90, y: 34 }, { x: 76, y: 84 }, { x: 24, y: 84 }, { x: 10, y: 34 }];
function satelliteStyle(index: number) { const point = orbitPositions[index] ?? orbitPositions[0]; return { left: `${point.x}%`, top: `${point.y}%` }; }
function formatNumber(value: number) { return new Intl.NumberFormat("zh-CN").format(value); }
async function loadMap() {
  loadingMap.value = true; error.value = "";
  try {
    roleMap.value = await roleApi.map(familyCodes.value, []);
    if (!selectedCode.value && roleMap.value.roles[0]) {
      const requestedCode = typeof route.query.role === "string" ? route.query.role : "";
      const initialCode = roleMap.value.roles.some((role) => role.role_code === requestedCode) ? requestedCode : roleMap.value.roles[0].role_code;
      await selectRole(initialCode);
    }
  } catch (caught) { error.value = caught instanceof Error ? caught.message : "岗位地图加载失败"; }
  finally { loadingMap.value = false; }
}
async function selectRole(code: string) {
  selectedCode.value = code; selectedAbilityCode.value = ""; loadingProfile.value = true; profileError.value = "";
  try { profile.value = await roleApi.profile(code); selectedAbilityCode.value = profile.value.ability_groups[0]?.ability_unit_code ?? ""; }
  catch (caught) { profileError.value = caught instanceof Error ? caught.message : "岗位画像加载失败"; }
  finally { loadingProfile.value = false; }
}
function selectAbility(code: string) { selectedAbilityCode.value = code; }
function selectAbilityAndNavigate(code: string) {
  selectAbility(code);
  goLearning(code);
}
function goLearning(ability = "") { void router.push({ path: "/learning/route", query: { role: selectedCode.value, ...(ability ? { ability } : {}) } }); }
onMounted(loadMap);
</script>
