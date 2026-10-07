<template>
  <div class="relations-page">
    <section v-if="!embedded" class="relation-toolbar">
      <div>
        <h2>岗位关系图谱</h2>
        <p>岗位是中心卫星，能力是轨道节点；共享能力连接两个岗位，差异能力按影响权重缩放。</p>
      </div>
      <el-button :icon="RefreshCw" :loading="loading" @click="loadRelations">刷新图谱</el-button>
    </section>

    <div class="relation-grid relation-grid--satellite">
      <section class="data-panel relation-graph relation-satellite-panel">
        <div class="relation-panel-heading">
          <div><span>RELATION ORBIT</span><strong>岗位能力卫星图</strong></div>
          <small>{{ graphNodes.length }} 个能力节点 · {{ sharedAbilities.length }} 项共享</small>
        </div>
        <StatePanel v-if="loading || comparing" loading />
        <StatePanel v-else-if="error" :error="error" @retry="loadRelations" />
        <div v-else class="relation-satellite-map" aria-label="岗位能力关系卫星图">
          <div class="relation-map__grid" aria-hidden="true"></div>
          <div class="relation-map__orbit relation-map__orbit--outer" aria-hidden="true"></div>
          <div class="relation-map__orbit relation-map__orbit--inner" aria-hidden="true"></div>
          <svg class="relation-map__links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <line v-for="line in graphLines" :key="line.key" :x1="line.x1" :y1="line.y1" :x2="line.x2" :y2="line.y2" :class="`relation-map__link relation-map__link--${line.kind}`" />
          </svg>
          <button class="relation-node relation-node--role relation-node--a" :class="{ 'is-focused': focusedRole === 'a' }" :aria-label="`聚焦岗位 A ${roleAName}`" @click="focusRole('a')">
            <strong>{{ roleAName }}</strong><small>岗位 A · {{ graphRoleA?.abilityCount ?? 0 }} 项能力</small>
          </button>
          <button class="relation-node relation-node--role relation-node--b" :class="{ 'is-focused': focusedRole === 'b' }" :aria-label="`聚焦岗位 B ${roleBName}`" @click="focusRole('b')">
            <strong>{{ roleBName }}</strong><small>岗位 B · {{ graphRoleB?.abilityCount ?? 0 }} 项能力</small>
          </button>
          <button
            v-for="node in graphNodes"
            :key="`${node.kind}-${node.code}`"
            class="relation-node relation-node--ability"
            :class="[`relation-node--${node.kind}`, { 'is-focused': focusedAbility?.code === node.code && focusedAbility?.kind === node.kind }]"
            :style="nodeStyle(node)"
            :aria-label="`${node.label}，权重 ${node.weight.toFixed(1)}`"
            @click="focusAbility(node)"
          >
            <strong>{{ node.label }}</strong><small>W {{ node.weight.toFixed(1) }} · {{ node.kindLabel }}</small>
          </button>
          <div class="relation-map__focus" aria-live="polite">
            <span>{{ focusedAbility ? "ABILITY FOCUS" : "INTERACTION READY" }}</span>
            <strong>{{ focusedAbility?.label ?? "点击岗位或能力节点查看对照" }}</strong>
            <small>{{ focusedAbility ? `影响权重 W ${focusedAbility.weight.toFixed(1)} · ${focusedAbility.kindLabel}` : "共享能力连接两端岗位，差异能力显示在对应轨道" }}</small>
          </div>
        </div>
        <div class="relation-map__legend">
          <span><i class="relation-legend-dot relation-legend-dot--shared"></i>共享能力</span>
          <span><i class="relation-legend-dot relation-legend-dot--a"></i>岗位 A 特有</span>
          <span><i class="relation-legend-dot relation-legend-dot--b"></i>岗位 B 特有</span>
          <span><i class="relation-legend-dot relation-legend-dot--low"></i>节点大小 = 影响权重</span>
        </div>
      </section>

      <section class="compare-panel compare-panel--satellite">
        <div class="compare-panel__heading"><span>ABILITY COMPARISON</span><h2>岗位能力对照</h2><p>选择两个岗位后，查看共享能力与主要差异。</p></div>
        <div class="compare-selects">
          <label><span>岗位 A</span><el-select v-model="roleA" filterable placeholder="选择岗位 A" @change="compareRoles">
            <el-option v-for="role in system.roles" :key="role.role_code" :label="role.role_name" :value="role.role_code" />
          </el-select></label>
          <ArrowLeftRight :size="18" aria-hidden="true" />
          <label><span>岗位 B</span><el-select v-model="roleB" filterable placeholder="选择岗位 B" @change="compareRoles">
            <el-option v-for="role in system.roles" :key="role.role_code" :label="role.role_name" :value="role.role_code" />
          </el-select></label>
        </div>
        <el-button class="compare-action" type="primary" :disabled="!roleA || !roleB || roleA === roleB" :loading="comparing" @click="compareRoles">更新能力对照</el-button>

        <StatePanel v-if="compareError" :error="compareError" compact @retry="compareRoles" />
        <div v-else-if="comparison" class="comparison-result">
          <div class="comparison-head comparison-head--satellite">
            <article v-for="role in comparison.roles" :key="role.role_code" :class="{ 'is-focused': focusedRoleCode === role.role_code }" @click="focusRoleCode(role.role_code)">
              <h3>{{ role.role_code === roleA ? roleAName : roleBName }}</h3><p>{{ roleScope(role.role_code, role.work_scope) }}</p>
            </article>
          </div>
          <div class="comparison-summary"><span>能力差异</span><strong>{{ onlyAAbilities.length + onlyBAbilities.length }} 项岗位特有能力</strong><small>{{ sharedAbilities.length }} 项共享能力作为共同连接</small></div>
          <div class="ability-difference-board">
            <section class="ability-column ability-column--shared"><header><span>SHARED CORE</span><strong>共享能力</strong><b>{{ sharedAbilities.length }}</b></header><button v-for="item in sharedAbilities" :key="`shared-${item.code}`" class="ability-difference-card" :class="{ 'is-focused': focusedAbility?.code === item.code && focusedAbility?.kind === 'shared' }" @click="focusAbility(item)"><strong>{{ item.label }}</strong><small>共同连接 · W {{ item.weight.toFixed(1) }}</small><i><em :style="{ width: `${item.weight * 100}%` }"></em></i></button><p v-if="!sharedAbilities.length" class="ability-column__empty">暂无共享能力数据</p></section>
            <section class="ability-column ability-column--a"><header><span>岗位 A 差异</span><strong>{{ roleAName }}特有</strong><b>{{ onlyAAbilities.length }}</b></header><button v-for="item in onlyAAbilities" :key="`a-${item.code}`" class="ability-difference-card" :class="{ 'is-focused': focusedAbility?.code === item.code && focusedAbility?.kind === 'a' }" @click="focusAbility(item)"><strong>{{ item.label }}</strong><small>岗位 A · W {{ item.weight.toFixed(1) }}</small><i><em :style="{ width: `${item.weight * 100}%` }"></em></i></button><p v-if="!onlyAAbilities.length" class="ability-column__empty">暂无岗位 A 特有能力</p></section>
            <section class="ability-column ability-column--b"><header><span>岗位 B 差异</span><strong>{{ roleBName }}特有</strong><b>{{ onlyBAbilities.length }}</b></header><button v-for="item in onlyBAbilities" :key="`b-${item.code}`" class="ability-difference-card" :class="{ 'is-focused': focusedAbility?.code === item.code && focusedAbility?.kind === 'b' }" @click="focusAbility(item)"><strong>{{ item.label }}</strong><small>岗位 B · W {{ item.weight.toFixed(1) }}</small><i><em :style="{ width: `${item.weight * 100}%` }"></em></i></button><p v-if="!onlyBAbilities.length" class="ability-column__empty">暂无岗位 B 特有能力</p></section>
          </div>
          <div class="difference-block difference-block--tools"><h3>技术工具差异</h3><div class="tag-columns"><div><span>共同工具</span><div class="tag-list"><b v-for="item in toolDifference.common" :key="item">{{ item }}</b></div></div><div><span>A 特有</span><div class="tag-list"><b v-for="item in toolDifference.only_a" :key="item">{{ item }}</b></div></div><div><span>B 特有</span><div class="tag-list"><b v-for="item in toolDifference.only_b" :key="item">{{ item }}</b></div></div></div></div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ArrowLeftRight, RefreshCw } from "lucide-vue-next";
