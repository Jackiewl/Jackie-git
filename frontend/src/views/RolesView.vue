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
            <el-button class="glow-action" type="primary" :icon="Route" @click="goLearning()">完整学习路径</el-button>
          </header>

          <div class="orbit-console__metrics">
            <div><span>岗位需求</span><strong>{{ formatNumber(profile.market.active_job_count) }}</strong><small>近期开招</small></div>
            <div><span>能力单元</span><strong>{{ profile.ability_groups.length }}</strong><small>正式矩阵</small></div>
            <div><span>微能力</span><strong>{{ microAbilityCount }}</strong><small>按能力单元细分</small></div>
            <div><span>技术工具</span><strong>{{ profile.tools.length }}</strong><small>R 要求度</small></div>
          </div>

          <AbilityPortraitExplorer :profile="profile" :initial-ability="typeof route.query.ability === 'string' ? route.query.ability : undefined" @learning="goLearning" />
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
import { BrainCircuit, Route, Search, Wrench } from "lucide-vue-next";
import { roleApi } from "@/api/services";
import StatePanel from "@/components/common/StatePanel.vue";
import AbilityPortraitExplorer from "@/components/roles/AbilityPortraitExplorer.vue";
import RelationsView from "@/views/RelationsView.vue";
import { useSystemStore } from "@/stores/system";
import type { RoleMapData, RoleProfileData } from "@/types/api";

const router = useRouter();
const route = useRoute();
const system = useSystemStore();
const familyCodes = ref<string[]>([]);
const keyword = ref("");
const selectedCode = ref("");
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
const microAbilityCount = computed(() => profile.value?.ability_groups.reduce((sum, ability) => sum + ability.micro_abilities.length, 0) ?? 0);
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
  selectedCode.value = code; loadingProfile.value = true; profileError.value = "";
  void router.replace({ name: "roles", query: { ...route.query, role: code } });
  try { profile.value = await roleApi.profile(code); }
  catch (caught) { profileError.value = caught instanceof Error ? caught.message : "岗位画像加载失败"; }
  finally { loadingProfile.value = false; }
}
function goLearning(ability = "") { void router.push({ name: "learning", query: { role: selectedCode.value, from: "roles", ...(ability ? { ability } : {}) } }); }
onMounted(loadMap);
</script>
