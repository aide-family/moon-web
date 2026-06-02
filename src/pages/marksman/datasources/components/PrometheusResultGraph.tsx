import type { PrometheusApiResponse } from '@/api/marksman/metricQuery/types'
import { useLocale } from '@/contexts/LocaleContext'
import { useMemoizedFn, useSize } from 'ahooks'
import { Empty } from 'antd'
import dayjs from 'dayjs'
import React, { useMemo, useRef, useState } from 'react'
import { toGraphSeries } from '../utils/prometheus'

interface PrometheusResultGraphProps {
  response: PrometheusApiResponse | null
}

const CHART_COLORS = [
  '#1677ff',
  '#52c41a',
  '#faad14',
  '#eb2f96',
  '#13c2c2',
  '#722ed1',
  '#fa541c',
  '#2f54eb',
]

interface HoverState {
  time: number
  plotX: number
  items: { name: string; value: number; color: string }[]
}

function findNearestPoint(
  points: { time: number; value: number }[],
  targetTime: number,
) {
  if (points.length === 0) return null
  let nearest = points[0]
  let minDiff = Math.abs(points[0].time - targetTime)
  for (let i = 1; i < points.length; i++) {
    const diff = Math.abs(points[i].time - targetTime)
    if (diff < minDiff) {
      minDiff = diff
      nearest = points[i]
    }
  }
  return nearest
}

