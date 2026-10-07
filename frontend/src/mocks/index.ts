import { endpoints, type ApiPath } from "@/api/endpoints";
import bootstrap from "./data/system/bootstrap/success.json";
import taxonomy from "./data/taxonomy/tree/success.json";
import filterOptions from "./data/market/filter_options/success.json";
import overview from "./data/market/overview/success.json";
import trend from "./data/market/trend/success.json";
import distribution from "./data/market/role_distribution/success.json";
import ranking from "./data/market/role_ranking/success.json";
import cities from "./data/market/city_analysis/success.json";
import requirements from "./data/market/requirements/success.json";
import roleMap from "./data/roles/map/success.json";
import roleProfile from "./data/roles/profile/success.json";
import relations from "./data/roles/relations/success.json";
import compare from "./data/roles/compare/success.json";
import learningPath from "./data/learning_path/query/success.json";
import taskDetail from "./data/practice_tasks/detail/success.json";
import { getFormalTaskDetail } from "./data/practice_tasks/details";

const mockByPath: Record<ApiPath, unknown> = {
  [endpoints.bootstrap]: bootstrap,
  [endpoints.taxonomy]: taxonomy,
  [endpoints.filterOptions]: filterOptions,
  [endpoints.marketOverview]: overview,
  [endpoints.marketTrend]: trend,
  [endpoints.roleDistribution]: distribution,
  [endpoints.roleRanking]: ranking,
  [endpoints.cityAnalysis]: cities,
  [endpoints.requirements]: requirements,
  [endpoints.roleMap]: roleMap,
  [endpoints.roleProfile]: roleProfile,
  [endpoints.roleRelations]: relations,
  [endpoints.roleCompare]: compare,
  [endpoints.learningPath]: learningPath,
  [endpoints.taskDetail]: taskDetail,
};

export function getMockData<T>(path: ApiPath, payload?: unknown): T {
  if (path === endpoints.taskDetail) {
    const taskCode = typeof payload === "object" && payload !== null && "task_code" in payload ? String((payload as { task_code: unknown }).task_code) : "";
    const formalDetail = getFormalTaskDetail(taskCode);
    if (formalDetail) return structuredClone(formalDetail) as T;
  }
  const value = mockByPath[path];
  if (value === undefined) throw new Error(`未找到接口 Mock：${path}`);
  return structuredClone(value) as T;
}
