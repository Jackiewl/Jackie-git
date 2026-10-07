<template>
  <div class="cover-page">
    <a class="skip-link" href="#main-content">跳到主要内容</a>
    <TopNavigation />

    <main id="main-content" class="cover-main">
      <section class="cover-section cover-hero" aria-labelledby="command-title">
        <NebulaCanvas />
        <div class="cover-hero__grid" aria-hidden="true"></div>
        <div class="command-hero__copy">
          <span class="hud-kicker"><Orbit :size="15" /> 通信工程就业能力系统</span>
          <h1 id="command-title">让每一次实践，<br />都能照亮一块能力模块。</h1>
          <p>从 117 个标准岗位出发，把岗位要求拆成能力、工具与任务。选择目标，完成实践，观察训练贡献如何进入你的成长图谱。</p>
          <div class="command-hero__actions">
            <el-button class="glow-action" type="primary" :icon="LayoutDashboard" @click="goWorkspace">进入学生工作台</el-button>
            <el-button class="glow-action" :icon="MapPinned" @click="goRoles">探索岗位画像</el-button>
          </div>
          <div class="cover-hero__signal"><span></span>向下滚动，查看岗位到学习路径的完整链路</div>
        </div>
        <div class="cover-hero__orbital" aria-hidden="true">
          <span class="orbital-ring orbital-ring--outer"></span>
          <span class="orbital-ring orbital-ring--middle"></span>
          <span class="orbital-ring orbital-ring--inner"></span>
          <span class="orbital-cross orbital-cross--horizontal"></span>
          <span class="orbital-cross orbital-cross--vertical"></span>
          <span class="orbital-core"></span>
          <span class="orbital-readout orbital-readout--top">LIVE SIGNAL<small>ROLE / SKILL / TOOL</small></span>
          <span class="orbital-readout orbital-readout--bottom">PATH ENGINE<small>READY TO MAP</small></span>
        </div>
      </section>

      <section class="cover-section cover-method" aria-labelledby="method-title">
        <div class="cover-method__intro">
          <span class="hud-kicker"><Waypoints :size="15" /> 方法论链路</span>
          <h2 id="method-title">把市场信号，转译成可以执行的下一步。</h2>
          <p class="cover-method__statement">通过招聘岗位数据建立“岗位—能力—技术工具”画像，再将其匹配到 PB/PF/JP/CP 四级实践任务并计算岗位覆盖度，最终生成从目标岗位、所需能力到学习资源和实践项目的可执行学习路径。</p>
          <p class="cover-method__support">先看清岗位，再知道差距，最后用项目和任务完成能力校准。</p>
        </div>
        <LearningSystemDiagram />
        <div class="cover-method__stage-heading">
          <span class="hud-kicker"><Layers3 :size="15" /> 四级实践任务怎么递进</span>
          <p>同一个目标岗位，从能运行到能交付，训练深度逐级增加。</p>
        </div>
        <PracticeStageLegend />
      </section>

      <section class="cover-section cover-signal" aria-labelledby="signal-title">
        <div class="cover-signal__heading">
          <div>
            <span class="hud-kicker"><Radar :size="15" /> 目标岗位信号</span>
            <h2 id="signal-title">无线通信算法工程师</h2>
            <p>用标准岗位画像定位能力重点，用市场在招数据校准行动顺序。</p>
          </div>
          <span class="cover-signal__code">ROLE / SIGNAL</span>
        </div>

        <div class="cover-signal__body">
          <div class="target-signal" aria-label="无线通信算法工程师目标岗位信号">
            <div class="target-signal__rings" aria-hidden="true"><i></i><i></i><i></i></div>
            <div class="target-signal__core">
              <span>目标岗位</span>
              <strong>无线通信<br />算法工程师</strong>
              <small>标准岗位画像</small>
            </div>
            <div class="target-signal__readout target-signal__readout--top"><b>85%</b><span>路线覆盖</span></div>
            <div class="target-signal__readout target-signal__readout--bottom"><b>{{ activeJobs }}</b><span>市场在招</span></div>
          </div>

          <div class="cover-signal__data">
            <div class="signal-data__lead"><strong>标准数据底座</strong><span>把岗位目标拆成可观察的结构化信号</span></div>
            <dl class="system-scale" aria-label="标准数据规模">
              <div><dt>标准岗位</dt><dd>117</dd><span>岗位族与方向</span></div>
              <div><dt>实践任务</dt><dd>165</dd><span>PB / PF / JP / CP</span></div>
              <div><dt>微能力</dt><dd>480</dd><span>可训练能力单元</span></div>
              <div><dt>技术工具</dt><dd>201</dd><span>工程工具标准库</span></div>
            </dl>
            <div class="cover-signal__actions">
              <el-button class="glow-action" type="primary" :icon="LayoutDashboard" @click="goWorkspace">进入学生工作台</el-button>
              <el-button class="glow-action" :icon="MapPinned" @click="goRoles">探索岗位画像</el-button>
              <el-button class="glow-action" :icon="Route" @click="goLearning">查看标准学习路径</el-button>
              <el-button class="glow-action" :icon="Route" @click="goLearning">查看标准学习路径</el-button>
            </div>
          </div>
        </div>
      </section>

      <section class="cover-section cover-market" aria-labelledby="cover-market-title">
        <div class="cover-market__header">
          <div>
            <span class="hud-kicker"><BarChart3 :size="15" /> 近期岗位扫描</span>
            <h2 id="cover-market-title">把招聘数据拆成可读的岗位地图</h2>
            <p>选择时间段和岗位族，查看五大类、方向、城市与招聘门槛的实时结构。岗位名称均可进入岗位画像。</p>
          </div>
          <span class="cover-signal__code">MARKET / LIVE SNAPSHOT</span>
        </div>

        <div class="cover-market__controls" aria-label="岗位统计筛选">
          <label class="cover-market__field"><span>统计时间段</span><el-date-picker v-model="dateRange" type="daterange" value-format="YYYY-MM-DD" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" :clearable="false" /></label>
          <label class="cover-market__field"><span>岗位分类</span><el-select v-model="selectedFamily" clearable placeholder="全部五大类"><el-option label="全部五大类" value="" /><el-option v-for="family in system.taxonomy?.families ?? []" :key="family.family_code" :label="family.family_name" :value="family.family_code" /></el-select></label>
          <label class="cover-market__field cover-market__field--period"><span>统计粒度</span><el-segmented v-model="granularity" :options="granularityOptions" /></label>
          <el-button type="primary" :icon="RefreshCw" :loading="marketLoading" @click="loadMarket">更新统计</el-button>
        </div>

        <StatePanel v-if="marketLoading && !overview" loading />
        <StatePanel v-else-if="marketError && !overview" :error="marketError" @retry="loadMarket" />
        <template v-else>
          <div class="cover-market__metrics" aria-label="近期岗位指标">
            <div><span>岗位样本</span><strong>{{ formatNumber(overview?.communication_job_count ?? 0) }}</strong><small>当前时间段</small></div>
            <div><span>正在招聘</span><strong>{{ formatNumber(overview?.active_job_count ?? 0) }}</strong><small>有效需求</small></div>
            <div><span>近 7 日新增</span><strong>{{ formatNumber(overview?.new_job_count_7d ?? 0) }}</strong><small>新发布</small></div>
            <div><span>近 7 日净增</span><strong>{{ formatNumber(overview?.net_change_7d ?? 0) }}</strong><small>新增减下架</small></div>
          </div>

          <div class="cover-market__top-grid">
            <div class="cover-market__panel cover-market__panel--trend"><div class="cover-market__panel-head"><div><span>需求脉冲</span><h3>岗位数量趋势</h3></div><b>{{ granularityLabel }}</b></div><EChart :option="trendOption" aria-label="岗位数量趋势图" /></div>
            <div class="cover-market__panel cover-market__panel--families"><div class="cover-market__panel-head"><div><span>五大岗位族</span><h3>岗位分类占比</h3></div><b>{{ formatNumber(familyTotal) }} 条</b></div><div class="cover-bars"><div v-for="item in visibleFamilyItems" :key="item.code" class="cover-bar-row"><div class="cover-bar-row__label"><span>{{ item.name }}</span><strong>{{ formatPercent(item.percentage) }}</strong></div><div class="cover-bar"><i :style="{ width: `${Math.max(item.percentage * 100, 2)}%` }"></i></div><small>{{ formatNumber(item.job_count) }} 个岗位</small></div></div></div>
          </div>

          <div class="cover-market__families" aria-label="岗位族与方向分布">
            <article v-for="family in visibleFamilies" :key="family.family_code" class="cover-family-card">
              <header><div><h3>{{ family.family_name }}</h3></div><strong>{{ formatPercent(familyShare(family.family_code)) }}</strong></header>
              <div class="cover-bar cover-bar--family"><i :style="{ width: `${Math.max(familyShare(family.family_code) * 100, 2)}%` }"></i></div>
              <div class="cover-family-card__directions"><div v-for="item in directionRows(family.family_code)" :key="item.code" class="cover-bar-row cover-bar-row--small"><div class="cover-bar-row__label"><span>{{ item.name }}</span><strong>{{ formatPercent(item.percentage) }}</strong></div><div class="cover-bar"><i :style="{ width: `${Math.max(item.percentage * 100, 2)}%` }"></i></div><small>{{ formatNumber(item.job_count) }} 个岗位</small></div></div>
            </article>
          </div>

          <div class="cover-market__bottom-grid">
            <div v-for="item in requirementCharts" :key="item.key" class="cover-market__panel cover-market__panel--requirement"><div class="cover-market__panel-head"><div><span>{{ item.eyebrow }}</span><h3>{{ item.title }}</h3></div><b>占比</b></div><EChart :option="item.option" :aria-label="`${item.title}柱状图`" /></div>
            <div class="cover-market__panel cover-market__panel--city"><div class="cover-market__panel-head"><div><span>空间分布</span><h3>城市岗位数量</h3></div><b>在招</b></div><EChart :option="cityOption" aria-label="城市岗位数量柱状图" /></div>
          </div>

          <div class="cover-market__roles">
            <div class="cover-market__panel-head"><div><span>岗位入口</span><h3>按岗位查看画像</h3></div><b>{{ system.roles.length }} 个标准岗位</b></div>
            <div class="cover-role-directory"><details v-for="family in visibleFamilies" :key="family.family_code" :open="selectedFamily ? selectedFamily === family.family_code : family.family_code === 'P1'"><summary><span>{{ family.family_name }}</span><b>{{ familyRoleCount(family.family_code) }} 个岗位</b></summary><div v-for="direction in family.directions" :key="direction.direction_code" class="cover-role-direction"><span>{{ direction.direction_name }}</span><div><RouterLink v-for="role in direction.roles" :key="role.role_code" :to="{ name: 'roles', query: { role: role.role_code } }">{{ role.role_name }}</RouterLink></div></div></details></div>
          </div>
        </template>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import dayjs from "dayjs";
