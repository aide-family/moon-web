/**
 * Marksman 模块共享工具：表格空占位、数据源类型/驱动文案、全局状态规范化与状态 Tag 渲染。
 * 供 src/pages/marksman 下各页面与组件复用，避免重复实现。
 */

import type { ReactNode } from 'react'
import { Tag, Tooltip } from 'antd'
import { AlertEventItem, GlobalStatus } from '@/api'

/** 表格单元格空值占位 */
export function emptyPlaceholder(text: unknown): string {
  return text == null || text === '' ? '-' : String(text)
}

export function renderSummary(record: AlertEventItem): ReactNode {
  const { summary, description } = record
  return (
    <Tooltip title={emptyPlaceholder(description)}>
      {emptyPlaceholder(summary)}
    </Tooltip>
  )
}

/** 数据源类型 i18n 文案（接口可能返回 string | number） */
export function getTypeLabel(
  value: string | number | undefined,
  t: (key: string) => string,
): string {
  if (value == null || value === '') return '-'
  return t(`datasource.type.${String(value)}`) || String(value)
}

/** 数据源驱动 i18n 文案（接口可能返回 string | number） */
export function getDriverLabel(
  value: string | number | undefined,
  t: (key: string) => string,
): string {
  if (value == null || value === '') return '-'
  return t(`datasource.driver.${String(value)}`) || String(value)
}

/** 告警等级类型 i18n 文案 */
export function getLevelTypeLabel(
  value: string | number | undefined,
  t: (key: string) => string,
): string {
  if (value == null || value === '') return '-'

  return t(`level.type.${String(value)}`)
}

/** 将接口返回的 status（字符串或数字）规范为 GlobalStatus */
export function normalizeStatus(
  status: string | number | undefined,
): GlobalStatus {
  const s = status != null ? String(status) : undefined
  if (s === GlobalStatus.ENABLED) return GlobalStatus.ENABLED
  if (s === GlobalStatus.DISABLED) return GlobalStatus.DISABLED
  return GlobalStatus.UNKNOWN
}

const STATUS_TAG_MAP: Record<GlobalStatus, { textKey: string; color: string }> =
  {
    [GlobalStatus.UNKNOWN]: { textKey: 'table.unknown', color: 'default' },
    [GlobalStatus.ENABLED]: { textKey: 'table.enable', color: 'success' },
    [GlobalStatus.DISABLED]: { textKey: 'table.disable', color: 'error' },
  }

/** 根据 GlobalStatus 取 Tag 的文案 key 与 color */
export function getStatusTagInfo(status: GlobalStatus): {
  textKey: string
  color: string
} {
  return STATUS_TAG_MAP[status] ?? STATUS_TAG_MAP[GlobalStatus.UNKNOWN]
}

/** 渲染状态 Tag（用于表格列或详情描述） */
export function renderStatusTag(
  status: string | number | undefined,
  t: (key: string) => string,
): ReactNode {
  const s = normalizeStatus(status)
  const info = getStatusTagInfo(s)
  return <Tag color={info.color}>{t(info.textKey)}</Tag>
}
