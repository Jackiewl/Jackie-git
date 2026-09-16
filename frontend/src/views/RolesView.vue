<template>
  <div class="roles-page">
    <section class="toolbar-row">
      <el-select v-model="familyCodes" multiple collapse-tags placeholder="筛选岗位大类" clearable @change="loadMap">
        <el-option v-for="item in system.taxonomy?.families" :key="item.family_code" :label="item.family_name" :value="item.family_code" />
      </el-select>
      <el-input v-model="keyword" :prefix-icon="Search" clearable placeholder="搜索岗位名称、方向或职责" />
      <span class="toolbar-row__count">{{ filteredRoles.length }} 个岗位</span>
    </section>

    <StatePanel v-if="loadingMap" loading />
    <StatePanel v-else-if="error && !roleMap" :error="error" @retry="loadMap" />
    <div v-else class="role-workbench">
      <section class="role-list" aria-label="岗位列表">
        <button
          v-for="role in filteredRoles"
          :key="role.role_code"
          class="role-card"
          :class="{ 'role-card--active': selectedCode === role.role_code }"
          @click="selectRole(role.role_code)"
        >
          <div class="role-card__head"><span>{{ role.role_code }}</span><strong>{{ formatNumber(role.active_job_count) }} 在招</strong></div>
          <h3>{{ role.role_name }}</h3>
          <p>{{ role.work_scope }}</p>
          <div class="role-card__meta">
            <span><BrainCircuit :size="14" />{{ role.ability_count }} 项能力</span>
            <span><Wrench :size="14" />{{ role.tool_count }} 项工具</span>
          </div>
        </button>
        <StatePanel v-if="!filteredRoles.length" compact />
      </section>

      <aside class="portrait-panel">
        <StatePanel v-if="loadingProfile" loading compact />
        <StatePanel v-else-if="profileError" :error="profileError" compact @retry="selectedCode && selectRole(selectedCode)" />
        <template v-else-if="profile">
          <div class="portrait-panel__title">
            <div><span>{{ profile.role.role_code }}</span><h2>{{ profile.role.role_name }}</h2></div>
            <el-button type="primary" @click="goLearning">查看学习路径</el-button>
          </div>
          <p class="work-scope">{{ profile.role.work_scope }}</p>
          <div class="portrait-stats">
            <div><strong>{{ formatNumber(profile.market.active_job_count) }}</strong><span>在招岗位</span></div>
            <div><strong>{{ profile.ability_groups.length }}</strong><span>能力单元</span></div>
            <div><strong>{{ profile.tools.length }}</strong><span>工具技术</span></div>
          </div>

          <section class="portrait-section">
            <div class="portrait-section__heading"><h3>专业能力结构</h3><span>W 支撑权重</span></div>
            <article v-for="ability in profile.ability_groups" :key="ability.ability_unit_code" class="ability-item">
              <div class="ability-item__head">
                <div><strong>{{ ability.ability_unit_name }}</strong><small>{{ ability.definition }}</small></div>
                <el-tag effect="plain">W {{ ability.support_weight.toFixed(1) }} · {{ ability.weight_label }}</el-tag>
              </div>
              <div class="tag-list"><span v-for="micro in ability.micro_abilities" :key="micro.micro_ability_code">{{ micro.micro_ability_name }}</span></div>
            </article>
          </section>

          <section class="portrait-section">
            <div class="portrait-section__heading"><h3>工具与技术栈</h3><span>R 要求度</span></div>
            <div class="tool-grid">
              <div v-for="tool in profile.tools" :key="tool.tool_code" class="tool-item">
                <div><strong>{{ tool.standard_name }}</strong><small>{{ tool.item_type }}</small></div>
                <div><b>R {{ tool.requirement_value.toFixed(1) }}</b><span>{{ tool.requirement_label }}</span></div>
              </div>
            </div>
          </section>

          <section v-if="profile.similar_roles.length" class="portrait-section">
            <div class="portrait-section__heading"><h3>相似岗位</h3></div>
            <button v-for="role in profile.similar_roles" :key="role.role_code" class="similar-role" @click="selectRole(role.role_code)">
              <span><strong>{{ role.role_name }}</strong><small>{{ role.distinction_text }}</small></span><ArrowRight :size="16" />
            </button>
          </section>
        </template>
        <StatePanel v-else compact />
      </aside>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ArrowRight, BrainCircuit, Search, Wrench } from "lucide-vue-next";
import { roleApi } from "@/api/services";
import StatePanel from "@/components/common/StatePanel.vue";
import { useSystemStore } from "@/stores/system";
import type { RoleMapData, RoleProfileData } from "@/types/api";

const router = useRouter();
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
function formatNumber(value: number) { return new Intl.NumberFormat("zh-CN").format(value); }
async function loadMap() {
  loadingMap.value = true; error.value = "";
  try {
    roleMap.value = await roleApi.map(familyCodes.value, []);
    if (!selectedCode.value && roleMap.value.roles[0]) await selectRole(roleMap.value.roles[0].role_code);
  } catch (caught) { error.value = caught instanceof Error ? caught.message : "岗位地图加载失败"; }
  finally { loadingMap.value = false; }
}
async function selectRole(code: string) {
  selectedCode.value = code; loadingProfile.value = true; profileError.value = "";
  try { profile.value = await roleApi.profile(code); }
  catch (caught) { profileError.value = caught instanceof Error ? caught.message : "岗位画像加载失败"; }
  finally { loadingProfile.value = false; }
}
function goLearning() { void router.push({ path: "/learning", query: { role: selectedCode.value } }); }
onMounted(loadMap);
</script>
