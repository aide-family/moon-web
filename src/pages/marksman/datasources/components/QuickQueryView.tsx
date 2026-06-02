import {
  DatasourceType,
  type DatasourceItem,
} from '@/api/marksman/datasource/types'
import {
  prometheusQuery,
  prometheusQueryRange,
} from '@/api/marksman/metricQuery/index'
import type { PrometheusApiResponse } from '@/api/marksman/metricQuery/types'
import { useTheme } from '@/contexts/useTheme'
import { useLocale } from '@/contexts/LocaleContext'
import {
  CodeOutlined,
  LineChartOutlined,
  PlayCircleOutlined,
  TableOutlined,
} from '@ant-design/icons'
import Editor from '@monaco-editor/react'
import { useMemoizedFn, useRequest, useUnmount } from 'ahooks'
import {
  Alert,
  Button,
  DatePicker,
  Divider,
  Empty,
  Flex,
  InputNumber,
  Segmented,
  Space,
  Tabs,
  Typography,
  theme,
} from 'antd'
import dayjs, { type Dayjs } from 'dayjs'
import React, { useMemo, useRef, useState } from 'react'
import PrometheusResultGraph from './PrometheusResultGraph'
import PrometheusResultJson from './PrometheusResultJson'
import PrometheusResultTable from './PrometheusResultTable'
import {
  registerPromqlDataCompletion,
  setupPromqlLanguage,
} from '../utils/promqlEditor'

interface QuickQueryViewProps {
  uid: string
  datasource?: DatasourceItem | null
}

type RangePreset = '1h' | '3h' | '6h' | '12h' | '1d' | '7d' | 'custom'
type ResultTab = 'table' | 'graph' | 'json'

const RANGE_PRESET_SECONDS: Record<Exclude<RangePreset, 'custom'>, number> = {
  '1h': 3600,
  '3h': 10800,
  '6h': 21600,
  '12h': 43200,
  '1d': 86400,
  '7d': 604800,
}

const DEFAULT_QUERY = 'up'

const panelClassName =
  'rounded-(--ant-border-radius-lg) border border-(--ant-color-border-secondary) bg-(--ant-color-bg-container) overflow-hidden'

const resultPaneClassName = 'h-full min-h-0 flex flex-col overflow-hidden'

const resultTabsClassName =
  'h-full min-h-0 flex flex-col [&_.ant-tabs-nav]:mb-0! [&_.ant-tabs-nav]:shrink-0 [&_.ant-tabs-nav]:px-4 [&_.ant-tabs-nav]:pt-1 [&_.ant-tabs-content-holder]:flex-1 [&_.ant-tabs-content-holder]:min-h-0 [&_.ant-tabs-content]:h-full [&_.ant-tabs-content]:min-h-0 [&_.ant-tabs-tabpane]:h-full [&_.ant-tabs-tabpane]:min-h-0 [&_.ant-tabs-tabpane]:flex [&_.ant-tabs-tabpane]:flex-col [&_.ant-tabs-tabpane]:overflow-hidden [&_.ant-tabs-tabpane]:px-4 [&_.ant-tabs-tabpane]:pb-3'

