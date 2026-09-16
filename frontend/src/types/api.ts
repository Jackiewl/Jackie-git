export interface ApiMeta {
  request_id: string;
  generated_at?: string;
  data_updated_at?: string | null;
  timezone?: string;
}

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T | null;
  meta: ApiMeta;
}

export interface MarketFilters {
  date_from?: string;
  date_to?: string;
  family_codes: string[];
  direction_codes: string[];
  role_codes: string[];
  city_codes: string[];
  platform_codes: string[];
  job_status: "active" | "offline" | "all";
}

export interface NamedOption {
  code: string;
  name: string;
  job_count?: number;
}

export interface TaxonomyRole {
  role_code: string;
  role_name: string;
  work_scope: string;
}

export interface TaxonomyDirection {
  direction_code: string;
  direction_name: string;
  roles: TaxonomyRole[];
}

export interface TaxonomyFamily {
  family_code: string;
  family_name: string;
  directions: TaxonomyDirection[];
}

export interface BootstrapData {
  system_name: string;
  api_version: string;
  data_mode: string;
  default_filters: { recent_days: number; region: string; job_status: string };
  module_status: Record<string, string>;
  latest_refresh: { status: string; finished_at: string; data_version: string };
}

export interface TaxonomyData {
  families: TaxonomyFamily[];
  counts: { families: number; directions: number; roles: number };
}

export interface FilterOptionsData {
  cities: NamedOption[];
  platforms: NamedOption[];
  job_statuses: NamedOption[];
  granularities: Array<"day" | "week" | "month">;
  date_range: { min_date: string; max_date: string };
}

export interface MarketOverviewData {
  communication_job_count: number;
  active_job_count: number;
  new_job_count_7d: number;
  offline_job_count_7d: number;
  net_change_7d: number;
}

export interface TrendPoint {
  period: string;
  active_count: number;
  new_count: number;
  offline_count: number;
  net_change: number;
}

export interface TrendData {
  granularity: string;
  series: TrendPoint[];
  previous_period: TrendPoint[];
}

export interface DistributionData {
  taxonomy_level: string;
  total: number;
  items: Array<{ code: string; name: string; job_count: number; percentage: number }>;
}

export interface RankingData {
  ranking_type: string;
  items: Array<{
    rank: number;
    role_code: string;
    role_name: string;
    value: number;
    change_rate: number;
  }>;
}

export interface CityData {
  cities: Array<{
    city_code: string;
    city_name: string;
    active_count: number;
    new_count: number;
    offline_count: number;
    net_change: number;
  }>;
  trend: unknown[];
  hot_roles: unknown[];
}

export interface RequirementItem {
  label: string;
  count: number;
  percentage: number;
}

export interface RequirementsData {
  salary: RequirementItem[];
  education: RequirementItem[];
  experience: RequirementItem[];
  industry: RequirementItem[];
  company: RequirementItem[];
}

export interface RoleMapItem {
  role_code: string;
  role_name: string;
  role_family_code: string;
  role_family_name: string;
  direction_code: string;
  direction_name: string;
  work_scope: string;
  ability_count: number;
  tool_count: number;
  active_job_count: number;
}

export interface RoleMapData { roles: RoleMapItem[] }

export interface RoleProfileData {
  role: RoleMapItem;
  market: { active_job_count: number; data_updated_at: string };
  ability_groups: Array<{
    ability_unit_code: string;
    ability_unit_name: string;
    definition: string;
    support_weight: number;
    weight_label: string;
    micro_abilities: Array<{
      micro_ability_code: string;
      micro_ability_name: string;
      definition: string;
    }>;
  }>;
  tools: Array<{
    tool_code: string;
    standard_name: string;
    item_type: string;
    requirement_value: number;
    requirement_label: string;
  }>;
  similar_roles: Array<{ role_code: string; role_name: string; distinction_text: string }>;
}

export interface RelationsData {
  nodes: Array<{
    role_code: string;
    role_name: string;
    role_family_code: string;
    direction_code: string;
  }>;
  edges: Array<{
    source_role_code: string;
    target_role_code: string;
    relation_type: string;
    summary: string;
  }>;
}

export interface CompareData {
  roles: Array<{ role_code: string; role_name: string; work_scope: string }>;
  ability_difference: { common: string[]; only_a: string[]; only_b: string[] };
  tool_difference: { common: string[]; only_a: string[]; only_b: string[] };
  market: unknown[];
  paths: unknown[];
}

export interface LearningPathData {
  role: { role_code: string; role_name: string; direction_name: string };
  summary: { total_task_count: number; main_task_count: number; supplement_task_count: number };
  coverage: {
    micro_ability_weighted_satisfaction: number;
    core_micro_ability_pass_rate: number;
    tool_weighted_satisfaction: number;
    core_tool_pass_rate: number;
    overall_satisfaction: number;
  };
  stages: Array<{
    stage_code: "PB" | "PF" | "JP" | "CP";
    stage_name: string;
    stage_order: number;
    tasks: Array<{
      task_code: string;
      task_name: string;
      task_role: "main" | "supplement";
      selection_reason: string;
    }>;
  }>;
}

export interface TaskDetailData {
  task: {
    task_code: string;
    task_name: string;
    task_level: string;
    engineering_background: string;
    task_objective: string;
    task_content: string;
  };
  courses: Array<{ course_code: string; course_name: string; relation_type: string }>;
  steps: Array<{
    step_no: number;
    subitem_code: string;
    original_text: string;
    detail_text: string;
    acceptance_criteria: string;
  }>;
  outputs: Array<{ output_text: string }>;
  micro_abilities: Array<{
    micro_ability_code: string;
    micro_ability_name: string;
    training_value: number;
    training_label: string;
  }>;
  tools: Array<{
    tool_code: string;
    tool_name: string;
    improvement_value: number;
    improvement_label: string;
  }>;
  prerequisite_tasks: Array<{ task_code: string; task_name: string }>;
}
