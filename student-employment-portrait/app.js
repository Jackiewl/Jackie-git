(function () {
  const API_ROOT = "../前端接口交付包/mock_data";

  const fallback = {
    taxonomy: {
      families: [
        {
          family_code: "P1",
          family_name: "通信系统、设备与核心技术研发",
          directions: [
            {
              direction_code: "P1.1",
              direction_name: "无线通信算法与系统研发",
              roles: [
                {
                  role_code: "P1.1.1",
                  role_name: "无线通信算法工程师",
                  work_scope:
                    "负责无线通信核心算法设计，包括信道估计、信号处理、调制解调、链路自适应和 MIMO 算法。"
                },
                {
                  role_code: "P1.1.3",
                  role_name: "无线通信系统工程师",
                  work_scope:
                    "负责无线通信系统方案设计、链路预算、系统仿真、性能分析和系统架构验证。"
                }
              ]
            }
          ]
        },
        {
          family_code: "P4",
          family_name: "软件开发、数据智能与平台工程",
          directions: [
            {
              direction_code: "P4.2",
              direction_name: "数据分析与智能应用",
              roles: [
                {
                  role_code: "P4.2.1",
                  role_name: "数据分析工程师",
                  work_scope:
                    "负责业务数据建模、指标体系建设、数据看板、实验分析和分析结论落地。"
                }
              ]
            }
          ]
        }
      ]
    },
    overview: {
      communication_job_count: 11275,
      active_job_count: 8200,
      new_job_count_7d: 520,
      offline_job_count_7d: 130,
      net_change_7d: 390
    },
    trend: {
      series: [
        { period: "09-09", active_count: 7730, new_count: 88, offline_count: 22, net_change: 66 },
        { period: "09-10", active_count: 7820, new_count: 102, offline_count: 28, net_change: 74 },
        { period: "09-11", active_count: 7905, new_count: 96, offline_count: 34, net_change: 62 },
        { period: "09-12", active_count: 7980, new_count: 118, offline_count: 31, net_change: 87 },
        { period: "09-13", active_count: 8000, new_count: 100, offline_count: 30, net_change: 70 },
        { period: "09-14", active_count: 8075, new_count: 110, offline_count: 35, net_change: 75 },
        { period: "09-15", active_count: 8200, new_count: 160, offline_count: 35, net_change: 125 }
      ]
    },
    requirements: {
      salary: [{ label: "10K-15K", count: 1200, percentage: 0.24 }],
      education: [{ label: "本科", count: 2600, percentage: 0.52 }],
      experience: [{ label: "1-3年", count: 1700, percentage: 0.34 }],
      industry: [{ label: "通信/网络", count: 900, percentage: 0.18 }]
    },
    path: {
      coverage: {
        micro_ability_weighted_satisfaction: 0.86,
        core_micro_ability_pass_rate: 0.91,
        tool_weighted_satisfaction: 0.82,
        core_tool_pass_rate: 0.88,
        overall_satisfaction: 0.85
      }
    }
  };

  const state = {
    data: fallback,
    roles: [],
    selectedRole: null,
    selectedTask: "PB-01"
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function formatNumber(value) {
    return Number(value || 0).toLocaleString("zh-CN");
  }

  function percent(value) {
    return `${Math.round(Number(value || 0) * 100)}%`;
  }

  function looksBroken(value) {
    return typeof value === "string" && /�|ѧ|ʾ|����|ҵ/.test(value);
  }

  function clean(value, fallbackText) {
    if (!value || looksBroken(value)) return fallbackText;
    return value;
  }

  async function readJson(path, fallbackValue) {
    try {
      const response = await fetch(`${API_ROOT}/${path}`);
      if (!response.ok) throw new Error(response.statusText);
      return await response.json();
    } catch (error) {
      return fallbackValue;
    }
  }

  async function loadData() {
    const [taxonomy, overview, trend, requirements, path] = await Promise.all([
      readJson("taxonomy/tree/success.json", fallback.taxonomy),
      readJson("market/overview/success.json", fallback.overview),
      readJson("market/trend/success.json", fallback.trend),
      readJson("market/requirements/success.json", fallback.requirements),
      readJson("learning_path/query/success.json", fallback.path)
    ]);

    state.data = { taxonomy, overview, trend, requirements, path };
    state.roles = flattenRoles(taxonomy);
    state.selectedRole = state.roles[0] || fallback.taxonomy.families[0].directions[0].roles[0];
  }

  function flattenRoles(taxonomy) {
    return (taxonomy.families || []).flatMap((family) =>
      (family.directions || []).flatMap((direction) =>
        (direction.roles || []).map((role, index) => ({
          ...role,
          role_family_code: family.family_code,
          role_family_name: family.family_name,
          direction_code: direction.direction_code,
          direction_name: direction.direction_name,
          active_job_count: 420 + ((index + direction.direction_code.length) * 137) % 960,
          ability_count: 6 + (index % 5),
          tool_count: 4 + (index % 4)
        }))
      )
    );
  }

  function initNavigation() {
    $$(".nav-item").forEach((button) => {
      button.addEventListener("click", () => activateView(button.dataset.view));
    });

    $("#jumpLearning").addEventListener("click", () => activateView("learning"));
    $("#roleSearch").addEventListener("input", renderRoles);
    $("#familySelect").addEventListener("change", renderRoles);

    $$(".segmented button").forEach((button) => {
      button.addEventListener("click", () => {
        $$(".segmented button").forEach((item) => item.classList.remove("is-selected"));
        button.classList.add("is-selected");
      });
    });
  }

  function activateView(view) {
    $$(".nav-item").forEach((item) => item.classList.toggle("is-active", item.dataset.view === view));
    $$(".view").forEach((section) => section.classList.toggle("is-active", section.id === view));
  }

  function render() {
    renderFamilySelect();
    renderMarket();
    renderRoles();
    renderRoleDetail();
    renderLearning();
  }

  function renderFamilySelect() {
    const select = $("#familySelect");
    const options = [`<option value="">全部大类</option>`].concat(
      (state.data.taxonomy.families || []).map(
        (family) => `<option value="${family.family_code}">${family.family_name}</option>`
      )
    );
    select.innerHTML = options.join("");
  }

  function renderMarket() {
    const overview = state.data.overview || fallback.overview;
    const metrics = [
      ["通信相关岗位数", overview.communication_job_count, "当前有效分类结果"],
      ["当前在招岗位数", overview.active_job_count, "在架岗位去重统计"],
      ["近7天新增", overview.new_job_count_7d, "首次出现的岗位"],
      ["近7天下架", overview.offline_job_count_7d, "从在招转为下架"],
      ["近7天净变化", overview.net_change_7d, "新增数 - 下架数"]
    ];

    $("#metricGrid").innerHTML = metrics
      .map(
        ([label, value, hint]) => `
          <article class="metric">
            <span>${label}</span>
            <strong>${formatNumber(value)}</strong>
            <small>${hint}</small>
          </article>`
      )
      .join("");

    renderTrendChart();
    renderRanking();
    renderRequirements();
  }

  function renderTrendChart() {
    const series = normalizeTrend(state.data.trend && state.data.trend.series);
    const width = 760;
    const height = 300;
    const pad = 36;
    const maxActive = Math.max(...series.map((item) => item.active_count));
    const minActive = Math.min(...series.map((item) => item.active_count));
    const span = Math.max(maxActive - minActive, 1);
    const x = (index) => pad + (index * (width - pad * 2)) / Math.max(series.length - 1, 1);
    const y = (value) => height - pad - ((value - minActive) * (height - pad * 2)) / span;
    const path = series.map((item, index) => `${index ? "L" : "M"} ${x(index)} ${y(item.active_count)}`).join(" ");
    const bars = series
      .map((item, index) => {
        const barHeight = Math.max(12, item.new_count * 0.75);
        return `<rect x="${x(index) - 13}" y="${height - pad - barHeight}" width="26" height="${barHeight}" rx="4" fill="#bfe3d2"></rect>`;
      })
      .join("");

    $("#trendChart").innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-label="岗位数据变化趋势图">
        <rect x="0" y="0" width="${width}" height="${height}" fill="#fbfcfe"></rect>
        ${[0, 1, 2, 3].map((row) => {
          const yPos = pad + row * ((height - pad * 2) / 3);
          return `<line x1="${pad}" y1="${yPos}" x2="${width - pad}" y2="${yPos}" stroke="#e4e9f1"></line>`;
        }).join("")}
        ${bars}
        <path d="${path}" fill="none" stroke="#2662d9" stroke-width="4" stroke-linecap="round"></path>
        ${series.map((item, index) => `<circle cx="${x(index)}" cy="${y(item.active_count)}" r="5" fill="#2662d9"><title>${item.period} 在招 ${item.active_count}</title></circle>`).join("")}
        ${series.map((item, index) => `<text x="${x(index)}" y="${height - 10}" text-anchor="middle" font-size="12" fill="#667085">${item.period}</text>`).join("")}
      </svg>`;
  }

  function normalizeTrend(series) {
    const source = Array.isArray(series) && series.length ? series : fallback.trend.series;
    if (source.length >= 5) return source.map((item) => ({ ...item, period: item.period.slice(5) }));
    return fallback.trend.series;
  }

  function renderRanking() {
    const topRoles = state.roles.slice(0, 6);
    $("#rankingList").innerHTML = topRoles
      .map(
        (role, index) => `
          <button class="rank-row" type="button" data-role="${role.role_code}">
            <b>${index + 1}</b>
            <span>${role.role_name}</span>
            <strong>${formatNumber(role.active_job_count)}</strong>
          </button>`
      )
      .join("");

    $$(".rank-row").forEach((button) => {
      button.addEventListener("click", () => selectRole(button.dataset.role, "roles"));
    });
  }

  function renderRequirements() {
    const requirements = state.data.requirements || fallback.requirements;
    const rows = [
      ["薪资", requirements.salary && requirements.salary[0], "10K-15K"],
      ["学历", requirements.education && requirements.education[0], "本科"],
      ["经验", requirements.experience && requirements.experience[0], "1-3年"],
      ["行业", requirements.industry && requirements.industry[0], "通信/网络"]
    ];

    $("#requirementBars").innerHTML = rows
      .map(([name, item, text]) => {
        const label = clean(item && item.label, text);
        const percentage = Number((item && item.percentage) || 0.25);
        return `
          <div class="bar-row">
            <div class="bar-meta"><strong>${name}：${label}</strong><span>${percent(percentage)}</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${percentage * 100}%"></div></div>
          </div>`;
      })
      .join("");
  }

  function renderRoles() {
    const keyword = $("#roleSearch").value.trim().toLowerCase();
    const family = $("#familySelect").value;
    const filtered = state.roles
      .filter((role) => !family || role.role_family_code === family)
      .filter((role) => {
        const haystack = `${role.role_name} ${role.direction_name} ${role.work_scope}`.toLowerCase();
        return !keyword || haystack.includes(keyword);
      })
      .slice(0, 80);

    $("#roleCount").textContent = `${filtered.length} 个岗位`;
    $("#roleList").innerHTML = filtered
      .map(
        (role) => `
          <button class="role-card ${state.selectedRole && state.selectedRole.role_code === role.role_code ? "is-active" : ""}" type="button" data-role="${role.role_code}">
            <strong>${role.role_name}</strong>
            <span>${role.direction_name}</span>
            <p>${role.work_scope}</p>
          </button>`
      )
      .join("");

    $$(".role-card").forEach((button) => {
      button.addEventListener("click", () => selectRole(button.dataset.role, "roles"));
    });
  }

  function selectRole(roleCode, view) {
    const next = state.roles.find((role) => role.role_code === roleCode);
    if (!next) return;
    state.selectedRole = next;
    renderRoles();
    renderRoleDetail();
    renderLearning();
    if (view) activateView(view);
  }

  function renderRoleDetail() {
    const role = state.selectedRole;
    if (!role) return;

    $("#roleDirection").textContent = `${role.role_family_name} / ${role.direction_name}`;
    $("#roleName").textContent = role.role_name;
    $("#roleScope").textContent = role.work_scope;
    $("#roleDemand").textContent = formatNumber(role.active_job_count);

    $("#studentPortrait").innerHTML = buildStudentPortrait(role).map((item) => `<li>${item}</li>`).join("");
    $("#abilityList").innerHTML = buildAbilities(role).map(renderTag).join("");
    $("#toolList").innerHTML = buildTools(role).map(renderTag).join("");
    $("#similarRoles").innerHTML = buildSimilarRoles(role)
      .map(
        (item) => `
          <button class="compare-row" type="button" data-role="${item.role_code}">
            <strong>${item.role_name}</strong>
            <p>${item.summary}</p>
          </button>`
      )
      .join("");

    $$(".compare-row").forEach((button) => {
      button.addEventListener("click", () => selectRole(button.dataset.role, "roles"));
    });
  }

  function renderTag(item) {
    return `
      <div class="tag-row">
        <div>
          <strong>${item.name}</strong>
          <span>${item.desc}</span>
        </div>
        <span class="score-pill">${item.score}</span>
      </div>`;
  }

  function buildStudentPortrait(role) {
    const scope = role.work_scope.replace(/负责|包括|。/g, "");
    return [
      `能把“${scope.slice(0, 28)}”拆解成可验证的工程任务。`,
      "掌握岗位核心理论，能说明关键概念、指标口径和适用边界。",
      "具备工具链实践能力，能完成配置、调试、数据分析和结果复盘。",
      "能用项目作品证明能力，包括需求分析、实现过程、测试记录和改进结论。"
    ];
  }

  function buildAbilities(role) {
    const isAlgorithm = /算法|通信|系统/.test(role.role_name);
    return [
      {
        name: isAlgorithm ? "通信原理与系统建模" : "业务理解与指标建模",
        desc: "能从招聘要求抽取核心问题，并转化为可学习的能力单元。",
        score: "W 1.0"
      },
      {
        name: isAlgorithm ? "仿真验证与性能分析" : "数据处理与分析表达",
        desc: "能用实验、数据和图表证明方案有效性。",
        score: "W 0.8"
      },
      {
        name: "工程文档与协作交付",
        desc: "能沉淀方案说明、测试报告、项目复盘和作品集材料。",
        score: "W 0.6"
      }
    ];
  }

  function buildTools(role) {
    const algorithmTools = ["MATLAB / Python", "链路仿真平台", "Git 与测试脚本"];
    const softwareTools = ["SQL / Python", "BI 看板工具", "Git 与接口调试"];
    const tools = /算法|通信|系统/.test(role.role_name) ? algorithmTools : softwareTools;
    return tools.map((name, index) => ({
      name,
      desc: index === 0 ? "核心工具，需能独立完成任务。" : "主要应用工具，需能在项目中熟练使用。",
      score: index === 0 ? "R 0.8" : "R 0.6"
    }));
  }

  function buildSimilarRoles(role) {
    const sameDirection = state.roles
      .filter((item) => item.direction_code === role.direction_code && item.role_code !== role.role_code)
      .slice(0, 3);
    return sameDirection.map((item) => ({
      ...item,
      summary: "工作边界接近，需重点比较职责范围、核心能力和工具要求。"
    }));
  }

  function renderLearning() {
    const coverage = (state.data.path && state.data.path.coverage) || fallback.path.coverage;
    const pills = [
      ["微能力满足度", coverage.micro_ability_weighted_satisfaction],
      ["核心能力通过率", coverage.core_micro_ability_pass_rate],
      ["工具满足度", coverage.tool_weighted_satisfaction],
      ["综合满足度", coverage.overall_satisfaction]
    ];
    $("#coverageSummary").innerHTML = pills
      .map(([name, value]) => `<span class="coverage-pill">${name} ${percent(value)}</span>`)
      .join("");

    renderTimeline();
    renderChannels();
    renderTaskDetail();
  }

  function currentTasks() {
    const role = state.selectedRole || {};
    return [
      {
        code: "PB-01",
        stage: "PB",
        name: "岗位基础知识地图",
        reason: `梳理 ${role.role_name || "目标岗位"} 的核心概念、岗位术语和评价指标。`
      },
      {
        code: "PF-01",
        stage: "PF",
        name: "关键工具上手实验",
        reason: "完成环境搭建、基础案例复现和结果记录，形成可展示的实验日志。"
      },
      {
        code: "JP-01",
        stage: "JP",
        name: "岗位场景项目实践",
        reason: "围绕真实招聘要求完成一个端到端小项目，覆盖能力 W 与工具 R。"
      },
      {
        code: "CP-01",
        stage: "CP",
        name: "作品集与面试复盘",
        reason: "把项目整理为作品集、简历表达、面试讲解稿和改进计划。"
      }
    ];
  }

  function renderTimeline() {
    const stages = [
      ["PB", "公共基础", "理解岗位、术语和基础原理"],
      ["PF", "专业基础", "掌握核心理论与工具链"],
      ["JP", "岗位实践", "完成岗位场景项目"],
      ["CP", "综合实践", "形成作品集和就业表达"]
    ];
    const tasks = currentTasks();
    $("#stageTimeline").innerHTML = stages
      .map(([code, name, desc]) => {
        const stageTasks = tasks.filter((task) => task.stage === code);
        return `
          <section class="stage">
            <small>${code}</small>
            <h3>${name}</h3>
            <p>${desc}</p>
            ${stageTasks
              .map(
                (task) => `
                  <button class="task-chip ${state.selectedTask === task.code ? "is-selected" : ""}" type="button" data-task="${task.code}">
                    <strong>${task.name}</strong>
                    <span>${task.reason}</span>
                  </button>`
              )
              .join("")}
          </section>`;
      })
      .join("");

    $$(".task-chip").forEach((button) => {
      button.addEventListener("click", () => {
        state.selectedTask = button.dataset.task;
        renderTimeline();
        renderTaskDetail();
      });
    });
  }

  function renderChannels() {
    const role = state.selectedRole || {};
    const channels = [
      ["课程学习", "优先补齐岗位核心理论，按 W=1.0 与 W=0.8 的能力排序学习。"],
      ["项目实践", `围绕“${role.role_name || "目标岗位"}”设计可演示项目，保留过程记录和验收指标。`],
      ["岗位研究", "持续观察招聘要求变化，记录技能关键词、工具频次和城市需求。"],
      ["作品表达", "把任务输出整理为简历项目、作品集页面和面试讲解结构。"]
    ];

    $("#learningChannels").innerHTML = channels
      .map(
        ([title, body]) => `
          <div class="channel-row">
            <strong>${title}</strong>
            <p>${body}</p>
          </div>`
      )
      .join("");
  }

  function renderTaskDetail() {
    const task = currentTasks().find((item) => item.code === state.selectedTask) || currentTasks()[0];
    const abilities = buildAbilities(state.selectedRole || {}).slice(0, 2);
    const tools = buildTools(state.selectedRole || {}).slice(0, 2);

    $("#taskDetail").innerHTML = `
      <section class="detail-block">
        <h4>${task.code} ${task.name}</h4>
        <p>${task.reason}</p>
        <ul>
          <li>输出：学习笔记、实验记录、项目说明或作品集材料。</li>
          <li>验收：能说明目标、步骤、结果、问题和下一步改进。</li>
          <li>学习节奏：建议 1-2 周形成最小可展示成果。</li>
        </ul>
      </section>
      <section class="detail-block">
        <h4>训练与提升</h4>
        <ul>
          ${abilities.map((item) => `<li>${item.name}：T 0.8</li>`).join("")}
          ${tools.map((item) => `<li>${item.name}：d 0.6</li>`).join("")}
        </ul>
      </section>`;
  }

  loadData().then(() => {
    initNavigation();
    render();
  });
})();
