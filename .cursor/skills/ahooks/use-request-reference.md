# useRequest 参考

文档入口：https://ahooks.js.org/zh-CN/hooks/use-request/index

`useRequest` 是 ahooks 异步数据管理核心，通过插件组合实现高级能力。React 项目中的网络请求场景优先考虑 `useRequest`（`service` 内仍调用 `src/api/**`）。

## 插件能力一览

| 能力          | 关键 options                                 | 典型场景                      |
| ------------- | -------------------------------------------- | ----------------------------- |
| 自动/手动请求 | `manual`、`defaultParams`                    | 列表自动加载 vs 按钮触发提交  |
| 依赖刷新      | `refreshDeps`                                | 筛选条件变化重新请求          |
| 条件请求      | `ready`                                      | 等 `uid`/路由参数就绪后再请求 |
| 轮询          | `pollingInterval`、`pollingWhenHidden`       | 实时告警、消息状态刷新        |
| 防抖/节流     | `debounceWait`、`throttleWait`               | 搜索框联动请求                |
| 聚焦刷新      | `refreshOnWindowFocus`、`focusTimespan`      | 切回标签页更新列表            |
| 错误重试      | `retryCount`、`retryInterval`                | 弱网接口                      |
| Loading 延迟  | `loadingDelay`                               | 避免快速请求闪烁 Spin         |
| 缓存 / SWR    | `cacheKey`、`staleTime`、`cacheTime`         | 详情页、跨组件共享数据        |
| 生命周期      | `onBefore`/`onSuccess`/`onError`/`onFinally` | 统一 toast、埋点              |

## 返回值

| 字段                         | 说明                                                      |
| ---------------------------- | --------------------------------------------------------- |
| `data` / `loading` / `error` | 请求状态                                                  |
| `params`                     | 最近一次 `run` 的参数                                     |
| `run` / `runAsync`           | 手动触发；`run` 自动走 `onError`，`runAsync` 需自行 catch |
| `refresh` / `refreshAsync`   | 用上次 params 重试                                        |
| `mutate`                     | 乐观更新 `data`（类似 `setState`）                        |
| `cancel`                     | 忽略当前 Promise 响应（组件卸载时自动取消）               |

## 项目封装（优先使用）

列表/详情请求统一走 `src/utils/hooks/`，底层均为 `useRequest`：

| Hook                          | 路径                                        | 场景                                    |
| ----------------------------- | ------------------------------------------- | --------------------------------------- |
| `usePaginatedRequest`         | `@/utils/hooks/usePaginatedRequest`         | 标准分页列表（筛选 + Table 分页）       |
| `useInfinitePaginatedRequest` | `@/utils/hooks/useInfinitePaginatedRequest` | 无限滚动列表（loadMore 追加）           |
| `useDetailRequest`            | `@/utils/hooks/useDetailRequest`            | 弹窗/侧栏详情（`ready: !!uid && open`） |

### 分页列表（推荐写法）

```tsx
import { usePaginatedRequest } from '@/utils/hooks/usePaginatedRequest'
import { useDetailRequest } from '@/utils/hooks/useDetailRequest'

const list = usePaginatedRequest<EmailItem, EmailListQuery>({
  service: (params) =>
    getEmailTableList({ ...params, keyword: params.keyword || undefined }),
  defaultQuery: defaultSearchParams,
})

const {
  dataSource,
  loading,
  refreshing,
  pagination,
  search,
  reset,
  changePage,
  refresh,
} = list

// loading：仅首屏无数据时为 true（避免刷新时 Table 全屏 loading 卸载行内 Dropdown）
// refreshing：后台刷新中，可用于轻量提示

// 搜索：提交筛选并回到第一页
search({ keyword: 'foo', status: GlobalStatus.ENABLED })

// 重置
reset(defaultSearchParams)

// 分页
changePage(page, pageSize)

// 删除/改状态后
refresh()

// 详情弹窗
const { data, loading } = useDetailRequest(
  getEmailDetail,
  viewingUid,
  detailOpen,
)
```

表单 UI 的 `searchParams` 与接口 `query` 分离时：点击搜索再 `list.search({ ...searchParams })`；仅 status 等字段自动刷新用 `useEffect` + `list.search`。

