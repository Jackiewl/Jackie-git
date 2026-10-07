import type { TaskDetailData } from "@/types/api";

const taskCatalog: Record<string, { name: string; level: "PB" | "PF" | "JP" | "CP"; objective: string; content: string }> = {
  "PB-07": { name: "网络程序设计实践", level: "PB", objective: "使用 Socket API 完成可观测的通信程序，并提交工程化代码与测试证据。", content: "设计客户端/服务端通信协议，完成并发连接、异常处理、日志记录和自动化测试。" },
  "PF3-07": { name: "微服务通信系统开发实践", level: "PF", objective: "将通信能力拆分为可部署、可验证的微服务模块。", content: "完成服务注册、接口契约、消息传递、容器化部署和端到端联调。" },
  "JP-P1-07": { name: "5G核心网功能模块开发实践", level: "JP", objective: "围绕 5G 核心网流程实现一个可运行的功能模块。", content: "完成模块接口设计、信令流程实现、状态机处理、日志观测和功能验证。" },
  "CP-06": { name: "虚拟5G专网规划、部署与优化综合实践", level: "CP", objective: "完成从虚拟专网规划、部署到性能优化的端到端交付。", content: "规划网络拓扑，部署核心网与接入仿真环境，采集指标并完成参数优化报告。" },
  "JP-P1-03": { name: "MIMO通信算法实践", level: "JP", objective: "设计并验证 MIMO 检测或预编码算法，比较不同场景下的性能。", content: "建立信道模型，实现算法仿真，分析误码率、吞吐量和复杂度并提交实验报告。" },
  "JP-P1-09": { name: "通感一体化系统实践", level: "JP", objective: "在统一波形下完成通信与感知指标的建模、仿真和权衡。", content: "完成场景建模、信号处理链路、指标采集、异常分析和系统方案评审。" },
  "PB-02": { name: "Python程序设计与工程数据处理实践", level: "PB", objective: "使用 Python 完成通信工程数据清洗、分析和可复现脚本开发。", content: "读取 CSV/JSON 数据，完成清洗、统计、可视化和 REST API 调用，形成可复现实验。" },
  "PB-04": { name: "数据结构与算法工程实践", level: "PB", objective: "针对通信网络案例选择数据结构并完成算法实现与性能比较。", content: "实现图、树、哈希和路径搜索算法，使用基准数据比较复杂度、时间和内存开销。" },
  "JP-P1-04": { name: "5G NR链路级仿真实践", level: "JP", objective: "完成 5G NR 链路级仿真并解释关键参数对链路性能的影响。", content: "构造 OFDM 链路，配置 MCS、信道和噪声参数，使用 MATLAB 5G Toolbox 或 Sionna 采集 BER/吞吐量。" },
  "PF1-13": { name: "DSP通信算法工程实现实践", level: "PF", objective: "把通信 DSP 算法实现为满足资源约束的工程程序。", content: "完成定点化、循环优化、误差分析和性能剖析，提交算法实现与验证记录。" },
  "CP-10": { name: "通信网络创新挑战项目实践", level: "CP", objective: "以开放问题为牵引完成通信网络创新方案和可验证原型。", content: "完成需求分析、方案设计、原型开发、指标评测和项目答辩材料。" },
  "JP-P1-02": { name: "OFDM系统设计实践", level: "JP", objective: "完成 OFDM 收发链路设计、仿真与抗噪性能评价。", content: "实现调制、IFFT/FFT、循环前缀、信道估计和均衡，比较不同参数组合的误码率。" },
  "JP-P1-10": { name: "通信系统原型验证实践", level: "JP", objective: "把算法模块集成为可演示的通信系统原型并完成验收。", content: "定义接口，集成收发链路，设计验证用例，记录异常和性能结果，形成原型交付包。" }
};

export function getFormalTaskDetail(taskCode: string): TaskDetailData | null {
  const item = taskCatalog[taskCode];
  if (!item) return null;
  return {
    task: { task_code: taskCode, task_name: item.name, task_level: item.level, engineering_background: "通信工程项目要求模型、代码、实验记录和交付证据能够被复现与评审。", task_objective: item.objective, task_content: item.content },
    courses: [{ course_code: `COURSE-${item.level}`, course_name: `${item.level}阶段工程实践`, relation_type: "支撑" }],
    steps: [
      { step_no: 1, subitem_code: `${taskCode}-1`, original_text: "拆解工程目标并完成方案设计", detail_text: "明确输入、输出、关键指标和验证数据，绘制模块边界与接口。", acceptance_criteria: "方案文档包含指标、接口、风险和验收条件。" },
      { step_no: 2, subitem_code: `${taskCode}-2`, original_text: "完成实现、仿真或部署", detail_text: item.content, acceptance_criteria: "核心流程可运行，关键日志、参数和版本信息完整。" },
      { step_no: 3, subitem_code: `${taskCode}-3`, original_text: "采集指标并完成问题闭环", detail_text: "对比基线和目标，定位异常，记录调整前后数据并说明结论。", acceptance_criteria: "至少提供一组正常数据和一组异常/边界数据及分析。" }
    ],
    outputs: [{ output_text: `${item.name} 方案与实现代码` }, { output_text: "实验数据、指标图表与验收报告" }],
    micro_abilities: [
      { micro_ability_code: "A1-02-M05", micro_ability_name: "模型分析与验证能力", training_value: 0.6, training_label: "主要训练" },
      { micro_ability_code: "A2-01-M05", micro_ability_name: "工程代码实现能力", training_value: 0.8, training_label: "强训练" },
      { micro_ability_code: "A5-04-M03", micro_ability_name: "实验数据分析能力", training_value: 0.6, training_label: "主要训练" },
      { micro_ability_code: "B1-06-M03", micro_ability_name: "算法仿真验证能力", training_value: 0.8, training_label: "强训练" }
    ],
    tools: [
      { tool_code: "TT-PYTHON", tool_name: "Python", improvement_value: 0.6, improvement_label: "主要提升" },
      { tool_code: "TT-MATLAB", tool_name: "MATLAB", improvement_value: 0.6, improvement_label: "主要提升" },
      { tool_code: "TT-GIT", tool_name: "Git", improvement_value: 0.4, improvement_label: "辅助提升" }
    ],
    prerequisite_tasks: []
  };
}