const PrometheusResultGraph: React.FC<PrometheusResultGraphProps> = ({
  response,
}) => {
  const { t } = useLocale()
  const containerRef = useRef<HTMLDivElement>(null)
  const size = useSize(containerRef)
  const [hover, setHover] = useState<HoverState | null>(null)

  const series = useMemo(
    () => (response ? toGraphSeries(response) : []),
    [response],
  )

  const width = Math.max(size?.width ?? 640, 320)
  const height = 340
  const padding = { top: 24, right: 20, bottom: 44, left: 64 }
  const plotW = width - padding.left - padding.right
  const plotH = height - padding.top - padding.bottom

  const chartMeta = useMemo(() => {
    const allPoints = series.flatMap((s) => s.points)
    if (allPoints.length === 0) return null

    const minTime = Math.min(...allPoints.map((p) => p.time))
    const maxTime = Math.max(...allPoints.map((p) => p.time))
    const minVal = Math.min(...allPoints.map((p) => p.value))
    const maxVal = Math.max(...allPoints.map((p) => p.value))
    const valSpan = maxVal - minVal || 1
    const timeSpan = maxTime - minTime || 1

    const x = (time: number) =>
      padding.left + ((time - minTime) / timeSpan) * plotW
    const y = (value: number) =>
      padding.top + plotH - ((value - minVal) / valSpan) * plotH

    return { minTime, maxTime, minVal, valSpan, timeSpan, x, y }
  }, [series, plotW, plotH, padding.left, padding.top])

  const handleMouseMove = useMemoizedFn(
    (event: React.MouseEvent<SVGRectElement>) => {
      if (!chartMeta || series.length === 0) return

      const svg = event.currentTarget.ownerSVGElement
      if (!svg) return

      const rect = svg.getBoundingClientRect()
      const scaleX = width / rect.width
      const relX = (event.clientX - rect.left) * scaleX - padding.left

      if (relX < 0 || relX > plotW) {
        setHover(null)
        return
      }

      const targetTime = chartMeta.minTime + (relX / plotW) * chartMeta.timeSpan
      const plotX = padding.left + relX

      const items = series
        .map((s, index) => {
          const nearest = findNearestPoint(s.points, targetTime)
          if (!nearest) return null
          return {
            name: s.name,
            value: nearest.value,
            color: CHART_COLORS[index % CHART_COLORS.length],
          }
        })
        .filter((item): item is NonNullable<typeof item> => item != null)

      if (items.length === 0) {
        setHover(null)
        return
      }

      setHover({ time: targetTime, plotX, items })
    },
  )

  const handleMouseLeave = useMemoizedFn(() => {
    setHover(null)
  })

  if (!response || series.length === 0 || !chartMeta) {
    return (
      <div className='h-full min-h-0 flex-1 flex items-center justify-center'>
        <Empty description={t('datasource.quickQuery.graph.empty')} />
      </div>
    )
  }

  const yTicks = 5
  const yTickLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const ratio = i / yTicks
    const value = chartMeta.minVal + chartMeta.valSpan * (1 - ratio)
    const py = padding.top + plotH * ratio
    return { value, py }
  })

  const xLabelCount = 4
  const xLabels = Array.from({ length: xLabelCount + 1 }, (_, i) => {
    const ratio = i / xLabelCount
    const time = chartMeta.minTime + chartMeta.timeSpan * ratio
    return { time, x: padding.left + plotW * ratio }
  })

  return (
    <div
      ref={containerRef}
      className='flex flex-col gap-3 w-full h-full min-h-0 flex-1'
    >
      <div className='relative flex-1 min-h-0 rounded-(--ant-border-radius) bg-(--ant-color-fill-alter) overflow-hidden'>
        {hover && (
          <div
            className='absolute z-10 pointer-events-none max-w-[min(100%,420px)]'
            style={{
              left: Math.min(Math.max(hover.plotX - 120, 8), width - 280),
              top: 8,
            }}
          >
            <div className='rounded-(--ant-border-radius) border border-(--ant-color-border-secondary) bg-(--ant-color-bg-elevated) shadow-md px-3 py-2 text-xs'>
              <div className='font-medium text-(--ant-color-text) mb-1.5'>
                {dayjs
                  .unix(Math.round(hover.time))
                  .format('YYYY-MM-DD HH:mm:ss')}
              </div>
              <div className='flex flex-col gap-1 max-h-40 overflow-auto'>
                {hover.items.map((item) => (
                  <div
                    key={item.name}
                    className='flex items-center gap-2 min-w-0'
                  >
                    <span
                      className='inline-block w-2 h-2 rounded-full shrink-0'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='truncate text-(--ant-color-text-secondary) flex-1'>
                      {item.name}
                    </span>
                    <span className='font-mono text-(--ant-color-text) shrink-0'>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className='w-full block select-none'
          role='img'
          aria-label={t('datasource.quickQuery.graph.aria')}
        >
          {yTickLines.map((tick) => (
            <g key={tick.py}>
              <line
                x1={padding.left}
                y1={tick.py}
                x2={width - padding.right}
                y2={tick.py}
                stroke='var(--ant-color-border-secondary)'
                strokeDasharray='4 4'
              />
              <text
                x={padding.left - 10}
                y={tick.py + 4}
                textAnchor='end'
                fontSize={11}
                fill='var(--ant-color-text-tertiary)'
              >
                {tick.value.toPrecision(4)}
              </text>
            </g>
          ))}

          {xLabels.map((label) => (
            <text
              key={label.x}
              x={label.x}
              y={height - 12}
              textAnchor='middle'
              fontSize={11}
              fill='var(--ant-color-text-tertiary)'
            >
              {dayjs.unix(label.time).format('HH:mm')}
            </text>
          ))}

          <line
            x1={padding.left}
            y1={padding.top + plotH}
            x2={width - padding.right}
            y2={padding.top + plotH}
            stroke='var(--ant-color-border)'
          />
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={padding.top + plotH}
            stroke='var(--ant-color-border)'
          />

          {hover && (
            <line
              x1={hover.plotX}
              y1={padding.top}
              x2={hover.plotX}
              y2={padding.top + plotH}
              stroke='var(--ant-color-text-quaternary)'
              strokeWidth={1}
              strokeDasharray='4 2'
            />
          )}

          {series.map((s, index) => {
            const color = CHART_COLORS[index % CHART_COLORS.length]
            const path = s.points
              .map(
                (p, i) =>
                  `${i === 0 ? 'M' : 'L'} ${chartMeta.x(p.time)} ${chartMeta.y(p.value)}`,
              )
              .join(' ')
            const activePoint = hover
              ? findNearestPoint(s.points, hover.time)
              : null

            return (
              <g key={s.name}>
                <path
                  d={path}
                  fill='none'
                  stroke={color}
                  strokeWidth={hover ? 1.25 : 1.5}
                  opacity={hover ? 0.5 : 1}
                />
                {activePoint && (
                  <circle
                    cx={chartMeta.x(activePoint.time)}
                    cy={chartMeta.y(activePoint.value)}
                    r={4}
                    fill={color}
                    stroke='var(--ant-color-bg-container)'
                    strokeWidth={2}
                  />
                )}
              </g>
            )
          })}

          <rect
            x={padding.left}
            y={padding.top}
            width={plotW}
            height={plotH}
            fill='transparent'
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />
        </svg>
      </div>

      <div className='flex flex-wrap gap-x-4 gap-y-1.5 px-1'>
        {series.map((s, index) => (
          <div key={s.name} className='flex items-center gap-1.5 max-w-full'>
            <span
              className='inline-block w-3 h-0.5 shrink-0 rounded-full'
              style={{
                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
              }}
            />
            <span className='truncate text-xs text-(--ant-color-text-secondary)'>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PrometheusResultGraph