### 直接 useRequest 的场景

- 轮询：`pollingInterval` + `pollingWhenHidden: false`
- 手动提交：`useRequest(createXxx, { manual: true })` + `runAsync`
- 多接口并行选项：`useRequest(() => Promise.all([...]))`
- 实时告警等复杂防抖/静默刷新：在组件内 `useRequest` + `mutate` 静默更新

**不要**再手写 `fetchData` + `setLoading` + `mountedRef` 样板。

## 常用模式

### 列表页（筛选 + 分页）— 底层 useRequest

```tsx
const { data, loading, refresh } = useRequest(
  () =>
    listMessageLogs({
      page: pagination.current,
      pageSize: pagination.pageSize,
      ...searchParams,
    }),
  {
    refreshDeps: [searchParams, pagination.current, pagination.pageSize],
    debounceWait: 300, // 筛选频繁变化时
  },
)
```

筛选变化想回到第一页：在 `refreshDeps` 变化前手动 `setPagination(p => ({ ...p, current: 1 }))`，或评估 `useAntdTable`。

### 条件请求（ready）

```tsx
const { data, loading } = useRequest(() => getDetail(uid!), {
  ready: !!uid,
})
```

`ready=false` 时不发请求；从 `false` 变 `true` 时自动请求（自动模式）。

### 手动提交

```tsx
const { loading, runAsync } = useRequest(updateXxx, { manual: true })

const onSubmit = async () => {
  const values = await form.validateFields()
  await runAsync(values) // 需自行 catch
  message.success(t('common.success'))
  onCancel()
}
```

### 轮询

```tsx
const { cancel } = useRequest(getStatus, {
  pollingInterval: 3000,
  pollingWhenHidden: false, // 页面隐藏时暂停，配合 useDocumentVisibility
})
```

### 乐观更新（mutate）

删除/状态变更后不必等接口返回再改表格：

```tsx
const { data, mutate, refresh } = useRequest(fetchList, { ... })

const handleDelete = useMemoizedFn(async (id: string) => {
  await deleteXxx(id)
  mutate((old) => old?.filter((item) => item.uid !== id))
  // 或 refresh() 以服务端为准
})
```

### 缓存 / SWR

```tsx
const { data } = useRequest(() => getDetail(id), {
  cacheKey: `detail-${id}`,
  staleTime: 30_000,
})
```

全局清除：`import { clearCache } from 'ahooks'`。

## useAntdTable

文档：https://ahooks.js.org/zh-CN/hooks/use-antd-table

适用于 **Form 筛选 + Table 分页** 一体场景：

```tsx
const [form] = Form.useForm()
const { tableProps, search, refresh } = useAntdTable(
  async ({ current, pageSize }, formData) => {
    const res = await listXxx({ page: current, pageSize, ...formData })
    return { list: res.items ?? [], total: Number(res.total ?? 0) } // 适配项目 API 形状
  },
  { form, defaultPageSize: 50, refreshDeps: [someDep] },
)

return (
  <>
    <Form form={form} onFinish={search.submit}>
      ...
      <Button onClick={search.reset}>{t('common.reset')}</Button>
    </Form>
    <Table rowKey='uid' columns={columns} {...tableProps} />
  </>
)
```

要点：

- `service` 第一参数：`{ current, pageSize, sorter, filters, extra }`；第二参数：表单值。
- 返回 `{ total, list }`；本项目 API 多为 `{ total, items }`，在 service 内映射。
- `tableProps` 直接 spread 给 `Table`（含 `dataSource`、`loading`、`pagination`、`onChange`）。
- `search.submit` / `search.reset` 内置 `form.validateFields`。
- `refreshDeps` 变化会**重置到第一页**并重新请求。

## 何时不必用 useRequest

- 单次、极简请求（如弹窗打开时拉一条详情），手写 `useEffect` + `loading` 也可。
- 项目已有稳定 `fetchData` 模板且无重复痛点时，不强行迁移。
- `useAntdTable` 要求 Form+Table 联动；筛选在 URL/独立 state、表格结构复杂时，继续 `useRequest` + 手动分页更合适。