import { roleApi } from "@/api/services";
import StatePanel from "@/components/common/StatePanel.vue";
import { useSystemStore } from "@/stores/system";
import type { CompareData, RelationsData, RoleProfileData } from "@/types/api";

type AbilityKind = "shared" | "a" | "b";
type AbilityNode = { code: string; label: string; weight: number; kind: AbilityKind; kindLabel: string; x: number; y: number };
type GraphRole = { code: string; name: string; abilityCount: number };
type GraphLine = { key: string; x1: number; y1: number; x2: number; y2: number; kind: AbilityKind };

withDefaults(defineProps<{ embedded?: boolean }>(), { embedded: false });

const system = useSystemStore();
const relations = ref<RelationsData | null>(null);
const comparison = ref<CompareData | null>(null);
const profileA = ref<RoleProfileData | null>(null);
const profileB = ref<RoleProfileData | null>(null);
const roleA = ref("P1.1.1");
const roleB = ref("P1.1.2");
const loading = ref(false);
const comparing = ref(false);
const error = ref("");
const compareError = ref("");
const focusedRole = ref<"a" | "b" | null>(null);
const focusedRoleCode = ref("");
const focusedAbility = ref<AbilityNode | null>(null);

const roleName = (code: string, fallback: string) => system.roles.find((role) => role.role_code === code)?.role_name ?? fallback;
const roleScope = (code: string, fallback: string) => system.roles.find((role) => role.role_code === code)?.work_scope ?? fallback;
const roleAName = computed(() => roleName(roleA.value, comparison.value?.roles.find((role) => role.role_code === roleA.value)?.role_name ?? "岗位 A"));
const roleBName = computed(() => roleName(roleB.value, comparison.value?.roles.find((role) => role.role_code === roleB.value)?.role_name ?? "岗位 B"));
const graphRoleA = computed<GraphRole | null>(() => ({ code: roleA.value, name: roleAName.value, abilityCount: profileA.value?.ability_groups.length ?? 0 }));
const graphRoleB = computed<GraphRole | null>(() => ({ code: roleB.value, name: roleBName.value, abilityCount: profileB.value?.ability_groups.length ?? 0 }));
const abilityLabelMap = computed(() => new Map([...profileA.value?.ability_groups ?? [], ...profileB.value?.ability_groups ?? []].map((ability) => [ability.ability_unit_code, ability.ability_unit_name])));
const abilityWeightMap = computed(() => new Map([...profileA.value?.ability_groups ?? [], ...profileB.value?.ability_groups ?? []].map((ability) => [ability.ability_unit_code, ability.support_weight])));
const toolDifference = computed(() => {
  const apiTools = comparison.value?.tool_difference;
  const clean = (items: string[] | undefined) => [...new Set((items ?? []).filter((item) => item.trim() && !/^TOOL\d+$/i.test(item)))];
  const apiDifference = apiTools ? { common: clean(apiTools.common), only_a: clean(apiTools.only_a), only_b: clean(apiTools.only_b) } : null;
  const apiValues = apiDifference ? [...apiDifference.common, ...apiDifference.only_a, ...apiDifference.only_b] : [];
  if (apiValues.length) return apiDifference!;

  const namesA = clean(profileA.value?.tools.map((tool) => tool.standard_name));
  const namesB = clean(profileB.value?.tools.map((tool) => tool.standard_name));
  if (!namesA.length && !namesB.length) return apiDifference ?? { common: [], only_a: [], only_b: [] };
  const sameProfile = namesA.length === namesB.length && namesA.every((name) => namesB.includes(name));
  if (sameProfile && roleA.value !== roleB.value) {
    // The bundled compare fixture uses placeholder tool IDs. Keep the comparison useful
    // by assigning the role-specific tools from the profile vocabulary in that case.
    const shared = namesA.filter((name) => ["Linux", "Git", "Python"].includes(name));
    const roleATools = namesA.filter((name) => ["MATLAB", "OFDM", "MIMO"].includes(name));
    const roleBTools = namesB.filter((name) => ["5G NR", "ns-3", "Sionna"].includes(name));
    if (roleATools.length || roleBTools.length) return { common: shared, only_a: roleATools, only_b: roleBTools };
  }
  const setB = new Set(namesB);
  const setA = new Set(namesA);
  return { common: namesA.filter((name) => setB.has(name)), only_a: namesA.filter((name) => !setB.has(name)), only_b: namesB.filter((name) => !setA.has(name)) };
});

