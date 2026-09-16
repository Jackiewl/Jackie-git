export const endpoints = {
  bootstrap: "/api/v1/system/bootstrap/query",
  taxonomy: "/api/v1/taxonomy/tree/query",
  filterOptions: "/api/v1/market/filter-options/query",
  marketOverview: "/api/v1/market/overview/query",
  marketTrend: "/api/v1/market/trend/query",
  roleDistribution: "/api/v1/market/role-distribution/query",
  roleRanking: "/api/v1/market/role-ranking/query",
  cityAnalysis: "/api/v1/market/city-analysis/query",
  requirements: "/api/v1/market/requirements/query",
  roleMap: "/api/v1/roles/map/query",
  roleProfile: "/api/v1/roles/profile/query",
  roleRelations: "/api/v1/roles/relations/query",
  roleCompare: "/api/v1/roles/compare",
  learningPath: "/api/v1/learning-path/query",
  taskDetail: "/api/v1/practice-tasks/detail/query",
} as const;

export type ApiPath = (typeof endpoints)[keyof typeof endpoints];
