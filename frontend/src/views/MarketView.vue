<template>
  <div class="home-page">
    <section class="market-terminal" aria-labelledby="market-terminal-title">
      <header class="market-terminal__header">
        <div>
          <span class="hud-kicker"><RadioTower :size="14" /> 就业市场信号</span>
          <h2 id="market-terminal-title">用真实需求校准成长方向</h2>
        </div>
        <p>市场数据与任务成长相互独立，筛选只作用于下方招聘分析。</p>
      </header>

      <MarketFilterBar />

      <StatePanel v-if="loading && !overview" loading />
      <StatePanel v-else-if="error && !overview" :error="error" @retry="loadData" />
      <template v-else>
        <section class="metric-grid" aria-label="市场概览">
          <article v-for="item in metrics" :key="item.label" class="metric-card" :class="`metric-card--${item.tone}`">
            <div class="metric-card__label"><component :is="item.icon" :size="17" />{{ item.label }}</div>
            <strong>{{ formatNumber(item.value) }}</strong>
            <span>{{ item.note }}</span>
          </article>
        </section>

        <section class="section-block">
          <div class="section-heading">
            <div><span>需求脉冲</span><h2>招聘需求趋势</h2></div>
            <el-button :icon="Download" @click="exportMarketData">导出数据</el-button>
          </div>
          <div class="chart-grid chart-grid--wide">
            <div class="data-panel data-panel--wide">
              <EChart v-if="trend?.series.length" :option="trendOption" aria-label="招聘需求趋势折线图" />
              <StatePanel v-else compact />
            </div>
            <div class="data-panel">
              <h3>岗位大类分布</h3>
              <EChart v-if="distribution?.items.length" :option="distributionOption" aria-label="岗位大类分布图" />
              <StatePanel v-else compact />
            </div>
          </div>
        </section>

        <section class="section-block">
          <div class="section-heading"><div><span>决策信号</span><h2>区域与岗位洞察</h2></div></div>
          <div class="insight-grid">
            <div class="data-panel ranking-panel">
              <h3>热门岗位排行</h3>
              <ol v-if="ranking?.items.length" class="ranking-list">
                <li v-for="item in ranking.items" :key="item.role_code">
                  <span class="rank">{{ String(item.rank).padStart(2, "0") }}</span>
                  <div><strong>{{ item.role_name }}</strong></div>
                  <b>{{ formatNumber(item.value) }}</b>
                  <em :class="{ negative: item.change_rate < 0 }">{{ formatPercent(item.change_rate, true) }}</em>
                </li>
              </ol>
              <StatePanel v-else compact />
            </div>
            <div class="data-panel">
              <h3>重点城市</h3>
              <EChart v-if="cities?.cities.length" :option="cityOption" aria-label="重点城市岗位数量图" />
              <StatePanel v-else compact />
            </div>
            <div v-for="item in requirementCards" :key="item.key" class="data-panel requirement-panel">
              <div class="requirement-panel__heading"><h3>{{ item.title }}</h3><span>占比</span></div>
              <div v-if="item.items.length" class="requirement-list">
                <div v-for="row in item.items" :key="row.label" class="requirement-row">
                  <div><span>{{ row.label }}</span><strong>{{ formatPercent(row.percentage) }}</strong></div>
                  <el-progress :percentage="row.percentage * 100" :show-text="false" :stroke-width="7" />
                  <small>{{ formatNumber(row.count) }} 个岗位</small>
                </div>
              </div>
              <StatePanel v-else compact />
            </div>
          </div>
        </section>
      </template>
    </section>

    <AbilityGrowthSimulator :task="taskDetail" :loading="growthLoading" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import {
  Download,
  Network,
  RadioTower,
  TrendingDown,
  TrendingUp,
  Wifi,
} from "lucide-vue-next";
import * as XLSX from "xlsx";
import { learningApi, marketApi } from "@/api/services";
import EChart from "@/components/charts/EChart.vue";
import StatePanel from "@/components/common/StatePanel.vue";
import MarketFilterBar from "@/components/filters/MarketFilterBar.vue";
import AbilityGrowthSimulator from "@/components/growth/AbilityGrowthSimulator.vue";
import { useFilterStore } from "@/stores/filters";
import type { CityData, DistributionData, MarketOverviewData, RankingData, RequirementsData, TaskDetailData, TrendData } from "@/types/api";

const filters = useFilterStore();
const overview = ref<MarketOverviewData | null>(null);
const trend = ref<TrendData | null>(null);
const distribution = ref<DistributionData | null>(null);
const ranking = ref<RankingData | null>(null);
const cities = ref<CityData | null>(null);
const requirements = ref<RequirementsData | null>(null);
const taskDetail = ref<TaskDetailData | null>(null);
const loading = ref(false);
const growthLoading = ref(false);
const error = ref("");