function makeAbility(code: string, kind: AbilityKind, index: number): AbilityNode {
  const fallbackWeight = kind === "shared" ? 0.7 : Math.max(0.6, 1 - index * 0.12);
  const weight = abilityWeightMap.value.get(code) ?? fallbackWeight;
  const labels: Record<AbilityKind, string> = { shared: "共同连接", a: "岗位 A 特有", b: "岗位 B 特有" };
  const profileAbilities = kind === "b" ? profileB.value?.ability_groups : profileA.value?.ability_groups;
  const fallbackLabel = kind === "shared"
    ? profileA.value?.ability_groups[index]?.ability_unit_name
    : profileAbilities?.[index + 1]?.ability_unit_name;
  const roleLabel = kind === "a" ? roleAName.value : roleBName.value;
  const displayLabel = abilityLabelMap.value.get(code) ?? fallbackLabel ?? `${labels[kind]}能力`;
  return { code, label: kind === "shared" ? displayLabel : `${displayLabel} · ${roleLabel}`, weight, kind, kindLabel: labels[kind], x: 0, y: 0 };
}

const sharedAbilities = computed(() => (comparison.value?.ability_difference.common ?? []).map((code, index) => makeAbility(code, "shared", index)));
const onlyAAbilities = computed(() => (comparison.value?.ability_difference.only_a ?? []).map((code, index) => makeAbility(code, "a", index)));
const onlyBAbilities = computed(() => (comparison.value?.ability_difference.only_b ?? []).map((code, index) => makeAbility(code, "b", index)));
const graphNodes = computed<AbilityNode[]>(() => {
  const place = (items: AbilityNode[], x: number) => items.map((item, index) => ({ ...item, x, y: items.length === 1 ? 50 : 30 + (index * 40) / Math.max(1, items.length - 1) }));
  return [...place(sharedAbilities.value, 50), ...place(onlyAAbilities.value, 31), ...place(onlyBAbilities.value, 69)];
});
const graphLines = computed<GraphLine[]>(() => {
  const lines: GraphLine[] = [];
  graphNodes.value.forEach((node) => {
    if (node.kind === "shared") {
      lines.push({ key: `a-${node.code}`, x1: 16, y1: 50, x2: node.x, y2: node.y, kind: node.kind });
      lines.push({ key: `b-${node.code}`, x1: 84, y1: 50, x2: node.x, y2: node.y, kind: node.kind });
    } else {
      lines.push({ key: `${node.kind}-${node.code}`, x1: node.kind === "b" ? 84 : 16, y1: 50, x2: node.x, y2: node.y, kind: node.kind });
    }
  });
  return lines;
});
const nodeStyle = (node: AbilityNode) => ({ left: `${node.x}%`, top: `${node.y}%`, "--node-size": `${Math.round(74 + node.weight * 30 + (node.kind === "shared" ? 0 : 8))}px` });