const QuickQueryView: React.FC<QuickQueryViewProps> = ({ uid, datasource }) => {
  const { t } = useLocale()
  const { actualThemeMode } = useTheme()
  const { token } = theme.useToken()
  const completionDisposeRef = useRef<(() => void) | null>(null)
  const [query, setQuery] = useState(DEFAULT_QUERY)
  const [rangePreset, setRangePreset] = useState<RangePreset>('1h')
  const [customRange, setCustomRange] = useState<[Dayjs, Dayjs]>(() => [
    dayjs().subtract(1, 'hour'),
    dayjs(),
  ])
  const [step, setStep] = useState(60)
  const [tableResult, setTableResult] = useState<PrometheusApiResponse | null>(
    null,
  )
  const [graphResult, setGraphResult] = useState<PrometheusApiResponse | null>(
    null,
  )
  const [error, setError] = useState<string | null>(null)
  const [resultTab, setResultTab] = useState<ResultTab>('table')

  const isMetricsDatasource = datasource?.type === DatasourceType.METRICS
  const editorTheme = actualThemeMode === 'dark' ? 'vs-dark' : 'vs'

  const { start, end } = useMemo(() => {
    if (rangePreset === 'custom') {
      return {
        start: customRange[0].unix(),
        end: customRange[1].unix(),
      }
    }
    const seconds = RANGE_PRESET_SECONDS[rangePreset]
    const endTime = dayjs().unix()
    return { start: endTime - seconds, end: endTime }
  }, [rangePreset, customRange])

  const rangePresetOptions = useMemo(
    () => [
      { label: t('datasource.quickQuery.range.1h'), value: '1h' as const },
      { label: t('datasource.quickQuery.range.3h'), value: '3h' as const },
      { label: t('datasource.quickQuery.range.6h'), value: '6h' as const },
      { label: t('datasource.quickQuery.range.12h'), value: '12h' as const },
      { label: t('datasource.quickQuery.range.1d'), value: '1d' as const },
      { label: t('datasource.quickQuery.range.7d'), value: '7d' as const },
      {
        label: t('datasource.quickQuery.range.custom'),
        value: 'custom' as const,
      },
    ],
    [t],
  )

  const { loading, runAsync: runQuery } = useRequest(
    async (promql: string) => {
      const [instantRes, rangeRes] = await Promise.all([
        prometheusQuery(uid, promql, end),
        prometheusQueryRange(uid, promql, start, end, step),
      ])
      return { instantRes, rangeRes }
    },
    { manual: true },
  )

  const handleExecute = useMemoizedFn(async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      setError(t('datasource.quickQuery.error.emptyQuery'))
      return
    }

    setError(null)

    try {
      const { instantRes, rangeRes } = await runQuery(trimmed)

      const instantError =
        instantRes.status === 'error'
          ? (instantRes.error ?? t('datasource.quickQuery.error.queryFailed'))
          : null
      const rangeError =
        rangeRes.status === 'error'
          ? (rangeRes.error ?? t('datasource.quickQuery.error.queryFailed'))
          : null

      if (instantError && rangeError) {
        setError(rangeError)
        setTableResult(null)
        setGraphResult(null)
        return
      }

      setTableResult(instantError ? null : instantRes)
      setGraphResult(rangeError ? null : rangeRes)
      setError(instantError ?? rangeError)
    } catch (e) {
      console.error('Prometheus query failed:', e)
      setError(t('datasource.quickQuery.error.queryFailed'))
      setTableResult(null)
      setGraphResult(null)
    }
  })

  const handleBeforeMount = useMemoizedFn(
    (monaco: Parameters<typeof setupPromqlLanguage>[0]) => {
      setupPromqlLanguage(monaco)
    },
  )

  const handleEditorMount = useMemoizedFn(
    (
      editor: {
        addCommand: (keybinding: number, handler: () => void) => void
      },
      monaco: Parameters<typeof registerPromqlDataCompletion>[0],
    ) => {
      completionDisposeRef.current?.()
      const { dispose } = registerPromqlDataCompletion(monaco, uid)
      completionDisposeRef.current = dispose

      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
        void handleExecute()
      })
    },
  )

  useUnmount(() => {
    completionDisposeRef.current?.()
  })

  const resultTabItems = useMemo(
    () => [
      {
        key: 'table',
        label: (
          <Space size={6}>
            <TableOutlined />
            {t('datasource.quickQuery.tab.table')}
          </Space>
        ),
        children: (
          <div className={resultPaneClassName}>
            <PrometheusResultTable response={tableResult} loading={loading} />
          </div>
        ),
      },
      {
        key: 'graph',
        label: (
          <Space size={6}>
            <LineChartOutlined />
            {t('datasource.quickQuery.tab.graph')}
          </Space>
        ),
        children: (
          <div className={resultPaneClassName}>
            <PrometheusResultGraph response={graphResult} />
          </div>
        ),
      },
      {
        key: 'json',
        label: (
          <Space size={6}>
            <CodeOutlined />
            {t('datasource.quickQuery.tab.json')}
          </Space>
        ),
        children: (
          <div className={resultPaneClassName}>
            <PrometheusResultJson
              response={tableResult}
              loading={loading}
              active={resultTab === 'json'}
            />
          </div>
        ),
      },
    ],
    [t, tableResult, graphResult, loading, resultTab],
  )

  if (!isMetricsDatasource) {
    return (
      <div className='h-full flex items-center justify-center p-6'>
        <Empty description={t('datasource.quickQuery.unsupported')} />
      </div>
    )
  }

  return (
    <div className='h-full min-h-0 flex flex-col gap-3 p-1'>
      <section className={`${panelClassName} shrink-0`}>
        <Flex
          align='center'
          justify='space-between'
          className='px-4 py-2 border-b border-(--ant-color-border-secondary) bg-(--ant-color-fill-alter)'
        >
          <Typography.Text type='secondary' className='text-xs font-medium'>
            {t('datasource.quickQuery.expression')}
          </Typography.Text>
          <Typography.Text type='secondary' className='text-xs'>
            {t('datasource.quickQuery.shortcut')}
          </Typography.Text>
        </Flex>

        <div
          className='h-[120px]'
          style={{ background: token.colorFillQuaternary }}
        >
          <Editor
            height='120px'
            language='promql'
            theme={editorTheme}
            value={query}
            onChange={(value) => setQuery(value ?? '')}
            beforeMount={handleBeforeMount}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: 'Menlo, Monaco, "Courier New", monospace',
              lineNumbers: 'off',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 8, bottom: 8 },
              automaticLayout: true,
              renderLineHighlight: 'line',
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              quickSuggestions: true,
              suggestOnTriggerCharacters: true,
              tabCompletion: 'on',
              scrollbar: { vertical: 'hidden', horizontal: 'auto' },
            }}
          />
        </div>

        <Flex
          wrap
          gap={12}
          align='center'
          className='px-4 py-3 border-t border-(--ant-color-border-secondary)'
        >
          <Button
            type='primary'
            icon={<PlayCircleOutlined />}
            loading={loading}
            onClick={() => void handleExecute()}
          >
            {t('datasource.quickQuery.run')}
          </Button>

          <Divider type='vertical' className='h-6! m-0! hidden sm:block' />

          <Flex wrap gap={8} align='center' className='min-w-0 flex-1'>
            <Typography.Text type='secondary' className='text-xs shrink-0'>
              {t('datasource.quickQuery.timeRange')}
            </Typography.Text>
            <Segmented<RangePreset>
              size='small'
              value={rangePreset}
              options={rangePresetOptions}
              onChange={(value) => setRangePreset(value)}
            />
            {rangePreset === 'custom' && (
              <DatePicker.RangePicker
                showTime
                size='small'
                value={customRange}
                onChange={(values) => {
                  if (values?.[0] && values[1]) {
                    setCustomRange([values[0], values[1]])
                  }
                }}
              />
            )}
          </Flex>

          <Divider type='vertical' className='h-6! m-0! hidden md:block' />

          <Space size={8} align='center' className='shrink-0'>
            <Typography.Text type='secondary' className='text-xs'>
              {t('datasource.quickQuery.step')}
            </Typography.Text>
            <InputNumber
              size='small'
              min={1}
              max={86400}
              value={step}
              onChange={(v) => setStep(v ?? 60)}
              suffix='s'
              className='w-[88px]'
            />
          </Space>
        </Flex>
      </section>

      {error && (
        <Alert
          type='error'
          showIcon
          closable
          onClose={() => setError(null)}
          message={t('datasource.quickQuery.error.title')}
          description={error}
          className='shrink-0'
        />
      )}

      <section className={`${panelClassName} flex-1 min-h-0 flex flex-col`}>
        <Tabs
          className={resultTabsClassName}
          activeKey={resultTab}
          onChange={(key) => setResultTab(key as ResultTab)}
          items={resultTabItems}
          destroyOnHidden={false}
        />
      </section>
    </div>
  )
}

export default QuickQueryView