const metrics = computed(() => [
  { label: "通信相关岗位", value: overview.value?.communication_job_count ?? 0, note: "当前样本总量", icon: RadioTower, tone: "ink" },
  { label: "正在招聘", value: overview.value?.active_job_count ?? 0, note: "有效招聘需求", icon: Wifi, tone: "green" },
  { label: "近 7 日新增", value: overview.value?.new_job_count_7d ?? 0, note: "新发布岗位", icon: TrendingUp, tone: "blue" },
  { label: "近 7 日下架", value: overview.value?.offline_job_count_7d ?? 0, note: "已停止招聘", icon: TrendingDown, tone: "red" },
  { label: "近 7 日净增", value: overview.value?.net_change_7d ?? 0, note: "新增减去下架", icon: Network, tone: "amber" },
]);
const trendOption = computed(() => ({
  color: ["#26d9c7", "#4da3ff", "#ffd166"],
  backgroundColor: "transparent",
  tooltip: { trigger: "axis", backgroundColor: "#111b23", borderColor: "#26d9c7", textStyle: { color: "#eafdf9" } },
  legend: { top: 2, right: 8, textStyle: { color: "#9eb3b7" }, data: ["在招", "新增", "净变化"] },
  grid: { left: 50, right: 20, top: 45, bottom: 34 },
  xAxis: { type: "category", data: trend.value?.series.map((item) => item.period) ?? [], axisLine: { lineStyle: { color: "#344b54" } }, axisLabel: { color: "#789095" } },
  yAxis: { type: "value", splitLine: { lineStyle: { color: "rgba(92, 125, 132, .22)" } }, axisLabel: { color: "#789095" } },
  series: [
    { name: "在招", type: "line", smooth: true, symbolSize: 7, data: trend.value?.series.map((item) => item.active_count) ?? [] },
    { name: "新增", type: "bar", barMaxWidth: 18, data: trend.value?.series.map((item) => item.new_count) ?? [] },
    { name: "净变化", type: "line", smooth: true, data: trend.value?.series.map((item) => item.net_change) ?? [] },
  ],
}));
const distributionOption = computed(() => ({
  color: ["#26d9c7", "#4da3ff", "#ffd166", "#ff6b6b", "#b49aff"],
  tooltip: { trigger: "item", formatter: "{b}<br/>{c} 个 ({d}%)", backgroundColor: "#111b23", borderColor: "#26d9c7", textStyle: { color: "#eafdf9" } },
  series: [{ type: "pie", radius: ["48%", "72%"], center: ["50%", "52%"], label: { color: "#9eb3b7", formatter: "{b}\n{d}%" }, data: distribution.value?.items.map((item) => ({ name: item.name, value: item.job_count })) ?? [] }],
}));
const cityOption = computed(() => ({
  color: ["#4da3ff"],
  tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "#111b23", borderColor: "#4da3ff", textStyle: { color: "#eafdf9" } },
  grid: { left: 72, right: 26, top: 18, bottom: 28 },
  xAxis: { type: "value", splitLine: { lineStyle: { color: "rgba(92, 125, 132, .22)" } }, axisLabel: { color: "#789095" } },
  yAxis: { type: "category", data: cities.value?.cities.map((item) => item.city_name).reverse() ?? [], axisLabel: { color: "#9eb3b7" } },
  series: [{ type: "bar", barMaxWidth: 18, data: cities.value?.cities.map((item) => item.active_count).reverse() ?? [] }],
}));
const requirementCards = computed(() => [
  { key: "salary", title: "薪资分布", items: requirements.value?.salary ?? [] },
  { key: "education", title: "学历要求", items: requirements.value?.education ?? [] },
  { key: "experience", title: "工作经验", items: requirements.value?.experience ?? [] },
  { key: "industry", title: "行业分布", items: requirements.value?.industry ?? [] },
]);

function formatNumber(value: number) { return new Intl.NumberFormat("zh-CN").format(value); }
function formatPercent(value: number, signed = false) {
  const result = `${Math.abs(value * 100).toFixed(1)}%`;
  return signed ? `${value >= 0 ? "+" : "-"}${result}` : result;
}
async function loadData() {
  loading.value = true; error.value = "";
  const snapshot = filters.snapshot();
  try {
    [overview.value, trend.value, distribution.value, ranking.value, cities.value, requirements.value] = await Promise.all([
      marketApi.overview(snapshot), marketApi.trend(snapshot, filters.granularity), marketApi.distribution(snapshot),
      marketApi.ranking(snapshot), marketApi.cities(snapshot, filters.granularity), marketApi.requirements(snapshot),
    ]);
  } catch (caught) { error.value = caught instanceof Error ? caught.message : "市场数据加载失败"; }
  finally { loading.value = false; }
}
async function loadGrowthTask() {
  growthLoading.value = true;
  try { taskDetail.value = await learningApi.task("PB-01"); }
  catch { taskDetail.value = null; }
  finally { growthLoading.value = false; }
}
function exportMarketData() {
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(trend.value?.series ?? []), "招聘趋势");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(ranking.value?.items ?? []), "岗位排行");
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(cities.value?.cities ?? []), "城市分析");
  XLSX.writeFile(workbook, `就业市场数据-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
watch(() => filters.revision, loadData);
onMounted(() => { void loadData(); void loadGrowthTask(); });
</script>
