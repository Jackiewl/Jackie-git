export interface PracticeGuidance {
  scenario: string;
  actions: string[];
  evidence: string;
  criteria: string[];
  tools: string[];
}

export interface AbilityPracticeTask {
  task_code: string;
  task_name: string;
  stage_code: "PB" | "PF" | "JP" | "CP";
  training_value: number;
}

// Practice examples for P1.1.1, not learner assessments or official pass thresholds.
export const wirelessPracticeGuidance: Record<string, PracticeGuidance> = {
  "A1-02-M01": {
    scenario: "为 OFDM 收发链路建立可计算模型，明确哪些真实因素被保留、简化或忽略。",
    actions: ["分解比特源、调制、信道、噪声和接收机，定义每一模块的输入输出。", "列出采样率、子载波数、信噪比等参数，写清单位、取值范围与建模假设。"],
    evidence: "系统框图、参数表与一份可运行的基线模型。",
    criteria: ["模块接口的维度、单位和采样时钟一致。", "能够解释模型适用的场景，以及未覆盖的物理因素。"], tools: ["MATLAB", "Python", "OFDM"],
  },
  "A1-02-M02": {
    scenario: "分析 5G NR 物理层处理链，定位模块依赖和性能瓶颈。",
    actions: ["绘制编码、调制、资源映射、IFFT、信道估计与均衡的依赖关系。", "标出数据缓冲、接口形状和模块边界，识别可并行与必须串行的部分。"],
    evidence: "模块依赖图、接口说明和瓶颈分析记录。",
    criteria: ["处理顺序与收发方向对应，输入输出可追踪。", "拆分后的模块可以独立测试并重新集成。"], tools: ["MATLAB 5G Toolbox", "OFDM"],
  },
  "A1-02-M03": {
    scenario: "描述接收机从同步到解调的状态变化，分析异常条件下的行为。",
    actions: ["构造同步、信道估计、均衡与解调的状态和转移条件。", "用时序记录描述丢帧、同步失败和重试，检查循环边界与复位逻辑。"],
    evidence: "状态图、信号时序图与异常场景记录。",
    criteria: ["每次状态切换都有明确触发条件。", "异常后能够回到可恢复状态，不产生无终止循环。"], tools: ["Python", "MATLAB"],
  },
  "A1-02-M04": {
    scenario: "建立信噪比与误码率、吞吐量之间的关系，比较不同调制编码配置。",
    actions: ["选择 BER、BLER 或吞吐量指标，明确分母、统计窗口与统计条件。", "扫描 SNR 和 MCS 参数，输出性能曲线并注明仿真次数与随机种子。"],
    evidence: "性能模型、参数扫描脚本与带坐标单位的曲线图。",
    criteria: ["所有对比使用相同信道和样本统计口径。", "能解释低样本量或边界条件对结论的影响。"], tools: ["MATLAB", "NumPy", "5G NR"],
  },
  "A1-02-M05": {
    scenario: "验证仿真模型是否与理论基线一致，定位结果偏差。",
    actions: ["以无噪声链路和 AWGN 理论曲线作为基线，逐步加入复杂因素。", "比较模型输出与基线，检查归一化、噪声功率和信号维度。"],
    evidence: "基线对照图、误差定位过程与修正前后记录。",
    criteria: ["基线可以独立复现。", "对显著偏差给出可验证的原因，而非仅展示结果。"], tools: ["MATLAB", "Python", "OFDM"],
  },
  "A2-01-M01": {
    scenario: "开发通信实验的数据读取与处理脚本。",
    actions: ["读取 CSV / JSON 实验数据，处理缺失值和非法输入。", "将计算逻辑拆为函数，固定输入输出格式并记录依赖版本。"],
    evidence: "处理脚本、样例数据与运行说明。",
    criteria: ["正常与非法输入都有可解释的处理结果。", "在新环境下按说明可复现输出。"], tools: ["Python", "NumPy", "Git"],
  },
  "A2-01-M02": {
    scenario: "为通信网络拓扑和接收缓冲区选择合适的数据结构。",
    actions: ["使用图表示网络连接，使用队列或环形缓冲管理数据流。", "比较候选结构的查询、更新、存储和边界处理成本。"],
    evidence: "数据结构实现、边界测试和时间 / 内存比较。",
    criteria: ["结构选择能够对应实际访问模式。", "空输入、满缓冲和断连情况均有测试。"], tools: ["Python", "Git"],
  },
  "A2-01-M03": {
    scenario: "实现通信网络路径搜索或信号处理中的基础算法。",
    actions: ["定义问题约束，写出伪代码与复杂度分析。", "实现算法，以基准输入核对结果，并与参考实现比较。"],
    evidence: "算法说明、实现代码和基准测试。",
    criteria: ["结果正确且边界输入不会破坏算法不变量。", "复杂度分析与测量趋势一致。"], tools: ["Python", "NumPy"],
  },
  "A2-01-M04": {
    scenario: "定位接收数据异常、数组维度错误或程序性能退化。",
    actions: ["构造最小复现样例，记录输入、异常栈与关键中间量。", "使用断点、日志和性能剖析定位根因，再加入回归测试。"],
    evidence: "问题复现包、根因分析与修复测试记录。",
    criteria: ["相同输入可稳定复现并验证修复。", "修复未破坏正常链路与其他边界场景。"], tools: ["Python", "Linux", "Git"],
  },
  "A2-01-M05": {
    scenario: "将通信算法脚本整理为可维护、可协作的工程模块。",
    actions: ["分离配置、算法、数据与测试，定义稳定接口。", "增加自动化测试、日志和版本记录，提交代码审查材料。"],
    evidence: "版本化代码仓库、接口文档与测试报告。",
    criteria: ["新成员可以按说明运行测试并复现实验。", "变更有清晰记录，模块接口不存在隐式依赖。"], tools: ["Git", "Python", "Linux"],
  },
  "A5-04-M01": {
    scenario: "将通信系统的吞吐量、可靠性和时延目标转化为验证需求。",
    actions: ["把需求逐条映射到可观测指标与测试用例。", "明确测试环境、基线和通过条件，并标记无法直接测量的要求。"],
    evidence: "需求到测试用例的追踪矩阵。",
    criteria: ["每个关键需求都有对应证据来源。", "评价口径、约束和测试环境事先明确。"], tools: ["Python", "5G NR"],
  },
  "A5-04-M02": {
    scenario: "设计不同信道、SNR 和负载下的对比实验。",
    actions: ["定义自变量、控制变量和重复实验策略。", "设置基线、正常场景与压力场景，避免同时改变多个未控制因素。"],
    evidence: "实验计划、配置文件与运行记录。",
    criteria: ["对比实验仅改变预定因素。", "配置和随机种子完整记录，可重复运行。"], tools: ["MATLAB", "Sionna", "Python"],
  },
  "A5-04-M03": {
    scenario: "从通信实验日志中提取稳定性和性能特征。",
    actions: ["清洗日志并检查异常样本，统一统计窗口和指标单位。", "统计均值、分位数或置信区间，将数据与实验条件关联。"],
    evidence: "可追溯数据表、统计脚本与性能图表。",
    criteria: ["图表可以追溯到原始数据。", "解释波动和异常，不仅报告平均值。"], tools: ["Python", "NumPy"],
  },
  "A5-04-M04": {
    scenario: "从异常误码率、时延尖峰或吞吐量下降中定位系统问题。",
    actions: ["将异常时间段与配置、日志和信号处理阶段对齐。", "提出可验证假设，用对照实验区分模型、实现和环境原因。"],
    evidence: "问题清单、定位实验和修复验证报告。",
    criteria: ["问题原因由证据支持。", "修正后复测相同场景，记录剩余风险。"], tools: ["Python", "MATLAB", "Linux"],
  },
  "A5-04-M05": {
    scenario: "评价通信系统原型在性能、成本和部署条件上的可行性。",
    actions: ["建立性能、资源占用、稳定性和维护成本的评价维度。", "对比候选方案，说明适用边界和权衡，不用单一指标替代整体评价。"],
    evidence: "方案对照表与工程评审结论。",
    criteria: ["评价结论与实验数据一致。", "明确部署约束、局限和后续改进项。"], tools: ["Python", "5G NR", "Linux"],
  },
  "A8-04-M01": {
    scenario: "分析 DSP 算法在实时处理平台上的资源需求。",
    actions: ["估算采样率、计算量、内存和最大允许处理时延。", "拆分算法处理链，识别精度、存储与执行时间约束。"],
    evidence: "实现预算表与算法到平台的映射方案。",
    criteria: ["计算预算与采样周期使用一致的时间单位。", "瓶颈和关键约束有量化依据。"], tools: ["MATLAB", "OFDM"],
  },
  "A8-04-M02": {
    scenario: "实现 FFT、滤波或 OFDM 基带处理模块。",
    actions: ["根据参考模型完成算法实现，明确数据格式和缓冲边界。", "使用测试向量对比各处理阶段的输出。"],
    evidence: "算法模块、测试向量和逐级对照记录。",
    criteria: ["输出维度、幅值和时序与参考模型一致。", "连续帧处理无缓冲越界或历史状态污染。"], tools: ["MATLAB", "OFDM", "Python"],
  },
  "A8-04-M03": {
    scenario: "将浮点算法转为满足平台约束的定点实现。",
    actions: ["选择字长和小数位，定义舍入、饱和和溢出处理方式。", "统计量化误差并比较定点与浮点结果。"],
    evidence: "定点格式说明、误差曲线与极值测试。",
    criteria: ["字长与缩放因子在整个处理链上保持一致。", "极值输入与溢出行为有明确测试。"], tools: ["MATLAB", "NumPy"],
  },
  "A8-04-M04": {
    scenario: "降低 DSP 程序的执行时间与资源占用。",
    actions: ["剖析热点，评估向量化、缓存复用和循环优化。", "固定输入与硬件环境，比较优化前后的耗时和精度。"],
    evidence: "性能剖析、优化代码与基线对照。",
    criteria: ["性能收益在相同环境和统计口径下测量。", "优化未改变算法结果与边界处理。"], tools: ["MATLAB", "Python", "Linux"],
  },
  "A8-04-M05": {
    scenario: "验证 DSP 实现的数值正确性和实时运行能力。",
    actions: ["进行离线参考对照与连续数据流测试。", "记录精度损失、处理时延和资源占用，检查最差情况。"],
    evidence: "数值对照报告、运行日志与实时性测试。",
    criteria: ["正确性和实时性分别提供验证证据。", "测试覆盖连续帧、边界输入和最差负载。"], tools: ["MATLAB", "Python", "Linux"],
  },
  "B1-06-M01": {
    scenario: "把无线链路的接收性能目标转化为信号处理算法需求。",
    actions: ["明确信道、带宽、天线配置与 SNR 范围。", "确定误码率、吞吐量、复杂度和时延的评价目标与优先级。"],
    evidence: "算法需求规格与场景参数表。",
    criteria: ["目标有一致的单位和统计条件。", "指标之间的冲突及场景边界被明确记录。"], tools: ["5G NR", "MIMO", "MATLAB"],
  },
  "B1-06-M02": {
    scenario: "设计信道估计、均衡或 MIMO 检测算法。",
    actions: ["从信号模型推导算法步骤，明确输入信息和假设。", "与 LS / MMSE 等参考方法比较适用条件与复杂度。"],
    evidence: "算法推导、流程图与参考实现。",
    criteria: ["推导与代码实现可以逐步对应。", "说明算法依赖条件，不把单一场景结论推广到全部场景。"], tools: ["MATLAB", "MIMO", "OFDM"],
  },
  "B1-06-M03": {
    scenario: "通过多信道、多 SNR 仿真检验无线算法的有效性。",
    actions: ["配置链路、随机种子与基线算法，开展参数扫描。", "采集 BER、BLER 或吞吐量，记录异常和性能波动。"],
    evidence: "仿真配置、原始数据与性能对照图。",
    criteria: ["对比方法使用相同信道和统计预算。", "结果可复现，说明样本数量与不确定性。"], tools: ["Sionna", "MATLAB 5G Toolbox", "5G NR"],
  },
  "B1-06-M04": {
    scenario: "在保持链路性能的同时降低算法计算成本。",
    actions: ["分析热点，评估矩阵分解、缓存和近似计算的成本。", "同时记录性能、运算量和执行时间，形成优化权衡。"],
    evidence: "优化实现、复杂度分析与性能 / 成本对照图。",
    criteria: ["优化收益包含性能代价，不只给出加速倍数。", "不同天线规模和边界场景都经过对照。"], tools: ["NumPy", "Python", "MIMO"],
  },
  "B1-06-M05": {
    scenario: "评价信号处理算法对整个无线链路的贡献。",
    actions: ["从误码、吞吐、鲁棒性、时延和资源占用进行综合比较。", "结合不同信道和负载给出推荐使用条件与限制。"],
    evidence: "多场景性能报告与算法选型建议。",
    criteria: ["结论可以回溯到对应实验和基线。", "清楚区分已验证场景与尚未验证场景。"], tools: ["MATLAB", "Python", "5G NR"],
  },
};

