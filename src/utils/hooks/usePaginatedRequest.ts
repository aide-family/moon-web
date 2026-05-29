import { useRequest } from 'ahooks'
import { startTransition, useState } from 'react'

export interface PaginationState {
  current: number
  pageSize: number
  total: number
}

export const DEFAULT_LIST_PAGE_SIZE = 50

export type PaginatedListResponse<TItem> = {
  items?: TItem[]
  total?: string | number
}

export function parseListTotal(total?: string | number): number {
  return Number.parseInt(String(total ?? 0), 10) || 0
}

type PageParams = { page: number; pageSize: number }

export interface UsePaginatedRequestOptions<
  TItem,
  TQuery extends Record<string, unknown>,
> {
  service: (params: TQuery & PageParams) => Promise<PaginatedListResponse<TItem>>
  defaultQuery: TQuery
  defaultPageSize?: number
  ready?: boolean
  /** 筛选依赖变化时防抖（毫秒） */
  debounceWait?: number
}

export function usePaginatedRequest<
  TItem,
  TQuery extends Record<string, unknown>,
>({
  service,
  defaultQuery,
  defaultPageSize = DEFAULT_LIST_PAGE_SIZE,
  ready = true,
  debounceWait,
}: UsePaginatedRequestOptions<TItem, TQuery>) {
  const [query, setQuery] = useState<TQuery>(defaultQuery)
  const [pagination, setPagination] = useState<PaginationState>({
    current: 1,
    pageSize: defaultPageSize,
    total: 0,
  })

  const { data, loading, refresh, mutate, runAsync } = useRequest(
    async () => {
      try {
        const response = await service({
          ...query,
          page: pagination.current,
          pageSize: pagination.pageSize,
        })
        return {
          items: response.items ?? [],
          total: parseListTotal(response.total),
        }
      } catch (error) {
        console.error(error)
        return { items: [] as TItem[], total: 0 }
      }
    },
    {
      ready,
      refreshDeps: [query, pagination.current, pagination.pageSize],
      debounceWait,
      onSuccess: (result) => {
        setPagination((prev) => ({ ...prev, total: result.total }))
      },
    },
  )

  /** 仅首屏无数据时展示 Table loading，避免刷新时卸载行内 Dropdown 导致 Trigger 报错 */
  const listLoading = loading && data === undefined
  const refreshing = loading && data !== undefined

  const search = (nextQuery: Partial<TQuery> | TQuery) => {
    startTransition(() => {
      setPagination((prev) => ({ ...prev, current: 1 }))
      setQuery((prev) => ({ ...prev, ...nextQuery }))
    })
  }

  const reset = (nextQuery: TQuery = defaultQuery) => {
    startTransition(() => {
      setPagination({ current: 1, pageSize: defaultPageSize, total: 0 })
      setQuery(nextQuery)
    })
  }

  const changePage = (page: number, pageSize: number) => {
    startTransition(() => {
      setPagination((prev) => ({ ...prev, current: page, pageSize }))
    })
  }

  return {
    dataSource: data?.items ?? [],
    loading: listLoading,
    refreshing,
    query,
    setQuery,
    pagination,
    setPagination,
    refresh,
    mutate,
    runAsync,
    search,
    reset,
    changePage,
  }
}
