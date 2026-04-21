# 线索管理系统（React + TypeScript）

基于 **Vite 7** 与 **React 19** 的前端演示项目：Mock 登录、线索列表（筛选 / 搜索 / 分页 / 编辑 / 删除）、ECharts 看板，以及用户与企业详情页。业务数据在内存中模拟持久化，刷新页面会重置。

适合作为 **React 基础教学** 参考：以 `useState`、`useEffect`、Context 与独立 `api` 模块组织代码，避免过度抽象。

---

## 功能一览

| 能力 | 说明 |
|------|------|
| 登录 | Mock Token（access / refresh），启动时尝试恢复会话 |
| 路由守卫 | 未登录跳转 `/login`，已登录访问登录页则回首页 |
| 线索列表 | 多条件筛选、关键字防抖、分页、表格内编辑备注与删除 |
| 图表看板 | 与列表共用同一份内存数据；列表变更后通过事件刷新图表 |
| 详情页 | 用户 / 企业详情由 `src/mock` 下 JSON 字典驱动 |

**演示账号**：`admin` / `123456`（见登录页与 `authApi` 中的 Mock 逻辑）。

---

## 技术栈

| 类别 | 依赖 |
|------|------|
| 运行时 | React 19、React DOM 19 |
| 构建 | Vite 7、`@vitejs/plugin-react` |
| 语言 | TypeScript 5.9 |
| UI | Ant Design 6、`@ant-design/icons` |
| 路由 | React Router 7 |
| 图表 | ECharts 6（图表页 `lazy` 懒加载） |
| 样式 | 根目录 `index.css` + Tailwind CSS 4（`@tailwindcss/vite`） |

---

## 环境要求

- **Node.js**：建议 20 LTS 及以上  
- **包管理**：`pnpm`、`npm` 或 `yarn` 均可（下文以 `pnpm` 为例）

---

## 快速开始

```bash
pnpm install
pnpm run dev
```

浏览器访问终端输出的本地地址（一般为 `http://localhost:5173`）。

生产构建与预览：

```bash
pnpm run build    # tsc 类型检查 + vite build
pnpm run preview  # 本地预览 dist
pnpm run lint     # ESLint
```

---

## 路径别名

| 别名 | 指向 |
|------|------|
| `@/*` | `src/*` |

示例：`import { fetchLeads } from '@/api/leadsApi'` 对应 `src/api/leadsApi.ts`。

配置位置：`tsconfig.json` 的 `paths` 与 `vite.config.ts` 的 `resolve.alias`。

---

## 目录结构

```text
.
├── index.html              # HTML 入口
├── index.css               # 全局样式（含 Tailwind）
├── public/                 # 静态资源
├── vite.config.ts
├── tsconfig.json
└── src/
    ├── main.tsx            # React 挂载根
    ├── App.tsx             # 路由表、懒加载、Provider 包裹
    ├── providers.tsx       # 全局 Provider（如 AuthProvider）
    ├── types.ts            # 共享类型（如线索行 DataItem）
    ├── api/
    │   ├── authApi.ts      # Mock 认证接口
    │   └── leadsApi.ts     # Mock 线索 CRUD + 内存 store
    ├── context/
    │   ├── auth-context.tsx
    │   └── home-context.tsx
    ├── hooks/
    │   └── useDebouncedValue.ts
    ├── routes/
    │   └── guards.tsx      # RequireAuth、LoginRouteGuard
    ├── components/         # UI 组件（Header、布局、列表、表格等）
    │   ├── PageLoading.tsx
    │   ├── layout/
    │   ├── Header/
    │   ├── Search/
    │   ├── TableShow/
    │   └── ShowMenu/
    ├── pages/              # 路由页面
    └── mock/               # Mock JSON（种子数据与详情字典）
        ├── data.json
        ├── options.json
        ├── userDetails.json
        └── companyDetails.json
```

---

## 路由说明

