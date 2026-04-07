import { useState } from 'react'

export interface PaginationState {
  current: number
  pageSize: number
  total: number
}

export const DEFAULT_PAGE_SIZE = 20

export function usePaginationState(initialPageSize = DEFAULT_PAGE_SIZE) {
  return useState<PaginationState>({
    current: 1,
    pageSize: initialPageSize,
    total: 0,
  })
}