export const wirelessAbilityTasks: Record<string, AbilityPracticeTask[]> = {
  "A1-02": [{ task_code: "JP-P1-04", task_name: "5G NR链路级仿真实践", stage_code: "JP", training_value: 0.8 }, { task_code: "JP-P1-10", task_name: "通信系统原型验证实践", stage_code: "JP", training_value: 0.6 }],
  "A2-01": [{ task_code: "PB-02", task_name: "Python程序设计与工程数据处理实践", stage_code: "PB", training_value: 0.8 }, { task_code: "PB-04", task_name: "数据结构与算法工程实践", stage_code: "PB", training_value: 0.8 }, { task_code: "PB-07", task_name: "网络程序设计实践", stage_code: "PB", training_value: 0.6 }],
  "A5-04": [{ task_code: "JP-P1-10", task_name: "通信系统原型验证实践", stage_code: "JP", training_value: 0.8 }, { task_code: "CP-06", task_name: "虚拟5G专网规划、部署与优化综合实践", stage_code: "CP", training_value: 0.6 }],
  "A8-04": [{ task_code: "PF1-13", task_name: "DSP通信算法工程实现实践", stage_code: "PF", training_value: 0.8 }, { task_code: "JP-P1-02", task_name: "OFDM系统设计实践", stage_code: "JP", training_value: 0.6 }],
  "B1-06": [{ task_code: "JP-P1-03", task_name: "MIMO通信算法实践", stage_code: "JP", training_value: 0.8 }, { task_code: "JP-P1-09", task_name: "通感一体化系统实践", stage_code: "JP", training_value: 0.8 }, { task_code: "CP-10", task_name: "通信网络创新挑战项目实践", stage_code: "CP", training_value: 0.6 }],
};