| 路径 | 组件 | 是否需要登录 |
|------|------|----------------|
| `/login` | `LoginPage` | 否（已登录会重定向到 `/`） |
| `/` | `HomePage` | 是 |
| `/echarts` | `EchartsDashboardPage`（懒加载） | 是 |
| `/users/:userId` | `UserDetailPage` | 是 |
| `/companies/:companyName` | `CompanyPage` | 是 |
| `*` | 重定向到 `/` | 视目标页而定 |

受保护路由在 `src/routes/guards.tsx` 中通过 `RequireAuth` 实现；外壳布局为 `src/components/layout`（侧栏 + 顶栏 + `<Outlet />`）。

---

## 认证（Mock）

| 文件 | 职责 |
|------|------|
| `src/api/authApi.ts` | `loginApi`、`meApi`、`refreshApi`、`logoutApi` 及本地 Token 读写 |
| `src/context/auth-context.tsx` | `AuthProvider`、`useAuth`，启动时 bootstrap 会话 |
| `src/providers.tsx` | 在应用根部挂载 `AuthProvider` |

启动流程简述：若有 access token 则调 `meApi`；失败且存在 refresh token 则尝试 `refreshApi` 后再拉用户信息；均失败则视为未登录。`isAuthReady` 用于避免恢复会话前误判跳转。

---

## 线索数据与列表 / 图表联动

1. **数据源**：`src/api/leadsApi.ts` 内模块级 `store`，由 `src/mock/data.json` 经 `buildInitialStore()` 扩充生成，并附带随机头像。
2. **列表**：`src/components/Search/index.tsx` 调用 `fetchLeads`（模拟延迟 + `handleData` 筛选 + 分页）。
3. **筛选**：`src/components/Search/handleData.ts`，维度含 `status`、`channel`、`owner`、`keyword`；值为「全部」时该维度不参与过滤。
4. **写操作**：编辑备注、删除后重拉列表，并 `dispatchEvent('leads-changed')`。
5. **图表**：`src/pages/EchartsDashboardPage.tsx` 监听 `leads-changed`，通过 `getLeadsSnapshot()` 取最新数据。

首页筛选状态由 `src/context/home-context.tsx` 提供；关键字使用 `useDebouncedValue`（约 350ms）降低请求频率；列表分页大小见 `Search` 内常量。

---

## 模块速查

| 关注点 | 入口文件 |
|--------|----------|
| 路由与懒加载 | `src/App.tsx` |
| 鉴权守卫 | `src/routes/guards.tsx` |
| 全局加载占位 | `src/components/PageLoading.tsx` |
| 首页拼装 | `src/pages/HomePage.tsx` |
| 表格与弹窗 | `src/components/TableShow/` |

---

## Mock 数据文件

| 文件 | 用途 |
|------|------|
| `src/mock/data.json` | 线索种子，初始化内存 `store` |
| `src/mock/options.json` | 筛选项配置 |
| `src/mock/userDetails.json` | 用户详情页数据字典 |
| `src/mock/companyDetails.json` | 企业详情页数据字典 |

---

## 对接真实后端时的方向

1. 将 `leadsApi` 中内存实现替换为 HTTP，分页与筛选参数与后端约定一致。
2. 将 `authApi` 与 `auth-context` 中的存储字段、刷新策略与真实 Cookie / Header 方案对齐。
3. 图表页若无法拉全量快照，可改为独立统计接口，并去掉对 `leads-changed` 的依赖或改为全局状态 / 查询缓存。

---

## 推荐阅读顺序（读代码）

1. `src/main.tsx` → `src/App.tsx` → `src/providers.tsx`  
2. `src/routes/guards.tsx` → `src/context/auth-context.tsx` → `src/api/authApi.ts`  
3. `src/pages/LoginPage.tsx`  
4. `src/pages/HomePage.tsx` → `src/context/home-context.tsx`  
5. `src/components/Search/index.tsx` → `src/api/leadsApi.ts`  
6. `src/components/TableShow/index.tsx`  
7. `src/pages/EchartsDashboardPage.tsx`  

---

## 许可证

本项目在 `package.json` 中标记为 `"private": true`。若需开源，请自行补充 License 文件并调整声明。
