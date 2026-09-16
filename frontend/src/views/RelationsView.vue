<template>
  <div class="relations-page">
    <section class="relation-toolbar">
      <div>
        <h2>岗位关系图谱</h2>
        <p>节点表示标准岗位，连线展示容易混淆或能力相近关系。</p>
      </div>
      <el-button :icon="RefreshCw" :loading="loading" @click="loadRelations">刷新图谱</el-button>
    </section>
    <div class="relation-grid">
      <section class="data-panel relation-graph">
        <StatePanel v-if="loading" loading />
        <StatePanel v-else-if="error" :error="error" @retry="loadRelations" />
        <EChart v-else-if="relations?.nodes.length" :option="graphOption" aria-label="岗位关系网络图" />
        <StatePanel v-else />
      </section>

      <section class="compare-panel">
        <div class="compare-panel__heading"><span>ROLE COMPARISON</span><h2>岗位对比</h2></div>
        <div class="compare-selects">
          <el-select v-model="roleA" filterable placeholder="选择岗位 A">
            <el-option v-for="role in system.roles" :key="role.role_code" :label="role.role_name" :value="role.role_code" />
          </el-select>
          <ArrowLeftRight :size="18" />
          <el-select v-model="roleB" filterable placeholder="选择岗位 B">
            <el-option v-for="role in system.roles" :key="role.role_code" :label="role.role_name" :value="role.role_code" />
          </el-select>
        </div>
        <el-button type="primary" :disabled="!roleA || !roleB || roleA === roleB" :loading="comparing" @click="compareRoles">开始对比</el-button>

        <StatePanel v-if="compareError" :error="compareError" compact @retry="compareRoles" />
        <div v-else-if="comparison" class="comparison-result">
          <div class="comparison-head">
            <article v-for="role in comparison.roles" :key="role.role_code">
              <span>{{ role.role_code }}</span><h3>{{ role.role_name }}</h3><p>{{ role.work_scope }}</p>
            </article>
          </div>
          <div class="difference-block">
            <h3>能力差异</h3>
            <div class="difference-grid">
              <div><span>共同能力</span><strong>{{ comparison.ability_difference.common.length }}</strong><small>{{ comparison.ability_difference.common.join("、") || "无" }}</small></div>
              <div><span>岗位 A 特有</span><strong>{{ comparison.ability_difference.only_a.length }}</strong><small>{{ comparison.ability_difference.only_a.join("、") || "无" }}</small></div>
              <div><span>岗位 B 特有</span><strong>{{ comparison.ability_difference.only_b.length }}</strong><small>{{ comparison.ability_difference.only_b.join("、") || "无" }}</small></div>
            </div>
          </div>
          <div class="difference-block">
            <h3>工具差异</h3>
            <div class="tag-columns">
              <div><span>共同工具</span><div class="tag-list"><b v-for="item in comparison.tool_difference.common" :key="item">{{ item }}</b></div></div>
              <div><span>A 特有</span><div class="tag-list"><b v-for="item in comparison.tool_difference.only_a" :key="item">{{ item }}</b></div></div>
              <div><span>B 特有</span><div class="tag-list"><b v-for="item in comparison.tool_difference.only_b" :key="item">{{ item }}</b></div></div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ArrowLeftRight, RefreshCw } from "lucide-vue-next";
import { roleApi } from "@/api/services";
import EChart from "@/components/charts/EChart.vue";
import StatePanel from "@/components/common/StatePanel.vue";
import { useSystemStore } from "@/stores/system";
import type { CompareData, RelationsData } from "@/types/api";

const system = useSystemStore();
const relations = ref<RelationsData | null>(null);
const comparison = ref<CompareData | null>(null);
const roleA = ref("P1.1.1");
const roleB = ref("P1.1.2");
const loading = ref(false);
const comparing = ref(false);
const error = ref("");
const compareError = ref("");
const graphOption = computed(() => ({
  color: ["#136f63", "#2878b5", "#d99614", "#6f5aa8", "#b44b4b"],
  tooltip: { formatter: (params: any) => params.data?.summary ? `${params.data.relation_type}<br/>${params.data.summary}` : params.data?.name },
  series: [{
    type: "graph", layout: "force", roam: true, label: { show: true, position: "right", color: "#27313a" },
    force: { repulsion: 420, edgeLength: 130 }, edgeSymbol: ["none", "arrow"], edgeSymbolSize: 8,
    lineStyle: { color: "#9ca8b2", curveness: 0.12, width: 1.4 },
    data: relations.value?.nodes.map((node, index) => ({ id: node.role_code, name: node.role_name, symbolSize: 42, category: index % 5 })) ?? [],
    links: relations.value?.edges.map((edge) => ({ source: edge.source_role_code, target: edge.target_role_code, ...edge })) ?? [],
    categories: ["研发", "网络", "产品", "交付", "运营"].map((name) => ({ name })),
  }],
}));
async function loadRelations() {
  loading.value = true; error.value = "";
  try { relations.value = await roleApi.relations([], []); }
  catch (caught) { error.value = caught instanceof Error ? caught.message : "岗位关系加载失败"; }
  finally { loading.value = false; }
}
async function compareRoles() {
  comparing.value = true; compareError.value = "";
  try { comparison.value = await roleApi.compare(roleA.value, roleB.value); }
  catch (caught) { compareError.value = caught instanceof Error ? caught.message : "岗位对比失败"; }
  finally { comparing.value = false; }
}
onMounted(() => { void loadRelations(); void compareRoles(); });
</script>
