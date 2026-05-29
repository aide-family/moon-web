# ahooks Hook 速查

文档：https://ahooks.js.org/zh-CN/hooks/

## State

| Hook                     | 用途                                      |
| ------------------------ | ----------------------------------------- |
| `useBoolean`             | 布尔值 + `setTrue`/`setFalse`/`toggle`    |
| `useToggle`              | 两值切换                                  |
| `useSetState`            | 合并式 `setState`（类似 class component） |
| `useGetState`            | 读取最新 state 的 getter，避免闭包        |
| `useResetState`          | 重置为初始 state                          |
| `useSafeState`           | 卸载后不再 setState                       |
| `useReactive`            | 深层响应式对象（慎用，优先显式 state）    |
| `useLocalStorageState`   | 持久化到 localStorage                     |
| `useSessionStorageState` | 持久化到 sessionStorage                   |
| `useCookieState`         | Cookie 状态                               |
| `useMap` / `useSet`      | Map/Set 状态                              |
| `usePrevious`            | 上一次渲染的值                            |
| `useRafState`            | 在 requestAnimationFrame 中批量更新 state |

## Effect / Lifecycle

| Hook                        | 用途                         |
| --------------------------- | ---------------------------- |
| `useMount`                  | 挂载时执行一次               |
| `useUnmount`                | 卸载时清理                   |
| `useUnmountedRef`           | `ref.current` 表示是否已卸载 |
| `useUpdateEffect`           | 跳过首次执行的 `useEffect`   |
| `useAsyncEffect`            | 支持 async 的 effect         |
| `useDeepCompareEffect`      | 深比较 deps 的 effect        |
| `useIsomorphicLayoutEffect` | SSR 安全的 layout effect     |

## Function / Performance

| Hook                                      | 用途                                                       |
| ----------------------------------------- | ---------------------------------------------------------- |
| `useMemoizedFn`                           | 稳定函数引用 + 最新闭包（替代多数 `useCallback`）          |
| `useCreation`                             | deps 变化时才执行 factory（替代易错的 `useMemo` 创建实例） |
| `useLatest`                               | 始终指向最新值的 ref                                       |
| `useLockFn`                               | 异步函数执行期间自动加锁防重复点击                         |
| `useDebounceFn` / `useThrottleFn`         | 防抖/节流函数                                              |
| `useDebounce` / `useThrottle`             | 防抖/节流值                                                |
| `useDebounceEffect` / `useThrottleEffect` | 防抖/节流 effect                                           |

## Async / Data

| Hook                | 用途                                                                           |
| ------------------- | ------------------------------------------------------------------------------ |
| `useRequest`        | 异步数据核心 Hook，插件见 [use-request-reference.md](use-request-reference.md) |
| `usePagination`     | 前端/后端分页逻辑                                                              |
| `useAntdTable`      | Form + Ant Design Table 联动（`tableProps` / `search`）                        |
| `useFusionTable`    | Fusion Design Table 联动（本项目一般用 `useAntdTable`）                        |
| `useInfiniteScroll` | 无限滚动加载                                                                   |
| `useWebSocket`      | WebSocket 连接                                                                 |
| `clearCache`        | 清除 `useRequest` 的 `cacheKey` 缓存                                           |

### useRequest 插件速查

| options                                | 能力                            |
| -------------------------------------- | ------------------------------- |
| `manual`                               | 手动触发，配合 `run`/`runAsync` |
| `defaultParams`                        | 首次请求参数                    |
| `refreshDeps`                          | 依赖变化自动 `refresh`          |
| `ready`                                | `false` 时不请求                |
| `pollingInterval`                      | 轮询间隔（ms）                  |
| `pollingWhenHidden`                    | 页面隐藏时是否继续轮询          |
| `debounceWait` / `throttleWait`        | 防抖/节流                       |
| `refreshOnWindowFocus`                 | 窗口聚焦重新请求                |
| `retryCount`                           | 失败重试次数                    |
| `loadingDelay`                         | 延迟展示 loading，防闪烁        |
| `cacheKey` / `staleTime` / `cacheTime` | SWR 缓存                        |
| `onSuccess` / `onError` / `onFinally`  | 生命周期回调                    |

## DOM / UI

| Hook               | 用途             |
| ------------------ | ---------------- |
| `useSize`          | 监听元素尺寸     |
| `useScroll`        | 滚动位置         |
| `useInViewport`    | 元素是否在视口内 |
| `useHover`         | 悬停状态         |
| `useClickAway`     | 点击外部         |
| `useKeyPress`      | 按键监听         |
| `useEventListener` | 通用事件监听     |
| `useFullscreen`    | 全屏             |
| `useTitle`         | 页面标题         |
| `useVirtualList`   | 虚拟列表         |
| `useFocusWithin`   | 焦点是否在容器内 |

## Time

| Hook                               | 用途                   |
| ---------------------------------- | ---------------------- |
| `useInterval`                      | 定时器（回调始终最新） |
| `useTimeout`                       | 延时执行               |
| `useCountDown`                     | 倒计时                 |
| `useRafInterval` / `useRafTimeout` | rAF 版定时             |

## Form / 受控

| Hook                   | 用途                  |
| ---------------------- | --------------------- |
| `useControllableValue` | 受控/非受控双模式组件 |

## Scene / 高级

| Hook                  | 用途                 |
| --------------------- | -------------------- |
| `useSelections`       | 多选/全选逻辑        |
| `useCounter`          | 计数器               |
| `useDynamicList`      | 动态增删列表项       |
| `useHistoryTravel`    | 撤销/重做            |
| `useEventEmitter`     | 跨组件事件发布订阅   |
| `useEventTarget`      | 统一封装事件回调参数 |
| `useDrag` / `useDrop` | 拖拽                 |
| `useLongPress`        | 长按                 |
| `useExternal`         | 动态加载外部 JS/CSS  |

## 调试 / 工具

| Hook                                 | 用途                          |
| ------------------------------------ | ----------------------------- |
| `useDocumentVisibility`              | 页面可见性（切 tab 暂停轮询） |
| `useNetwork`                         | 网络状态                      |
| `useResponsive` / `configResponsive` | 响应式断点                    |
| `useWhyDidYouUpdate`                 | 开发环境排查重渲染            |
| `useUpdate`                          | 强制 re-render                |
| `useTrackedEffect`                   | 追踪 effect deps 变化         |
| `createUpdateEffect`                 | 创建跳过首次的 effect 工厂    |
| `useMutationObserver`                | 监听 DOM 变更                 |
| `useTextSelection`                   | 文本选区                      |
| `useFavicon`                         | 动态 favicon                  |
| `useTheme`                           | 主题切换                      |
| `useMouse`                           | 鼠标位置                      |
