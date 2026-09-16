# 大学生高质量就业画像平台

平台依据招聘市场数据，呈现岗位热度、技能与工具需求、标准岗位画像，以及 PB/PF/JP/CP 学习路径。

## 前端工程

正式前端位于 `frontend/`，采用 Vue 3、TypeScript、Vite、Pinia、Axios、Element Plus、ECharts、Day.js 与 SheetJS。

```bash
cd frontend
pnpm install
pnpm dev
```

默认启用接口交付包提供的 Mock 数据。复制 `.env.example` 为 `.env.local` 后，可通过以下变量切换真实后端：

```text
VITE_API_BASE_URL=http://127.0.0.1:18100
VITE_USE_MOCK=false
```

`career-plan-agent/` 是经作者许可使用的上游参考仓库，不纳入本仓库版本控制。`student-employment-portrait/` 是保留的早期静态原型，不作为正式工程。
