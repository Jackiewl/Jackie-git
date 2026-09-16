import { computed, reactive, ref } from "vue";
import { defineStore } from "pinia";
import dayjs from "dayjs";
import type { MarketFilters } from "@/types/api";

function defaultFilters(): MarketFilters {
  return {
    date_from: dayjs().subtract(29, "day").format("YYYY-MM-DD"),
    date_to: dayjs().format("YYYY-MM-DD"),
    family_codes: [],
    direction_codes: [],
    role_codes: [],
    city_codes: [],
    platform_codes: [],
    job_status: "active",
  };
}

export const useFilterStore = defineStore("filters", () => {
  const filters = reactive<MarketFilters>(defaultFilters());
  const granularity = ref<"day" | "week" | "month">("day");
  const revision = ref(0);
  const dateRange = computed<[string, string] | undefined>({
    get: (): [string, string] | undefined =>
      filters.date_from && filters.date_to ? [filters.date_from, filters.date_to] : undefined,
    set: (value: [string, string] | undefined) => {
      filters.date_from = value?.[0];
      filters.date_to = value?.[1];
    },
  });

  function apply() { revision.value += 1; }
  function reset() {
    Object.assign(filters, defaultFilters());
    granularity.value = "day";
    apply();
  }
  function snapshot(): MarketFilters {
    return JSON.parse(JSON.stringify(filters)) as MarketFilters;
  }

  return { filters, granularity, revision, dateRange, apply, reset, snapshot };
});
