---
name: code-review
description: Reviews git changes for bugs and code quality; enforces strict React conventions and Ant Design v6 usage; requires fixes when issues are found. Reusable code must be reused; no deprecated antd APIs. Use when the user says "帮我审核当前变更" or "帮我审核代码".
---

# 代码审核

对当前 **Git 变更** 进行审核：排查潜在 bug、评估代码质量，并严格按 React 规范与 Ant Design v6 检查风格与实现。发现问题必须给出修正方案或直接修正。

## 触发场景

- 用户说「帮我审核当前变更」
- 用户说「帮我审核代码」

审核范围：仅针对 **当前未提交的变更**（git diff / staged 文件）。先获取变更内容再开始审核。

## 审核维度

### 1. 正确性与 Bug

- 逻辑是否正确，边界与空值是否处理。
- 异步请求：是否有卸载后 setState、是否缺少 loading/error 处理。
- 类型：是否滥用 `any`、类型断言是否合理、与 API 类型是否一致。**枚举一致性**：若 API 已改为枚举类型（如 `GlobalStatus`、`DatasourceType`、`SampleMode`、`ConditionMetric`），则：（1）所有调用处、回调参数、**setState/表单状态** 均使用该枚举类型，不得遗留 `string`/`number` 或 `modeRaw`/`conditionRaw` 等原始值落库到状态；（2）**提交请求参数** 直接传枚举值，不得对枚举字段使用 `String()`/`Number()` 转换（例如 `mode: editingLevelData.mode` 而非 `String(editingLevelData.mode)`）；（3）**表单收集枚举字段** 时用 Select + 枚举 options，勿用 `Input type="number"` 或裸字符串再转 Number。
- 依赖数组与副作用：`useEffect`/`useMemo`/`useCallback` 依赖是否完整、是否造成多余渲染或闭包陈旧。

### 2. React 规范（必须严格遵守）

- 组件：使用 `React.FC<Props>` 或 `function Component(props: Props)`，Props 用 `interface` 明确定义。
- 类型：优先 `import type`，状态与 API 返回类型一致。
- Hooks：只在顶层调用，条件/循环中不调用；自定义 Hook 命名以 `use` 开头。
- 列表 key：使用稳定、唯一标识，禁止用 index 作为 key（列表会增删重排时）。
- 受控/非受控：表单与可编辑 UI 的受控方式一致，无受控/非受控混用导致的警告或 bug。
- 参考项目内 [react-antd-page](.cursor/skills/react-antd-page/SKILL.md) 中的结构与类型、请求与状态等约定。

### 3. 复用与冗余（硬性要求）

- **能复用的必须复用**：若变更中有与 `src/components/` 或同项目其他模块可复用的逻辑/组件，必须改为复用，不得重复实现。
- **禁止额外创造不必要的东西**：不新增重复工具函数、不新增与现有组件功能重叠的组件；若现有 API 模块（`src/api/`）已有对应接口与类型，必须使用，不得在页面内重复定义请求或类型。

### 4. Ant Design v6 与 UI 风格（必须严格遵守）

- 仅使用 Ant Design **v6** 当前推荐的组件与 API，以 [官方文档](https://ant.design/components/overview-cn/) 为准。
- **禁止使用已弃用**的组件、属性或变量（如文档标注废弃的 List 等，需改用推荐替代方案）。遇控制台弃用警告须按提示替换，例如：**Divider** 的 `orientationMargin` 已废弃，须用 `styles.content` 的**逻辑外边距**替代——`titlePlacement='left'` 时用 `styles={{ content: { marginInlineStart: 0 } }}`，`titlePlacement='right'` 时用 `marginInlineEnd: 0`（与 antd 源码中 innerStyle 一致），勿仅写 `margin: 0`。
- **Table** 的 `rowKey` 若为函数，不得使用第二个参数 index（v6 已废弃且行为不保证）；须用行的稳定字段（如 `record.uid`、`record.id` 或组合字段）生成唯一 key。
- 按需从 `antd` 引入组件，图标从 `@ant-design/icons` 按需引入。
- 表格列使用 `ColumnsType<YourRowType>`，类型与 API 的 Item/Row 一致。
- 若项目已配置 `ConfigProvider`/`App`，主题与国际化保持一致。

### 5. 与项目约定一致

- 请求与类型来自 `src/api/`，不在此次变更中直接修改 API 模块（若需改 API，应使用 update-api 技能）。
- 列表/空态/错误态有明确 UI（Empty、Result、Message 等）；危险操作有二次确认（Popconfirm/Modal）。

## 输出要求

1. **结论**：是否通过审核；若有问题，按严重程度列出（必须改 / 建议改）。
2. **问题列表**：每条包含文件、位置（行号或代码片段）、问题描述、修改建议或直接给出修正代码。
3. **必须修正**：对「必须改」项，在用户同意或明确要求时，直接修改代码并保证通过审核标准；不满足 React 规范、复用要求或 Ant Design v6 要求时，一律要求修正并协助完成修改。

## 自检清单（审核时逐项核对）

- [ ] 无逻辑错误与明显 bug；异步与类型安全。
- [ ] 符合 React 规范（组件、Hooks、key、受控组件等）。
- [ ] 可复用逻辑/组件已复用；无多余新组件或重复工具。
- [ ] 仅使用 Ant Design v6 未弃用组件与 API（无 orientationMargin、rowKey 用 index 等弃用用法）。
- [ ] 类型来自 `src/api/` 或已有模块，无重复定义。
- [ ] **枚举与 API 一致**：API 使用枚举的字段，调用处、事件处理函数参数、setState、表单状态、提交参数均使用该枚举类型；状态不落库 number/string 原始值，提交不对枚举字段做 String()/Number() 转换，表单用 Select+枚举 options 而非 number input。
- [ ] 列表/空态/错误态与危险操作交互符合项目约定。