import { useRouter } from "vue-router";
import { BarChart3, Layers3, LayoutDashboard, MapPinned, Orbit, Radar, RefreshCw, Route, Waypoints } from "lucide-vue-next";
import { marketApi } from "@/api/services";
import EChart from "@/components/charts/EChart.vue";
import StatePanel from "@/components/common/StatePanel.vue";
import LearningSystemDiagram from "@/components/cover/LearningSystemDiagram.vue";
import NebulaCanvas from "@/components/cover/NebulaCanvas.vue";
import PracticeStageLegend from "@/components/cover/PracticeStageLegend.vue";
import TopNavigation from "@/components/navigation/TopNavigation.vue";
import { useSystemStore } from "@/stores/system";
import type { MarketFilters, RequirementsData } from "@/types/api";

const router = useRouter();
const system = useSystemStore();
const dateRange = ref<[string, string] | undefined>();
const selectedFamily = ref("");
const granularity = ref<"day" | "week" | "month">("day");
const granularityOptions = [{ label: "日", value: "day" }, { label: "周", value: "week" }, { label: "月", value: "month" }];
const marketLoading = ref(false);
const marketError = ref("");
const overview = ref<{ communication_job_count: number; active_job_count: number; new_job_count_7d: number; offline_job_count_7d: number; net_change_7d: number } | null>(null);
const trend = ref<{ series: Array<{ period: string; active_count: number; new_count: number; offline_count: number; net_change: number }> } | null>(null);
const distribution = ref<{ total: number; items: Array<{ code: string; name: string; job_count: number; percentage: number }> } | null>(null);
const directionDistribution = ref<{ items: Array<{ code: string; name: string; job_count: number; percentage: number }> } | null>(null);
const cityData = ref<{ cities: Array<{ city_name: string; active_count: number }> } | null>(null);
const requirements = ref<RequirementsData | null>(null);

