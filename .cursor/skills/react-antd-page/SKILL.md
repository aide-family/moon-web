---
name: react-antd-page
description: Develops feature pages and modules in React + TypeScript using Ant Design v6; follows project API conventions, does not modify API modules directly—uses update-api skill when API changes are needed; enforces senior-level code quality and consistent UI. Use when the user asks to complete a feature, module, or page (完成xxx功能 / 完成xxx模块 / 完成xxx页面).
---

# React + Ant Design 页面开发

在 React + TypeScript 项目下，按规范开发功能页/模块/页面。UI 使用 [Ant Design v6](https://ant.design/components/overview-cn/)；禁止使用已弃用的组件或 API；风格统一、美观；接口严格依赖 `src/api/` 定义，不直接改 API，若 API 有缺陷先通过 update-api 技能更新再改页面。

## 技术栈与规范

- **框架**：React 18+，TypeScript 严格模式。
- **UI 库**：Ant Design **v6**。组件与 API 以 [官方文档](https://ant.design/components/overview-cn/) 为准，**不得使用文档标注为废弃的组件或属性**（如已废弃的 List 等，改用推荐替代方案）。
- **代码质量**：达到高级前端工程师水准——类型完整、结构清晰、可维护、无多余渲染与内存泄漏风险。

## API 使用规则（必守）

1. **只读不改**：页面与组件仅 **引用** `src/api/` 下已导出的请求函数与类型，**禁止在页面开发过程中直接修改** `src/api/` 内任何文件。
2. **类型从 API 来**：请求参数、响应数据、枚举等一律从对应 API 模块 `import type` 或 `import`，不在页面里重复定义或写死与后端不一致的类型。
3. **API 与后端不一致时**：若发现接口定义错误、缺字段、枚举不符等，**必须先使用 update-api 技能**从后端 OpenAPI 同步更新 `src/api/`，再基于新类型调整页面逻辑与展示。不得在页面里用类型断言、`any` 或本地类型“绕过”错误定义。

## 页面实现要点

### 结构与类型

- 页面/模块放在 `src/pages/` 对应业务目录下；可复用 UI 抽到 `src/components/`。
- **页面内子组件**：当单文件内组件/逻辑过多、超过可读阈值时，将子组件与仅本页使用的辅助函数（如筛选构建、mock、常量映射）拆到**当前页面模块目录下的 `components/`**（例如 `src/pages/foo/bar/components/`），由入口 `index.tsx` 引用；跨页面复用的再提升到 `src/components/`。
- 组件用 `React.FC<Props>` 或 `function Component(props: Props)`，Props 用 `interface` 定义，必填/可选写清楚。
- 优先 `import type` 引用类型；状态类型与 API 返回类型一致，避免到处 `any`。

### 请求与状态

- 异步请求使用 API 模块导出的方法（如 `getXxxList`、`createXxx`），不自行拼 `fetch`/`axios`。
- 在 `useEffect` 中发请求时，用取消标记或 AbortController 避免卸载后 setState；loading/error 状态完整，列表为空与加载失败要有明确 UI（Empty、Result、Message 等）。
- 列表页：分页、筛选、排序参数与 API 的 `types.ts` 中定义一致，不随意增删字段。

### Ant Design v6 使用

- 按需从 `antd` 引入组件（如 `Table`、`Form`、`Button`、`Space`、`Modal`、`Message`/`App.useApp()` 等）。
- 图标从 `@ant-design/icons` 按需引入。
- 表格列用 `ColumnsType<YourRowType>`，类型来自 API 的 Item/Row 类型。
- 主题与国际化若项目已配置 `ConfigProvider`/`App`，保持一致；不引入已废弃组件或废弃 props（查 v6 文档确认）。

### 样式与体验

- 布局与间距统一（如 Space、Flex、Grid），配色与项目现有风格一致。
- 加载中：Spin 或 Skeleton；操作反馈：Message/Notification；危险操作：Popconfirm 或 Modal 二次确认。
- 表单：校验规则与 API 参数对应；提交前可做前端校验，提交用 API 模块的创建/更新方法。

### 列表模糊查询（必做）

- 搜索框支持**回车触发查询**：`onPressEnter` 时须用**当前输入框的值**发起请求，避免依赖 state 未更新导致查询条件滞后。实现方式：`handleSearch` 支持可选参数（如 `override?: Partial<SearchParams>`），回车时传入 `(e.target as HTMLInputElement).value`，`fetchData` 接受 override 并优先使用其参与请求，同时可同步更新 state/URL。

### 新增/编辑弹窗表单（必做）

- **表单必须使用 `Form` 管理**：所有业务表单（含筛选表单、弹窗表单、设置表单）必须使用 `Form` + `Form.Item` 托管字段值与校验；禁止用 `useState` 直接逐字段管理输入值后再手工拼装提交参数。
- **先关闭弹窗，再重置表单**：提交成功回调中只调用 `onSuccess()` 与 `onCancel()`，**不要**在成功路径里调用会执行 `form.resetFields()` 的 `handleCancel()`，否则用户会先看到表单清空再关闭。表单重置仅在用户点击取消/遮罩关闭时在 `onCancel` 中执行，或依赖再次打开时（如 create 模式）的 `useEffect` 里 `resetFields()`。

### 国际化（若项目已启用）

- 若存在 `LocaleContext` 或 `useLocale()`，列表标题、按钮、提示等使用 `t('key')`，不写死中文/英文。

## 与 update-api 的配合

- 当实现某功能时发现：缺少接口、参数/响应类型错误、枚举与后端不一致等，**先说明需要更新 API**，再执行 **update-api 技能** 同步 OpenAPI 并更新 `src/api/` 的 `types.ts` 与 `index.ts`。
- 在 API 更新完成并导出正确类型与函数后，再继续实现或调整页面：改用新类型、新参数、新枚举，并检查所有引用处（含其它页面/组件）是否一并更新。

## 自检清单

- [ ] 未使用 Ant Design 已废弃的组件或属性（以 v6 文档为准）。
- [ ] 所有请求与类型均来自 `src/api/`，未直接修改 API 模块。
- [ ] API 与后端不一致时已通过 update-api 更新，再改页面。
- [ ] 类型完整、无不必要的 `any`；Props 与状态类型清晰。
- [ ] 异步请求有取消/清理，无卸载后 setState。
- [ ] 列表/空态/错误态有明确 UI；表单与 API 参数一致。
- [ ] 所有业务表单均由 `Form` 管理（`Form` + `Form.Item` + `form.validateFields/setFieldsValue`），无散落的字段级 `useState` 直绑输入。
- [ ] 列表搜索：回车触发查询时使用当前输入值（override 入参或 ref），不依赖未刷新的 state。
- [ ] 新增/编辑弹窗：提交成功后只调用 onSuccess + onCancel，不在成功路径中先 resetFields 再关闭。
- [ ] 代码结构清晰、可维护，符合高级前端工程师标准。
- [ ] 复杂页面已将子组件与页内专用辅助逻辑放在同模块 `components/` 下，入口页保持精简。
