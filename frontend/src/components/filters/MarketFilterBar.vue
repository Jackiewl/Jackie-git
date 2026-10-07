<template>
  <section class="filter-bar" aria-label="就业市场筛选">
    <div class="filter-bar__heading">
      <div><SlidersHorizontal :size="17" /><strong>市场筛选</strong></div>
      <span>筛选条件将在全部市场图表中生效</span>
    </div>
    <div class="filter-bar__row">
      <label class="filter-field filter-field--date">
        <span>统计日期</span>
        <el-date-picker
          v-model="filters.dateRange"
          type="daterange"
          value-format="YYYY-MM-DD"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          aria-label="统计日期范围"
          :clearable="false"
        />
      </label>
      <label class="filter-field">
        <span>岗位大类</span>
        <el-select v-model="filters.filters.family_codes" multiple collapse-tags placeholder="全部大类" aria-label="岗位大类" clearable>
          <el-option v-for="item in system.taxonomy?.families" :key="item.family_code" :label="item.family_name" :value="item.family_code" />
        </el-select>
      </label>
      <label class="filter-field">
        <span>就业城市</span>
        <el-select v-model="filters.filters.city_codes" multiple collapse-tags placeholder="全部城市" aria-label="就业城市" clearable>
          <el-option v-for="item in system.filterOptions?.cities" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </label>
      <label class="filter-field">
        <span>招聘平台</span>
        <el-select v-model="filters.filters.platform_codes" multiple collapse-tags placeholder="全部平台" aria-label="招聘平台" clearable>
          <el-option v-for="item in system.filterOptions?.platforms" :key="item.code" :label="item.name" :value="item.code" />
        </el-select>
      </label>
      <div class="filter-field filter-field--period">
        <span>统计周期</span>
        <el-segmented v-model="filters.granularity" :options="granularityOptions" aria-label="统计周期" />
      </div>
      <div class="filter-bar__actions">
        <el-tooltip content="重置筛选" placement="top">
          <el-button :icon="RotateCcw" circle aria-label="重置筛选" @click="filters.reset()" />
        </el-tooltip>
        <el-button type="primary" :icon="Search" @click="filters.apply()">查询</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RotateCcw, Search, SlidersHorizontal } from "lucide-vue-next";
import { useFilterStore } from "@/stores/filters";
import { useSystemStore } from "@/stores/system";

const filters = useFilterStore();
const system = useSystemStore();
const granularityOptions = [
  { label: "日", value: "day" },
  { label: "周", value: "week" },
  { label: "月", value: "month" },
];
</script>
