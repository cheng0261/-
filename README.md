# 线索管理系统（react-ts-project）

基于 **Vite + React 19 + TypeScript** 的单页应用：侧栏导航、线索列表（筛选/分页/编辑/删除）、ECharts 看板、用户与企业详情页。数据为**前端内存模拟**（刷新页面会恢复），用于演示 UI 与数据流。

---

## 技术栈

| 用途 | 依赖 |
|------|------|
| 构建 / 开发服务器 | Vite 7、`@vitejs/plugin-react` |
| UI | Ant Design 6、`@ant-design/icons` |
| 路由 | `react-router-dom` 7 |
| 服务端状态 / 缓存 | `@tanstack/react-query` 5 |
| 图表 | ECharts 6（路由级懒加载） |
| 样式 | 全局 `index.css` + Tailwind 4（`@tailwindcss/vite`） |
| 类型 | TypeScript 5.9 |

---

## 常用命令

```bash
npm install    # 安装依赖
npm run dev    # 开发：http://localhost:5173（端口以终端为准）
npm run build  # 类型检查 + 生产构建，输出 dist/
npm run preview # 本地预览构建结果
npm run lint   # ESLint
```

---

## 路径别名

`vite.config.ts` 与 `tsconfig.json` 中配置了：

- `@` → 项目根下的 `src/`

例如：`import { … } from '@/api/leadsApi'` 对应 `src/api/leadsApi.ts`。

---

## 目录结构（要点）

```
├── index.html              # Vite HTML 入口
├── index.css               # 全局样式 + @import "tailwindcss"
├── vite.config.ts
├── tsconfig.json
├── types.ts                # 全局类型 DataItem
├── public/                 # 静态资源（如 icons.svg）
├── mock/                   # JSON 种子数据（非运行时唯一数据源，见下文）
│   ├── data.json
│   ├── options.json        # 筛选项配置
│   ├── userDetails.json
│   └── companyDetails.json
├── src/
│   ├── main.tsx            # React 挂载点，引入 index.css
│   ├── App.tsx             # BrowserRouter、Routes、ECharts 懒加载
│   ├── providers.tsx       # QueryClientProvider
│   ├── api/leadsApi.ts     # 内存「假后端」：列表/改备注/删除
│   ├── context/home-context.tsx
│   ├── hooks/useDebouncedValue.ts
│   └── pages/              # 各路由页面组件
└── components/             # 布局、表格、搜索、侧栏等（部分通过 @ 引用 src）
```

---

## 路由一览

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `HomePage` | 线索列表：Header + Search（筛选表 + 表格） |
| `/echarts` | `EchartsDashboardPage`（`React.lazy`） | 统计卡片 + 多图；依赖与列表同一内存数据 |
| `/users/:userId` | `UserDetailPage` | 用户详情（读 `mock/userDetails.json`，id 需存在） |
| `/companies/:companyName` | `CompanyPage` | 企业详情（读 `mock/companyDetails.json`，名称需 URL 解码后命中 key） |

外壳布局：`AppLayout`（侧栏 `ShowMenu` + `<Outlet />` 子路由）。

---

## 核心数据流（务必理解）

### 1）唯一业务数据源：`src/api/leadsApi.ts` 中的 `store`

- 启动时用 `mock/data.json` 作为**种子**，通过 `buildInitialStore()` **复制多轮**（`cycles = 22`）生成约 **15 × 22** 条线索，并给每条生成 `avatarUrl`（`getRandomAvatar(id)`）。
- **`store` 是唯一可变数据源**：列表分页、图表统计、编辑备注、删除都作用在这份内存上。
- **刷新浏览器**会重新执行 `buildInitialStore()`，所有改动丢失。

对外方法（重要）：

| 函数 | 作用 |
|------|------|
| `getLeadsSnapshot()` | 返回当前 `store` 的浅拷贝数组；给 ECharts 的 `useQuery` 用。 |
| `fetchLeads({ filters, page, pageSize })` | 模拟网络延迟后，先 `handleData` 筛选，再切片分页，返回 `{ items, total }`。 |
| `updateLeadNote(id, note)` | 按 id 更新备注。 |
| `removeLead(id)` | 按 id 删除一条。 |

内部 `delay()` 用于模拟请求耗时（毫秒级随机）。

### 2）筛选逻辑：`components/Search/handleData.ts`

- 导出类型 **`FilterValues`**：`status`、`channel`、`owner`、`keyword`（均为字符串）。
- **`handleData(filterValue, data)`**：  
  - 前三项为「全部」时不限该维度；  
  - `keyword` 非空时，在姓名/公司/手机中模糊匹配（不区分大小写部分逻辑见源码）。

