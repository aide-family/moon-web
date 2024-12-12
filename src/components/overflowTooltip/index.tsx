import { Tooltip } from 'antd'
import React, { useEffect, useRef, useState } from 'react'

const OverflowTooltip = ({
  content,
  style = {},
  maxWidth
}: {
  content: string
  style?: React.CSSProperties
  maxWidth: number | string
}) => {
  const [isOverflow, setIsOverflow] = useState(false)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (textRef.current) {
      const scrollWidth = textRef.current.scrollWidth
      const clientWidth = textRef.current.clientWidth
      setIsOverflow(scrollWidth > clientWidth)
    }
  }, [content])

  return (
    <div ref={textRef} style={{ ...style, maxWidth }} className='overflow-hidden whitespace-nowrap text-ellipsis'>
      {isOverflow ? (
        <Tooltip title={content} overlayClassName='max-w-[300px] max-h-[200px] overflow-y-auto'>
          <div className='max-w-full text-left overflow-hidden whitespace-nowrap text-ellipsis'>{content}</div>
        </Tooltip>
      ) : (
        <div className='max-w-full text-left'>{content}</div>
      )}
    </div>
  )
}

export default OverflowTooltip
