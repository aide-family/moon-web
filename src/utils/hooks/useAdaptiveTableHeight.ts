import { useEffect, useRef, useState } from 'react'

const TABLE_BODY_PADDING = 32
const PAGINATION_EXTRA = 16
const MIN_TABLE_HEIGHT = 100

/**
 * 根据容器与表头/分页器高度计算 Table scroll.y。
 * 使用 ResizeObserver + rAF，不依赖 dataSource，避免列表刷新时强制回流。
 */
export function useAdaptiveTableHeight() {
  const tableContainerRef = useRef<HTMLDivElement>(null)
  const tableWrapperRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(MIN_TABLE_HEIGHT)
  const rafIdRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    const measure = () => {
      const container = tableContainerRef.current
      const wrapper = tableWrapperRef.current
      if (!container || !wrapper) return

      const containerHeight = container.clientHeight
      const theadEl = wrapper.querySelector('.ant-table-thead')
      const paginationEl = wrapper.querySelector('.ant-pagination')

      const theadHeight = theadEl ? (theadEl as HTMLElement).offsetHeight : 0
      const paginationHeight = paginationEl
        ? (paginationEl as HTMLElement).offsetHeight + PAGINATION_EXTRA
        : 0

      const next = Math.max(
        containerHeight - theadHeight - paginationHeight - TABLE_BODY_PADDING,
        MIN_TABLE_HEIGHT,
      )
      setTableHeight((prev) => (prev === next ? prev : next))
    }

    const scheduleMeasure = () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = undefined
        measure()
      })
    }

    scheduleMeasure()

    const observer = new ResizeObserver(scheduleMeasure)
    const container = tableContainerRef.current
    const wrapper = tableWrapperRef.current
    if (container) observer.observe(container)
    if (wrapper) observer.observe(wrapper)

    window.addEventListener('resize', scheduleMeasure, { passive: true })

    return () => {
      if (rafIdRef.current !== undefined) {
        cancelAnimationFrame(rafIdRef.current)
      }
      observer.disconnect()
      window.removeEventListener('resize', scheduleMeasure)
    }
  }, [])

  return {
    tableContainerRef,
    tableWrapperRef,
    tableHeight,
  }
}
