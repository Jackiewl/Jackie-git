<template>
  <div ref="container" class="chart" role="img" :aria-label="ariaLabel"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, shallowRef, watch } from "vue";
import * as echarts from "echarts/core";
import { BarChart, GraphChart, LineChart, PieChart } from "echarts/charts";
import { DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import type { EChartsCoreOption } from "echarts/core";

echarts.use([BarChart, GraphChart, LineChart, PieChart, DatasetComponent, GridComponent, LegendComponent, TitleComponent, TooltipComponent, CanvasRenderer]);

const props = withDefaults(defineProps<{ option: EChartsCoreOption; ariaLabel?: string }>(), {
  ariaLabel: "数据可视化图表",
});
const container = ref<HTMLElement | null>(null);
const chart = shallowRef<echarts.ECharts | null>(null);
let observer: ResizeObserver | null = null;

onMounted(() => {
  if (!container.value) return;
  chart.value = echarts.init(container.value);
  chart.value.setOption(props.option);
  observer = new ResizeObserver(() => chart.value?.resize());
  observer.observe(container.value);
});

watch(() => props.option, (option) => chart.value?.setOption(option, true), { deep: true });

onBeforeUnmount(() => {
  observer?.disconnect();
  chart.value?.dispose();
});
</script>

<style scoped>
.chart { width: 100%; height: 300px; min-height: 260px; }
</style>
