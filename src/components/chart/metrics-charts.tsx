import type { MetricSeries } from '@/types/metrics'
import { GlobalContext } from '@/utils/context'
import { getDataRange } from '@/utils/metricsTransform'
import { Chart } from '@antv/g2'
import React, { useContext } from 'react'

export interface Threshold {
  label: {
    text: string
  }
  value: number
  color: string
}

export interface MetricsChartProps {
  data: MetricSeries[]
  className?: string
  thresholds?: Threshold[]
  showArea?: boolean
}

export const MetricsChart: React.FC<MetricsChartProps> = ({ data, className, thresholds, showArea }) => {
  const containerRef = React.useRef<HTMLDivElement>(null)

  const { theme } = useContext(GlobalContext)

  React.useEffect(() => {
    if (!containerRef.current) return

    // Transform data for G2
    const chartData = data.flatMap((series) =>
      series.values.map((point) => ({
        instance: series.instance?.length > 130 ? `${series.instance.substring(0, 130)}...` : series.instance,
        timestamp: point.timestamp,
        value: point.value
      }))
    )

    // Get exact min/max range without padding
    const { min, max } = getDataRange(data)

    const chart = new Chart({
      container: containerRef.current,
      autoFit: true,
      // height: 400,
      style: {
        height: '100%'
      }
      // padding: 40,
    })

    chart.theme({ type: theme === 'dark' ? 'classicDark' : 'classic' })

    // 生成阈值线

    for (const threshold of thresholds || []) {
      chart
        .line()
        .encode('x', 'timestamp')
        .encode('y', threshold.value)
        .style({
          stroke: threshold.color,
          lineWidth: 2
        })
        .label({
          text: threshold.label.text,
          selector: 'last',
          position: 'right',
          textAlign: 'end',
          dy: 0
        })
        .tooltip(false)
    }

    chart.options({
      tooltip: {
        shared: true,
        showCrosshairs: true,
        crosshairs: {
          line: {
            style: {
              stroke: '#666',
              lineWidth: 1,
              lineDash: [4, 4]
            }
          }
        },
        domStyles: {
          'g2-tooltip': {
            backgroundColor: '#1a1a1a',
            color: '#fff',
            padding: '8px 12px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            borderRadius: '4px'
          },
          'g2-tooltip-title': {
            color: '#fff'
          },
          'g2-tooltip-list-item': {
            color: '#fff',
            marginBottom: '4px'
          }
        }
      }
    })

    chart.data(chartData)

    // Configure the line chart with smooth curves
    chart
      .line()
      .encode('x', 'timestamp')
      .encode('shape', 'smooth')
      .encode('y', 'value')
      .encode('color', 'instance')
      .style({
        lineWidth: 2,
        curveType: 'monotone'
      })
      .scale('y', {
        nice: true,
        domain: [min, max],
        tickCount: 5
      })
      .scale('x', {
        type: 'time',
        tickCount: 5
      })
    //   .scale('color', {
    //     range: ['#3498db', '#2ecc71']
    //   })

    // Add area with very low opacity for depth
    if (showArea) {
      chart
        .area()
        .encode('x', 'timestamp')
        .encode('shape', 'smooth')
        .encode('y', 'value')
        .encode('color', 'instance')
        .style({
          fillOpacity: 0.1,
          curveType: 'monotone' // Match the line curve type
        })
        .scale('y', {
          nice: true,
          domain: [min, max],
          tickCount: 5
        })
      //   .scale('color', {
      //     range: ['#3498db', '#2ecc71']
      //   })
    }

    // Configure axes
    chart.axis('y', {
      title: false,
      grid: {
        line: {
          style: {
            stroke: 'red',
            lineWidth: 1,
            lineDash: [4, 4]
          }
        }
      },
      label: {
        formatter: (v: string) => Number.parseFloat(v).toFixed(3),
        style: {
          fontSize: 11,
          fill: '#666'
        }
      }
    })

    chart.axis('x', {
      title: false,
      grid: {
        line: {
          style: {
            stroke: '#e0e0e0',
            lineWidth: 1
          }
        }
      },
      label: {
        formatter: (v: string) => {
          const date = new Date(Number.parseInt(v))
          return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`
        },
        style: {
          fontSize: 11,
          fill: '#666'
        }
      }
    })

    // Add legend
    chart.legend('color', {
      position: 'top',
      flipPage: false,
      marker: {
        symbol: 'line'
      }
    })
    chart.render()

    return () => {
      chart.destroy()
    }
  }, [data, theme, showArea, thresholds])

  return <div ref={containerRef} className={className} />
}
