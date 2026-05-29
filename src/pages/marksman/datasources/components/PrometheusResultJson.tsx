import type { PrometheusApiResponse } from '@/api/marksman/metricQuery/types'
import { useTheme } from '@/contexts/useTheme'
import { useLocale } from '@/contexts/LocaleContext'
import Editor from '@monaco-editor/react'
import { useSize } from 'ahooks'
import { Empty, Spin } from 'antd'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { extractPrometheusResultData } from '../utils/prometheus'

interface PrometheusResultJsonProps {
  response: PrometheusApiResponse | null
  loading?: boolean
  /** Tab 可见后再挂载 Monaco，避免隐藏态高度为 0 */
  active?: boolean
}

const PrometheusResultJson: React.FC<PrometheusResultJsonProps> = ({
  response,
  loading,
  active = true,
}) => {
  const { t } = useLocale()
  const { actualThemeMode } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const size = useSize(containerRef)
  const [editorReady, setEditorReady] = useState(false)

  const jsonText = useMemo(() => {
    if (!response) return ''
    const resultData = extractPrometheusResultData(response)
    if (resultData == null) return 'null'
    return JSON.stringify(resultData, null, 2)
  }, [response])

  const editorHeight = size?.height ?? 0

  useEffect(() => {
    if (!active) {
      setEditorReady(false)
      return
    }
    const frame = requestAnimationFrame(() => {
      setEditorReady(true)
    })
    return () => cancelAnimationFrame(frame)
  }, [active])

  if (loading) {
    return (
      <div className='h-full min-h-0 flex items-center justify-center'>
        <Spin />
      </div>
    )
  }

  if (!response) {
    return (
      <div className='h-full min-h-0 flex items-center justify-center'>
        <Empty description={t('datasource.quickQuery.empty')} />
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className='h-full min-h-0 flex-1 rounded-(--ant-border-radius) overflow-hidden border border-(--ant-color-border-secondary)'
    >
      {active && editorReady && editorHeight > 0 ? (
        <Editor
          height={editorHeight}
          language='json'
          theme={actualThemeMode === 'dark' ? 'vs-dark' : 'vs'}
          value={jsonText}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            padding: { top: 12, bottom: 12 },
            automaticLayout: true,
            renderLineHighlight: 'none',
            folding: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
          }}
        />
      ) : (
        <div className='h-full min-h-0 flex items-center justify-center'>
          <Spin size='small' />
        </div>
      )}
    </div>
  )
}

export default PrometheusResultJson
