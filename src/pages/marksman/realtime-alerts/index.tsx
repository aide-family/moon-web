import { GlobalStatus } from '@/api/common/types'
import type { GetAlertStatisticsReply } from '@/api/marksman/alert'
import { getAlertStatistics } from '@/api/marksman/alert'
import type { LevelCount } from '@/api/marksman/alert/types'
import { getLevelSelectList } from '@/api/marksman/level'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder } from '@/utils/marksman'
import { useTheme } from '@/contexts/ThemeContext'
import { App, Space, Spin, Switch, Tooltip } from 'antd'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { RealtimeAlertList } from './components/RealtimeAlertList'

export default function RealtimeAlertListWrapper() {
  const { t } = useLocale()
  const { actualThemeMode } = useTheme()
  const isDark = actualThemeMode === 'dark'
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true)
  const [statsLoading, setStatsLoading] = useState(false)
  const mountedRef = useRef(true)
  const statsRefreshInFlightRef = useRef(false)
  const initialLoadedRef = useRef(false)
  const [stats, setStats] = useState<GetAlertStatisticsReply | null>(null)
  const [levelSelectList, setLevelSelectList] = useState<
    { value: string; label: string }[]
  >([])

  const refreshStatsSilently = useCallback(async () => {
    if (statsRefreshInFlightRef.current) return
    statsRefreshInFlightRef.current = true
    try {
      const res = await getAlertStatistics()
      if (!mountedRef.current) return
      setStats(res)
    } catch (e) {
      // 自动刷新失败时不破坏当前展示，仍保持旧数据
      console.error('获取告警实时统计失败:', e)
    } finally {
      statsRefreshInFlightRef.current = false
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    let cancelled = false
    const run = async () => {
      setStatsLoading(true)
      try {
        const [statsResult, levelsResult] = await Promise.allSettled([
          getAlertStatistics(),
          getLevelSelectList({ limit: 10, status: GlobalStatus.ENABLED }),
        ])
        if (cancelled) return
        if (statsResult.status === 'fulfilled') {
          setStats(statsResult.value)
        } else {
          console.error('获取告警实时统计失败:', statsResult.reason)
          setStats(null)
        }
        if (levelsResult.status === 'fulfilled') {
          const items = (levelsResult.value.items ?? [])
            .filter((i): i is { value: string; label?: string } =>
              Boolean(i?.value),
            )
            .map((i) => ({
              value: i.value,
              label: i.label ?? i.value,
            }))
          setLevelSelectList(items)
        } else {
          console.error('获取告警等级列表失败:', levelsResult.reason)
          setLevelSelectList([])
        }
      } finally {
        if (!cancelled && mountedRef.current) {
          setStatsLoading(false)
          initialLoadedRef.current = true
        }
      }
    }
    run()
    return () => {
      cancelled = true
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (!autoRefreshEnabled) return
    const timer = window.setInterval(() => {
      void refreshStatsSilently()
    }, 60_000)
    // 避免与首屏 Promise.allSettled 重复请求
    if (initialLoadedRef.current) {
      void refreshStatsSilently()
    }
    return () => {
      window.clearInterval(timer)
    }
  }, [autoRefreshEnabled, refreshStatsSilently])

  const parseCount = (v?: string) => {
    const n = v == null ? 0 : Number(v)
    return Number.isFinite(n) ? n : 0
  }

  const levelStatRows: LevelCount[] = useMemo(() => {
    const byApi = stats?.countByLevel ?? []
    const countByUid = new Map<string, string>()
    for (const row of byApi) {
      if (row.levelUid != null && row.levelUid !== '') {
        countByUid.set(row.levelUid, row.count ?? '0')
      }
    }
    if (levelSelectList.length > 0) {
      return levelSelectList.map((opt) => ({
        levelUid: opt.value,
        levelName: opt.label,
        count: countByUid.get(opt.value) ?? '0',
      }))
    }
    return byApi
  }, [stats, levelSelectList])

  const headerClassName = isDark
    ? 'sticky top-0 z-10 pt-2 pb-3 mb-2 border-b'
    : 'sticky top-0 z-10 bg-white pt-2 pb-3 mb-2 border-b border-gray-100'
  const headerStyle = isDark
    ? ({
        backgroundColor: 'var(--ant-table-header-bg)',
        borderBottomColor: 'var(--ant-color-border-secondary)',
      } as React.CSSProperties)
    : undefined
  const cardClassName = 'rounded-lg px-3 py-2.5'
  const cardStyle: React.CSSProperties = {
    backgroundColor: isDark
      ? 'var(--ant-table-header-bg)'
      : 'var(--ant-color-bg-container)',
    backgroundImage: isDark
      ? 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0))'
      : undefined,
    border: `1px solid var(--ant-color-border-secondary)`,
    borderRadius: 'var(--ant-border-radius-lg)',
    boxShadow: 'var(--ant-box-shadow-tertiary)',
  }
  const mutedTextStyle = isDark
    ? ({ color: 'var(--ant-color-text-secondary)' } as React.CSSProperties)
    : undefined
  const primaryTextStyle = isDark
    ? ({ color: 'var(--ant-color-text-heading)' } as React.CSSProperties)
    : undefined
  const secondaryTextStyle = isDark
    ? ({ color: 'var(--ant-color-text)' } as React.CSSProperties)
    : undefined

  const mutedTextClassName = isDark ? '' : 'text-gray-500'
  const primaryTextClassName = isDark ? '' : 'text-gray-900'
  const secondaryTextClassName = isDark ? '' : 'text-gray-800'

  return (
    <App className='h-full'>
      <PageContent>
        <div className={headerClassName} style={headerStyle}>
          <div className='flex items-center justify-between gap-3 mb-2'>
            <div
              className={`text-base font-medium ${primaryTextClassName}`}
              style={primaryTextStyle}
            >
              {t('realtimeAlert.title')}
            </div>
            <Space size='small' className='shrink-0'>
              <Tooltip title={t('realtimeAlert.autoRefresh.interval', { minutes: 1 })}>
              <span className={mutedTextClassName} style={mutedTextStyle}>
                {t('realtimeAlert.autoRefresh.label')}
              </span>
              </Tooltip>
              <Switch
                size='small'
                checked={autoRefreshEnabled}
                onChange={(checked) => setAutoRefreshEnabled(checked)}
              />
            </Space>
          </div>
          {statsLoading ? (
            <div className='py-3 flex items-center justify-start gap-2'>
              <Spin />
              <span className={mutedTextClassName} style={mutedTextStyle}>
                {t('common.loading')}
              </span>
            </div>
          ) : stats ? (
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2'>
              <div className={cardClassName} style={cardStyle}>
                <div
                  className={`text-xs ${mutedTextClassName}`}
                  style={mutedTextStyle}
                >
                  {t('realtimeAlert.statistics.totalActiveCount')}
                </div>
                <div
                  className={`mt-1 text-lg font-semibold tabular-nums ${primaryTextClassName}`}
                  style={primaryTextStyle}
                >
                  {stats.totalActiveCount ?? '-'}
                </div>
              </div>
              <div className={cardClassName} style={cardStyle}>
                <div
                  className={`text-xs ${mutedTextClassName}`}
                  style={mutedTextStyle}
                >
                  {t('realtimeAlert.statistics.todayRecoveredCount')}
                </div>
                <div
                  className={`mt-1 text-lg font-semibold tabular-nums ${primaryTextClassName}`}
                  style={primaryTextStyle}
                >
                  {stats.todayRecoveredCount ?? '-'}
                </div>
              </div>
              {levelStatRows.map((item, idx) => (
                <div
                  key={item.levelUid ?? item.levelName ?? String(idx)}
                  className={cardClassName}
                  style={cardStyle}
                >
                  <div
                    className={`text-xs truncate ${secondaryTextClassName}`}
                    style={secondaryTextStyle}
                    title={emptyPlaceholder(item.levelName)}
                  >
                    {emptyPlaceholder(item.levelName)}
                  </div>
                  <div
                    className={`mt-1 text-lg font-semibold tabular-nums ${primaryTextClassName}`}
                    style={primaryTextStyle}
                  >
                    {parseCount(item.count)}
                  </div>
                </div>
              ))}
              {levelStatRows.length === 0 ? (
                <div className={cardClassName} style={cardStyle}>
                  <div
                    className={`text-xs ${mutedTextClassName}`}
                    style={mutedTextStyle}
                  >
                    {t('realtimeAlert.statistics.byLevel')}
                  </div>
                  <div
                    className={`mt-1 text-sm ${mutedTextClassName}`}
                    style={mutedTextStyle}
                  >
                    {t('common.noData')}
                  </div>
                </div>
              ) : null}
            </div>
          ) : (
            <div className={mutedTextClassName} style={mutedTextStyle}>
              {t('common.noData')}
            </div>
          )}
        </div>

        <RealtimeAlertList
          stats={stats}
          autoRefreshEnabled={autoRefreshEnabled}
        />
      </PageContent>
    </App>
  )
}
