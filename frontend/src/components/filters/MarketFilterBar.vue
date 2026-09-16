<template>
  <section class="filter-bar" aria-label="就业市场筛选">
    <div class="filter-bar__row">
      <el-date-picker
        v-model="filters.dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :clearable="false"
      />
      <el-select v-model="filters.filters.family_codes" multiple collapse-tags placeholder="岗位大类" clearable>
        <el-option v-for="item in system.taxonomy?.families" :key="item.family_code" :label="item.family_name" :value="item.family_code" />
      </el-select>
      <el-select v-model="filters.filters.city_codes" multiple collapse-tags placeholder="城市" clearable>
        <el-option v-for="item in system.filterOptions?.cities" :key="item.code" :label="item.name" :value="item.code" />
      </el-select>
      <el-select v-model="filters.filters.platform_codes" multiple collapse-tags placeholder="招聘平台" clearable>
        <el-option v-for="item in system.filterOptions?.platforms" :key="item.code" :label="item.name" :value="item.code" />
      </el-select>
      <el-segmented v-model="filters.granularity" :options="granularityOptions" />
      <div class="filter-bar__actions">
        <el-button :icon="RotateCcw" circle title="重置筛选" @click="filters.reset()" />
        <el-button type="primary" :icon="Search" @click="filters.apply()">查询</el-button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RotateCcw, Search } from "lucide-vue-next";
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
