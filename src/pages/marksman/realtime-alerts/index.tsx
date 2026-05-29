import { GlobalStatus } from '@/api/common/types'
import { getAlertStatistics } from '@/api/marksman/alert'
import type { LevelCount } from '@/api/marksman/alert/types'
import { getLevelSelectList, LevelType } from '@/api/marksman/level'
import PageContent from '@/components/layout/PageContent'
import { useLocale } from '@/contexts/LocaleContext'
import { emptyPlaceholder } from '@/utils/marksman'
import { useTheme } from '@/contexts/useTheme'
import { ReloadOutlined } from '@ant-design/icons'
import { App, Select, Space, Spin, Switch, Tooltip } from 'antd'
import React, { useMemo, useState } from 'react'
import { useMemoizedFn, useRequest } from 'ahooks'
import { RealtimeAlertList } from './components/RealtimeAlertList'
import {
  readStoredRefreshIntervalMs,
  REALTIME_ALERT_REFRESH_INTERVALS,
  type RealtimeAlertRefreshIntervalMs,
  writeStoredRefreshIntervalMs,
} from './realtimeAlertStorage'

const REFRESH_INTERVAL_LABEL_KEYS: Record<
  RealtimeAlertRefreshIntervalMs,
  string
> = {
  0: 'realtimeAlert.autoRefresh.off',
  5000: 'realtimeAlert.autoRefresh.5s',
  10000: 'realtimeAlert.autoRefresh.10s',
  30000: 'realtimeAlert.autoRefresh.30s',
  60000: 'realtimeAlert.autoRefresh.1m',
  300000: 'realtimeAlert.autoRefresh.5m',
  900000: 'realtimeAlert.autoRefresh.15m',
}

export default function RealtimeAlertListWrapper() {
  const { t } = useLocale()
  const { actualThemeMode } = useTheme()
  const isDark = actualThemeMode === 'dark'
  const [refreshIntervalMs, setRefreshIntervalMs] =
    useState<RealtimeAlertRefreshIntervalMs>(() =>
      readStoredRefreshIntervalMs(),
    )
  /** 是否对实时告警表格行应用接口返回的 bgColor（默认开启） */
  const [rowBgColorEnabled, setRowBgColorEnabled] = useState(true)

  const {
    data: stats,
    loading: statsLoading,
    refresh: refreshStatsSilently,
  } = useRequest(getAlertStatistics, {
    pollingInterval: refreshIntervalMs || undefined,
    pollingWhenHidden: false,
  })

  const { data: levelSelectList = [] } = useRequest(async () => {
    const res = await getLevelSelectList({
      limit: 10,
      status: GlobalStatus.ENABLED,
      type: LevelType.LEVEL_TYPE_ALERT,
    })
    return (res.items ?? [])
      .filter((i): i is { value: string; label?: string } => Boolean(i?.value))
      .map((i) => ({
        value: i.value,
        label: i.label ?? i.value,
      }))
  })

  const refreshIntervalOptions = useMemo(
    () =>
      REALTIME_ALERT_REFRESH_INTERVALS.map((value) => ({
        value,
        label: t(REFRESH_INTERVAL_LABEL_KEYS[value]),
      })),
    [t],
  )

  const handleRefreshIntervalChange = useMemoizedFn(
    (value: RealtimeAlertRefreshIntervalMs) => {
      setRefreshIntervalMs(value)
      writeStoredRefreshIntervalMs(value)
    },
  )

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
            <Space size='middle' wrap className='shrink-0 justify-end'>
              <Space size='small' wrap align='center'>
                <ReloadOutlined
                  className={mutedTextClassName}
                  style={mutedTextStyle}
                />
                <Select<RealtimeAlertRefreshIntervalMs>
                  size='small'
                  value={refreshIntervalMs}
                  options={refreshIntervalOptions}
                  onChange={handleRefreshIntervalChange}
                  popupMatchSelectWidth={false}
                  style={{ minWidth: 96 }}
                  aria-label={t('realtimeAlert.autoRefresh.label')}
                />
              </Space>
              <Space size='small' wrap align='center'>
                <Tooltip title={t('realtimeAlert.rowBgColor.tooltip')}>
                  <span className={mutedTextClassName} style={mutedTextStyle}>
                    {t('realtimeAlert.rowBgColor.label')}
                  </span>
                </Tooltip>
                <Switch
                  size='small'
                  checked={rowBgColorEnabled}
                  onChange={(checked) => setRowBgColorEnabled(checked)}
                />
              </Space>
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
          stats={stats ?? null}
          refreshIntervalMs={refreshIntervalMs}
          rowBgColorEnabled={rowBgColorEnabled}
          onRefreshStats={async () => {
            await refreshStatsSilently()
          }}
        />
      </PageContent>
    </App>
  )
}
