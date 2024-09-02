import React, { useRef, useEffect, useState } from 'react'
import { Tooltip } from 'antd'
import styles from './index.module.scss'

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
    <div
      ref={textRef}
      style={{
        ...style,
        maxWidth,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
      }}
    >
      {isOverflow ? (
        <Tooltip title={content} overlayClassName={styles.tooltip}>
          <div style={{ maxWidth: '100%' }} className={styles.text_overflow}>
            {content}
          </div>
        </Tooltip>
      ) : (
        <div style={{ maxWidth: '100%', textAlign: 'left' }}>{content}</div>
      )}
    </div>
  )
}

export default OverflowTooltip
