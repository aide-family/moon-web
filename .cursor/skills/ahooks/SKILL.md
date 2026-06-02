---
name: ahooks
description: Evaluates whether ahooks hooks can replace hand-rolled React patterns when implementing features. Applies ahooks function-handling conventions (useMemoizedFn, stable outputs, latest inputs). Use when completing features, pages, or modules (完成xxx功能/页面/模块), refactoring hooks, or when code uses mountedRef/useCallback/debounce/polling patterns that ahooks may cover.
---

# ahooks 使用规范

项目已安装 `ahooks@^3`（`package.json`）。在完成项目功能的过程中，需要思考 ahooks 中是否有合适的 hooks 工具可以使用，如果有，可以使用到项目中，减少不必要的代码封装。

官方文档：**https://ahooks.js.org/zh-CN/hooks/**  
函数处理规范：**https://ahooks.js.org/zh-CN/guide/blog/function/**（源码：[function.zh-CN.md](https://github.com/alibaba/hooks/blob/master/docs/guide/blog/function.zh-CN.md)）

与 [react-antd-page](react-antd-page/SKILL.md) 配合：请求仍调用 `src/api/**`，ahooks 只封装调用方式与 UI 状态，不替代 API 模块。

## 开发前检查（必做）

实现功能前，先对照下表判断能否用 ahooks 替代手写逻辑：

| 手写模式                                       | 优先考虑的 ahooks                                                                    |
| ---------------------------------------------- | ------------------------------------------------------------------------------------ |
| `mountedRef` + 卸载后防 setState               | `useSafeState`、`useUnmountedRef`                                                    |
| 大量 `useCallback` 稳定事件函数                | `useMemoizedFn`                                                                      |
| 搜索/输入防抖、节流                            | `useDebounceFn`、`useThrottleFn`、`useDebounce`                                      |
| `useEffect(() => { fetch... }, [])` 仅挂载请求 | `useMount` + 已有 fetch，或 `useRequest`                                             |
| 定时刷新 / 轮询                                | `useInterval`、`useRequest` 的 `pollingInterval`                                     |
| 组件卸载清理                                   | `useUnmount`                                                                         |
| 本地/会话存储状态                              | `useLocalStorageState`、`useSessionStorageState`                                     |
| 布尔/切换状态                                  | `useBoolean`、`useToggle`                                                            |
| 列表请求 + loading/error/刷新样板              | **`usePaginatedRequest`**（见 [use-request-reference.md](use-request-reference.md)） |
| 筛选条件变化重新拉列表                         | `usePaginatedRequest` + `search` / `refreshDeps`                                     |
| 等 uid/路由参数就绪再请求                      | **`useDetailRequest`** 或 `useRequest` + `ready: !!uid`                              |
| 删除/改状态后乐观更新表格                      | `useRequest` + `mutate` 或 `refresh()`                                               |
| Form 筛选 + Table 分页联动                     | `useAntdTable`（API 返回 `{items,total}` 需在 service 映射为 `{list,total}`）        |
| 分页列表（通用）                               | `usePagination`                                                                      |
| 无限滚动列表                                   | **`useInfinitePaginatedRequest`** 或 `useInfiniteScroll`                             |
| 窗口/元素尺寸、滚动、可见性                    | `useSize`、`useScroll`、`useInViewport`、`useDocumentVisibility`                     |
| 点击外部关闭                                   | `useClickAway`                                                                       |
| 防重复提交                                     | `useLockFn`                                                                          |
| 复杂对象只初始化一次                           | `useCreation`（优于误用 `useMemo`）                                                  |

完整 Hook 列表见 [hooks-reference.md](hooks-reference.md)。

## ahooks 函数处理规范（必守）

ahooks 对输入输出函数做特殊处理，避免闭包与依赖数组问题：

1. **所有 Hooks 返回的函数，地址不会变化**（类似 `setState`），可放心传给子组件或写入 effect 依赖，无需反复包 `useCallback`。
2. **传入 ahooks 的回调函数，调用时永远是最新闭包**（内部用 `useRef` 保持最新），例如 `useInterval(() => console.log(state), 1000)` 中 `state` 始终最新。

### 对本项目的写法建议