const activeJobCount = computed(() => overview.value?.active_job_count ?? 0);
const activeJobs = computed(() => new Intl.NumberFormat("zh-CN").format(activeJobCount.value));
const granularityLabel = computed(() => ({ day: "按日", week: "按周", month: "按月" })[granularity.value]);
const visibleFamilies = computed(() => (system.taxonomy?.families ?? []).filter((family) => !selectedFamily.value || family.family_code === selectedFamily.value));
const familyTotal = computed(() => distribution.value?.total || overview.value?.communication_job_count || 0);
const visibleFamilyItems = computed(() => {
  const items = distribution.value?.items.filter((item) => /^P[1-5]$/.test(item.code)) ?? [];
  return items.filter((item) => !selectedFamily.value || item.code === selectedFamily.value);
});

const trendOption = computed(() => ({
  color: ["#26d9c7", "#4da3ff", "#ffd166"], backgroundColor: "transparent", tooltip: { trigger: "axis", backgroundColor: "#111b23", borderColor: "#26d9c7", textStyle: { color: "#eafdf9" } }, legend: { top: 2, right: 8, textStyle: { color: "#9eb3b7" }, data: ["在招", "新增", "净变化"] }, grid: { left: 42, right: 18, top: 38, bottom: 32 }, xAxis: { type: "category", data: trend.value?.series.map((item) => item.period) ?? [], axisLine: { lineStyle: { color: "#344b54" } }, axisLabel: { color: "#789095" } }, yAxis: { type: "value", splitLine: { lineStyle: { color: "rgba(92, 125, 132, .22)" } }, axisLabel: { color: "#789095" } }, series: [{ name: "在招", type: "line", smooth: true, symbolSize: 6, data: trend.value?.series.map((item) => item.active_count) ?? [] }, { name: "新增", type: "bar", barMaxWidth: 14, data: trend.value?.series.map((item) => item.new_count) ?? [] }, { name: "净变化", type: "line", smooth: true, data: trend.value?.series.map((item) => item.net_change) ?? [] }],
}));