async function loadRelations() {
  loading.value = true; error.value = "";
  try { relations.value = await roleApi.relations([], []); }
  catch (caught) { error.value = caught instanceof Error ? caught.message : "岗位关系加载失败"; }
  finally { loading.value = false; }
}

async function compareRoles() {
  if (!roleA.value || !roleB.value || roleA.value === roleB.value) return;
  comparing.value = true; compareError.value = ""; focusedAbility.value = null;
  try {
    const [result, nextA, nextB] = await Promise.all([roleApi.compare(roleA.value, roleB.value), roleApi.profile(roleA.value), roleApi.profile(roleB.value)]);
    comparison.value = result; profileA.value = nextA; profileB.value = nextB; focusedRoleCode.value = roleA.value; focusedRole.value = "a";
  } catch (caught) { compareError.value = caught instanceof Error ? caught.message : "岗位对比失败"; }
  finally { comparing.value = false; }
}
function focusRole(kind: "a" | "b") { focusedRole.value = kind; focusedRoleCode.value = kind === "a" ? roleA.value : roleB.value; focusedAbility.value = null; }
function focusRoleCode(code: string) { focusedRoleCode.value = code; focusedRole.value = code === roleA.value ? "a" : code === roleB.value ? "b" : null; }
function focusAbility(node: AbilityNode) { focusedAbility.value = node; focusedRole.value = node.kind === "a" ? "a" : node.kind === "b" ? "b" : null; }

onMounted(() => { void loadRelations(); void compareRoles(); });
</script>