```tsx
// ❌ 不必：为稳定引用手写 useCallback + 维护 deps
const handleSearch = useCallback((v: string) => { ... }, [a, b, c])

// ✅ 推荐：事件处理用 useMemoizedFn
const handleSearch = useMemoizedFn((v: string) => { ... })

// ❌ 不必：mountedRef 防卸载 setState
const mountedRef = useRef(true)
useEffect(() => () => { mountedRef.current = false }, [])

// ✅ 推荐
const [data, setData] = useSafeState<Item[]>([])
// 或 const unmountedRef = useUnmountedRef()
```

- 派生数据（过滤后的列表、表格列定义）仍用 `useMemo`。
- 需要函数引用**永不变化**且始终读到最新 state/props 时，用 `useMemoizedFn`，不要空依赖 `useCallback`。
- 使用 ahooks 返回的函数（如 `useRequest` 的 `run`、`refresh`）时，同样地址稳定，勿再包一层 `useCallback`。

## useRequest 与项目 API

[useRequest](https://ahooks.js.org/zh-CN/hooks/use-request/index) 是项目**唯一推荐的请求封装方式**；`service` 内必须调用 `src/api/**`。列表页优先 `usePaginatedRequest` / `useInfinitePaginatedRequest`，详情用 `useDetailRequest`，其余场景直接用 `useRequest`。详细插件与示例见 [use-request-reference.md](use-request-reference.md)。

```tsx
import { useRequest } from 'ahooks'
import { listXxx } from '@/api/foo/bar'

// 自动请求 + 筛选依赖刷新 + 防抖
const { data, loading, error, refresh, mutate } = useRequest(
  () => listXxx({ page, pageSize, ...searchParams }),
  { refreshDeps: [searchParams, page, pageSize], debounceWait: 300 },
)

// 手动提交（创建/更新）
const { loading, runAsync } = useRequest(createXxx, { manual: true })

// 条件请求：等必要参数就绪
const { data } = useRequest(() => getDetail(uid!), { ready: !!uid })
```

**优先用 useRequest 替换的样板**：`mountedRef` + `setLoading` + `try/catch/finally` + `fetchData` + `useCallback` deps 维护。

**与手写模式对照**（本项目列表页常见写法）：

| 手写                          | useRequest 替代                                |
| ----------------------------- | ---------------------------------------------- |
| `mountedRef` 防卸载 setState  | 内置卸载自动 `cancel`                          |
| `paginationRef` 读最新分页    | `refreshDeps` 或 `useAntdTable`                |
| 筛选变化 `useEffect` 调 fetch | `refreshDeps: [searchParams]`                  |
| 删除后整表 refresh            | `mutate` 乐观更新或 `refresh()`                |
| `useInterval` 轮询列表        | `pollingInterval` + `pollingWhenHidden: false` |

- Form + Table 一体：优先 `useAntdTable`；API 返回 `items` 时在 service 映射为 `list`。
- 已有成熟 `fetchData` 且逻辑简单时不必强行迁移；**重复样板明显时再引入**。

## 引入原则

1. **先查后用**：不确定 API 时查 [官方文档](https://ahooks.js.org/zh-CN/hooks/)，不臆造参数。
2. **减少封装，不增加抽象**：用 ahooks 替换重复样板，不要为包一层再写自定义 Hook（除非跨页面复用）。
3. **与项目约定一致**：i18n、`App.useApp()`、API 类型等仍遵守 `moon-web-pages-conventions` 与 `react-antd-page`。
4. **按需引入**：`import { useDebounceFn } from 'ahooks'`，勿默认引入整个库。

## 自检清单

- [ ] 实现前已对照 ahooks 是否有现成 Hook，避免重复造轮子。
- [ ] 事件函数优先 `useMemoizedFn`；卸载安全优先 `useSafeState` / `useUnmountedRef`。
- [ ] 列表/详情/提交请求已用 `usePaginatedRequest` / `useDetailRequest` / `useRequest`，无手写 `fetchData` + `setLoading`。
- [ ] 列表场景已评估 `refreshDeps`、`ready`、`mutate`、`useAntdTable` 是否更合适。
- [ ] 未引入与现有逻辑等价的冗余自定义 Hook。