const cityOption = computed(() => {
  const cities = cityData.value?.cities ?? [];
  const total = cities.reduce((sum, item) => sum + item.active_count, 0) || 1;
  return makeBarOption(cities.map((item) => ({ label: item.city_name, count: item.active_count, percentage: item.active_count / total })), "#4da3ff");
});
const requirementCharts = computed(() => [
  { key: "salary", eyebrow: "招聘门槛", title: "薪资分布", option: makeBarOption(requirements.value?.salary ?? [], "#26d9c7") },
  { key: "education", eyebrow: "招聘门槛", title: "学历要求", option: makeBarOption(requirements.value?.education ?? [], "#4da3ff") },
  { key: "experience", eyebrow: "招聘门槛", title: "工作经验", option: makeBarOption(requirements.value?.experience ?? [], "#ffd166") },
]);

function makeBarOption(items: Array<{ label: string; count: number; percentage: number }>, color: string, percentage = true) {
  const rows = [...items].sort((a, b) => (percentage ? b.percentage - a.percentage : b.count - a.count)).slice(0, 8).reverse();
  return { color: [color], backgroundColor: "transparent", tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, backgroundColor: "#111b23", borderColor: color, textStyle: { color: "#eafdf9" }, formatter: (params: Array<{ name: string; value: number }>) => `${params[0]?.name ?? ""}<br/>${percentage ? `${Number(params[0]?.value ?? 0).toFixed(1)}%` : formatNumber(Number(params[0]?.value ?? 0))}` }, grid: { left: 84, right: 26, top: 12, bottom: 22 }, xAxis: { type: "value", max: percentage ? 100 : undefined, axisLabel: { color: "#789095", formatter: percentage ? "{value}%" : "{value}" }, splitLine: { lineStyle: { color: "rgba(92, 125, 132, .2)" } } }, yAxis: { type: "category", data: rows.map((item) => item.label), axisLabel: { color: "#b8cfcc", width: 76, overflow: "truncate" } }, series: [{ type: "bar", barMaxWidth: 16, data: rows.map((item) => percentage ? Number((item.percentage * 100).toFixed(1)) : item.count), label: { show: true, position: "right", color: "#d6e8e5", formatter: (params: { value: number }) => percentage ? `${params.value}%` : formatNumber(params.value) } }], };
}

