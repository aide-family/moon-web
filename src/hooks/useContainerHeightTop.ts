import { useCallback, useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Type = string | number | any[]
//获取该元素到浏览器顶部的距离
export const useContainerHeightTop = (ref: React.RefObject<HTMLDivElement>, type: Type, isFullscreen?: boolean) => {
  const [containerHeight, setContainerHeight] = useState(0)
  const handleResize = useCallback(() => {
    const element: DOMRect | undefined = ref?.current?.getBoundingClientRect()
    if (element) {
      const height = element?.top
      setContainerHeight(height)
    }
  }, [ref])

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize, type, isFullscreen])
  return containerHeight
}

// 获取内容区域高度
export const useContainerHeight = (
  ref: React.RefObject<HTMLDivElement>,
  headerRef: React.RefObject<HTMLDivElement>,
  footerRef: React.RefObject<HTMLDivElement>
) => {
  const [containerHeight, setContainerHeight] = useState(0)
  const handleResize = useCallback(() => {
    const element: DOMRect | undefined = ref?.current?.getBoundingClientRect()
    const headerHeight = headerRef?.current?.getBoundingClientRect()?.height || 0
    const footerHeight = footerRef?.current?.getBoundingClientRect()?.height || 0
    if (element) {
      const height = element?.height - headerHeight - footerHeight
      setContainerHeight(height)
    }
  }, [ref, headerRef, footerRef])

  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [handleResize])

  return containerHeight
}
