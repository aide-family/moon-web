import { useEffect, useState } from 'react'

type Type = string | Array<any>
//获取该元素到浏览器顶部的距离
export const useContainerHeightTop = (ref: HTMLDivElement , type: Type) => {
  const [containerHeight, setContainerHeight] = useState(0);
  const handleResize = () => {
    const element = ref.current?.getBoundingClientRect();
    if (element) {
      const height = element?.top
      setContainerHeight(height)
    }
  };
  useEffect(() => {
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    };
  }, [ref, type])
  return containerHeight
}