列表请求里传给 API 的关键字是 **防抖后的关键字**（见下），不是输入框里每一个中间状态。

### 3）React Query 查询键（缓存与失效）

全局默认：`staleTime: 30_000`（30 秒内可能不重新请求，视访问时机而定），`retry: 1`。

| queryKey | 用途 | 触发刷新典型场景 |
|----------|------|------------------|
| `['leads', apiFilters, page, PAGE_SIZE]` | 首页表格数据 | 筛选、页码、`PAGE_SIZE` 变化 |
| `['leads-chart-data']` | ECharts 页使用的快照 | 删除成功后 `invalidateQueries`；进入图表页会拉取 |

变更写操作：

- **编辑备注**：`updateLeadNote` 成功后 `invalidateQueries({ queryKey: ['leads'] })`。
- **删除**：`removeLead` 成功后同时失效 **`['leads']`** 与 **`['leads-chart-data']`**，保证列表与图表一致。

### 4）首页 Context：`src/context/home-context.tsx`

- **`useCommonValueHook()`**（仅在 `HomePage` 最外层使用）：维护  
  - `filters`（状态/渠道/负责人/关键字）、  
  - `dataCount`（当前筛选结果总条数，由 `Search` 根据 Query 结果写回）、  
  - `handleFilters`、`handleResetFilters`、`handleDataCount`。
- **`useContextValueHook()`**：子组件（如 `Header`、`Search`）读取上述状态。

关键字在 **Header** 里实时更新 `filters.keyword`；真正参与 **`fetchLeads`** 的是 **`useDebouncedValue(filters.keyword, 350)`** 得到的值，减少输入时频繁请求。

### 5）分页与「回第一页」

- 常量 **`PAGE_SIZE = 40`**（`components/Search/index.tsx`）。
- 下拉筛选项变更、点「重置」时：**`setPage(1)`**（在对应 `onChange` / `onClick` 里）。
- **防抖关键字变化**：`useEffect` 依赖 `debouncedKeyword`，将 **`setPage(1)`**（避免当前页码大于新结果总页数；该写法在文件中有 ESLint 说明）。

---

## 重要组件职责（简表）

| 模块 | 文件 | 职责 |
|------|------|------|
| 布局 | `components/layout/index.tsx` | Ant Design `Layout` + 侧栏 + `<Outlet />` |
| 侧栏 | `components/ShowMenu/index.tsx` | `useLocation` / `useNavigate`，菜单 key 与路径对应 |
| 首页拼装 | `src/pages/HomePage.tsx` | `CommonValueProvider` + `Header` + `Search` |
| 列表区 | `components/Search/index.tsx` | 筛选 UI、React Query、分页、Mutation |
| 表格 | `components/TableShow/index.tsx` | 列定义、跳转用户/企业、查看/编辑/删除；**操作列 `fixed: 'right'`** |
| 图表页 | `src/pages/EchartsDashboardPage.tsx` | `useQuery(['leads-chart-data'])` + `getLeadsSnapshot()`，多 `useEffect` 初始化 ECharts |

---

## Mock JSON 与运行时关系

| 文件 | 用途 |
|------|------|
| `mock/data.json` | 仅用于 **初始化 `leadsApi` 的 store**；之后以内存为准。 |
| `mock/options.json` | 首页三个下拉框的选项与字段名映射。 |
| `mock/userDetails.json` | 用户详情页字典，key 为用户 id（如 `L-1001`）；**扩充生成的 id（如 `L-1001-3`）可能无详情**。 |
| `mock/companyDetails.json` | 企业详情，key 为公司名称字符串。 |

---

## 样式说明

- **`index.css`**：全局 reset、CSS 变量、Ant Design 相关覆盖、`@import "tailwindcss"`。
- 部分组件仍使用 **CSS Module**（如 `Header.module.css`、`ShowMenu.module.css`）。

---

## 扩展或对接真实后端时建议

1. 将 **`leadsApi.ts`** 中的 `fetchLeads` / `updateLeadNote` / `removeLead` 改为请求真实 HTTP，并保留或调整 **React Query 的 queryKey**。  
2. **`getLeadsSnapshot`** 若后端无「全量快照」接口，图表可改为独立统计接口或基于同一列表 Query 派生。  
3. 用户/企业详情若改为接口，在对应 `pages` 里用 `useQuery` + 路由参数即可。

---

## 许可证

私有项目（`package.json` 中 `"private": true`）。若需开源请自行补充 License 文件。
