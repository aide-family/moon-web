import { useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Type = string | number | any[]
//获取该元素到浏览器顶部的距离
export const useContainerHeightTop = (ref: React.RefObject<HTMLDivElement>, type: Type, isFullscreen?: boolean) => {
  const [containerHeight, setContainerHeight] = useState(0)
  const handleResize = () => {
    const element: DOMRect | undefined = ref?.current?.getBoundingClientRect()
    if (element) {
      const height = element?.top
      setContainerHeight(height)
    }
  }
  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref, type, isFullscreen])
  return containerHeight
}
