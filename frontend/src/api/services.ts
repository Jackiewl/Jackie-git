import { postApi } from "./client";
import { endpoints } from "./endpoints";
import type {
  BootstrapData,
  CityData,
  CompareData,
  DistributionData,
  FilterOptionsData,
  LearningPathData,
  MarketFilters,
  MarketOverviewData,
  RankingData,
  RelationsData,
  RequirementsData,
  RoleMapData,
  RoleProfileData,
  TaskDetailData,
  TaxonomyData,
  TrendData,
} from "@/types/api";

export const systemApi = {
  bootstrap: () => postApi<BootstrapData, { include_module_status: boolean }>(endpoints.bootstrap, { include_module_status: true }),
  taxonomy: () => postApi<TaxonomyData, { active_only: boolean }>(endpoints.taxonomy, { active_only: true }),
  filterOptions: () => postApi<FilterOptionsData, { include_platforms: boolean }>(endpoints.filterOptions, { include_platforms: true }),
};

export const marketApi = {
  overview: (filters: MarketFilters) => postApi<MarketOverviewData, { filters: MarketFilters }>(endpoints.marketOverview, { filters }),
  trend: (filters: MarketFilters, granularity: string) => postApi<TrendData, object>(endpoints.marketTrend, { filters, options: { granularity, limit: 30 }, compare_previous_period: true }),
  distribution: (filters: MarketFilters) => postApi<DistributionData, object>(endpoints.roleDistribution, { filters, taxonomy_level: "family" }),
  ranking: (filters: MarketFilters) => postApi<RankingData, object>(endpoints.roleRanking, { filters, ranking_type: "demand", limit: 10 }),
  cities: (filters: MarketFilters, granularity: string) => postApi<CityData, object>(endpoints.cityAnalysis, { filters, options: { granularity, limit: 10 } }),
  requirements: (filters: MarketFilters) => postApi<RequirementsData, object>(endpoints.requirements, { filters, dimensions: ["salary", "education", "experience", "industry", "company"] }),
};

export const roleApi = {
  map: (family_codes: string[], direction_codes: string[]) => postApi<RoleMapData, object>(endpoints.roleMap, { family_codes, direction_codes }),
  profile: (role_code: string, market_filters?: Partial<MarketFilters>) => postApi<RoleProfileData, object>(endpoints.roleProfile, { role_code, market_filters }),
  relations: (family_codes: string[], direction_codes: string[], role_codes: string[] = []) => postApi<RelationsData, object>(endpoints.roleRelations, { family_codes, direction_codes, role_codes }),
  compare: (role_code_a: string, role_code_b: string) => postApi<CompareData, object>(endpoints.roleCompare, { role_code_a, role_code_b }),
};

export const learningApi = {
  path: (role_code: string) => postApi<LearningPathData, { role_code: string }>(endpoints.learningPath, { role_code }),
  task: (task_code: string) => postApi<TaskDetailData, { task_code: string }>(endpoints.taskDetail, { task_code }),
};
