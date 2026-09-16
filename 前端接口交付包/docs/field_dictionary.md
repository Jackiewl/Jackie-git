# 字段字典

## 公共响应

| 字段 | 含义 |
|---|---|
| `code` | 0 表示成功，非 0 表示业务错误 |
| `message` | 结果说明 |
| `data` | 当前接口的数据 |
| `meta.request_id` | 单次请求唯一编号 |
| `meta.generated_at` | 响应生成时间，北京时间 |
| `meta.data_updated_at` | 数据最近刷新时间，可空 |
| `meta.timezone` | 固定为 `Asia/Shanghai` |

## 公共筛选

| 字段 | 含义 |
|---|---|
| `date_from` / `date_to` | 统计起止日期，均包含当天；未传时默认最近 30 天 |
| `family_codes` | 5 个岗位大类编码；空数组表示全部 |
| `direction_codes` | 28 个专业方向编码；空数组表示全部 |
| `role_codes` | 117 个标准岗位编码；空数组表示全部 |
| `city_codes` | 当前版本填写标准化城市名称 |
| `platform_codes` | `boss`、`liepin`、`yupao`、`shixiseng`、`51job`、`zhilian` |
| `job_status` | `active`、`offline` 或 `all` |
| `granularity` | 趋势颗粒度：`day`、`week`、`month` |

## 学习路径数值

| 数值 | 含义 | 中文等级 |
|---|---|---|
| `W` / `support_weight` | 岗位对能力单元的要求权重 | 1.0 定义性核心；0.8 高度重要；0.6 重要支撑；0.4 一般支撑 |
| `R` / `requirement_value` | 岗位对技术或工具的要求度 | 0.8 核心工具；0.6 主要应用；0.4 基础常用；0.2 了解加分 |
| `T` / `training_value` | 实践任务对微能力的训练贡献 | 返回值旁同时提供 `training_label` |
| `d` / `improvement_value` | 实践任务对技术或工具的提升度 | 返回值旁同时提供 `improvement_label` |

`learning-path/query` 返回岗位标准路径，不包含学生个人掌握度 M、个人进度、测评结果和学校培养目标。

## 稳定连接键

招聘库当前分类结果中的 `taxonomy_code` 与教育库 `catalog.roles.role_code` 相等。前端只使用 `role_code`，不直接依赖数据库主键。