function formatNumber(value: number) { return new Intl.NumberFormat("zh-CN").format(value); }
function formatPercent(value: number) { return `${(value * 100).toFixed(1)}%`; }
function familyShare(code: string) { return visibleFamilyItems.value.find((item) => item.code === code)?.percentage ?? 0; }
function familyRoleCount(code: string) { return system.taxonomy?.families.find((family) => family.family_code === code)?.directions.reduce((total, direction) => total + direction.roles.length, 0) ?? 0; }
function directionRows(code: string) {
  const family = system.taxonomy?.families.find((item) => item.family_code === code);
  const familyCount = visibleFamilyItems.value.find((item) => item.code === code)?.job_count ?? 0;
  const liveRows = (directionDistribution.value?.items ?? []).filter((item) => item.code.startsWith(`${code}.`));
  if (liveRows.length) return liveRows.map((item) => ({ code: item.code, name: item.name, job_count: item.job_count, percentage: item.percentage }));
  const roles = family?.directions.reduce((total, direction) => total + direction.roles.length, 0) || 1;
  let remaining = familyCount;
  return (family?.directions ?? []).map((direction, index) => {
    const jobCount = index === (family?.directions.length ?? 1) - 1 ? remaining : Math.round(familyCount * direction.roles.length / roles);
    remaining -= jobCount;
    return { code: direction.direction_code, name: direction.direction_name, job_count: jobCount, percentage: familyCount ? jobCount / familyCount : 0 };
  });
}

function buildFilters(): MarketFilters {
  return { date_from: dateRange.value?.[0], date_to: dateRange.value?.[1], family_codes: selectedFamily.value ? [selectedFamily.value] : [], direction_codes: [], role_codes: [], city_codes: [], platform_codes: [], job_status: "active" };
}

async function loadMarket() {
  marketLoading.value = true; marketError.value = "";
  try {
    const filters = buildFilters();
    const [overviewData, trendData, distributionData, directionData, cityResult, requirementData] = await Promise.all([marketApi.overview(filters), marketApi.trend(filters, granularity.value), marketApi.distribution(filters, "family"), marketApi.distribution(filters, "direction"), marketApi.cities(filters, granularity.value), marketApi.requirements(filters)]);
    overview.value = overviewData; trend.value = trendData; distribution.value = distributionData; directionDistribution.value = directionData; cityData.value = cityResult; requirements.value = requirementData;
  } catch (caught) { marketError.value = caught instanceof Error ? caught.message : "岗位统计加载失败"; }
  finally { marketLoading.value = false; }
}

function goWorkspace() { void router.push({ path: "/workspace", query: { from: "cover" } }); }
function goRoles() { void router.push({ path: "/roles", query: { from: "cover" } }); }
function goLearning() { void router.push({ path: "/learning", query: { role: "P1.1.1", from: "cover" } }); }

onMounted(async () => {
  try {
    await system.initialize();
    const maxDate = system.filterOptions?.date_range.max_date ?? dayjs().format("YYYY-MM-DD");
    dateRange.value = [dayjs(maxDate).subtract(29, "day").format("YYYY-MM-DD"), maxDate];
  } catch { /* Market error state remains visible if initialization fails. */ }
  await loadMarket();
});
</script>
