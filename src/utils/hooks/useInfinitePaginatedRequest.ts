import { useRequest } from 'ahooks'
import { startTransition, useState } from 'react'
import {
  parseListTotal,
  type PaginatedListResponse,
} from './usePaginatedRequest'

export interface UseInfinitePaginatedRequestOptions<
  TItem,
  TQuery extends Record<string, unknown>,
> {
  service: (
    params: TQuery & { page: number; pageSize: number },
  ) => Promise<PaginatedListResponse<TItem>>
  defaultQuery: TQuery
  defaultPageSize?: number
  ready?: boolean
}

export function useInfinitePaginatedRequest<
  TItem,
  TQuery extends Record<string, unknown>,
>({
  service,
  defaultQuery,
  defaultPageSize = 20,
  ready = true,
}: UseInfinitePaginatedRequestOptions<TItem, TQuery>) {
  const [query, setQuery] = useState<TQuery>(defaultQuery)
  const [page, setPage] = useState(1)
  const [items, setItems] = useState<TItem[]>([])
  const [total, setTotal] = useState(0)

  const { loading, refresh, mutate } = useRequest(
    async () => {
      try {
        const response = await service({
          ...query,
          page,
          pageSize: defaultPageSize,
        })
        const newItems = response.items ?? []
        const newTotal = parseListTotal(response.total)
        setItems((prev) => (page === 1 ? newItems : [...prev, ...newItems]))
        setTotal(newTotal)
        return { items: newItems, total: newTotal }
      } catch (error) {
        console.error(error)
        if (page === 1) {
          setItems([])
          setTotal(0)
        }
        return { items: [] as TItem[], total: 0 }
      }
    },
    {
      ready,
      refreshDeps: [query, page],
    },
  )

  const search = (nextQuery: Partial<TQuery> | TQuery) => {
    startTransition(() => {
      setPage(1)
      setQuery((prev) => ({ ...prev, ...nextQuery }))
    })
  }

  const reset = (nextQuery: TQuery = defaultQuery) => {
    startTransition(() => {
      setPage(1)
      setQuery(nextQuery)
      setItems([])
      setTotal(0)
    })
  }

  const loadMore = () => {
    if (loading || items.length >= total || total <= 0) return
    startTransition(() => {
      setPage((prev) => prev + 1)
    })
  }

  const hasMore = items.length < total && total > 0
  /** 仅首屏无数据时全表 loading；追加页用 loadingMore */
  const listLoading = loading && items.length === 0 && page === 1
  const loadingMore = loading && page > 1

  return {
    dataSource: items,
    loading: listLoading,
    loadingMore,
    hasMore,
    query,
    setQuery,
    page,
    total,
    search,
    reset,
    refresh,
    loadMore,
    mutate,
    setItems,
  }
}
