import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { systemApi } from "@/api/services";
import type { BootstrapData, FilterOptionsData, TaxonomyData, TaxonomyRole } from "@/types/api";

let initPromise: Promise<void> | null = null;

export const useSystemStore = defineStore("system", () => {
  const bootstrap = ref<BootstrapData | null>(null);
  const taxonomy = ref<TaxonomyData | null>(null);
  const filterOptions = ref<FilterOptionsData | null>(null);
  const loading = ref(false);
  const error = ref("");

  const roles = computed<TaxonomyRole[]>(() =>
    taxonomy.value?.families.flatMap((family) => family.directions.flatMap((direction) => direction.roles)) ?? [],
  );

  async function initialize(force = false) {
    if (!force && bootstrap.value && taxonomy.value && filterOptions.value) return;
    if (initPromise && !force) return initPromise;

    loading.value = true;
    error.value = "";
    initPromise = (async () => {
      try {
        const [bootstrapData, taxonomyData, optionsData] = await Promise.all([
          systemApi.bootstrap(),
          systemApi.taxonomy(),
          systemApi.filterOptions(),
        ]);
        bootstrap.value = bootstrapData;
        taxonomy.value = taxonomyData;
        filterOptions.value = optionsData;
      } catch (caught) {
        error.value = caught instanceof Error ? caught.message : "系统初始化失败";
        throw caught;
      } finally {
        loading.value = false;
        initPromise = null;
      }
    })();
    return initPromise;
  }

  return { bootstrap, taxonomy, filterOptions, roles, loading, error, initialize };
});
