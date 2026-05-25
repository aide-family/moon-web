/**
 * 列表页搜索条件与 URL query 同步
 * - 表格上方搜索条件变化即同步到 URL（replace 模式，不堆历史记录）
 * - 进入页面或浏览器前进/后退时从 URL 恢复条件
 */

import type { SetURLSearchParams } from 'react-router-dom'

/** 将当前搜索条件序列化为 URL 参数（只包含有值的字段） */
export function searchParamsToRecord(
  params: Record<string, string | number | undefined>,
): Record<string, string> {
  const record: Record<string, string> = {}
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      record[key] = String(value).trim()
    }
  }
  return record
}

/** 将当前搜索条件同步到 URL（通常用 replace: true 避免每次输入都产生一条历史） */
export function applySearchToUrl(
  setUrlSearchParams: SetURLSearchParams,
  currentParams: Record<string, string | number | undefined>,
  options?: { replace?: boolean },
) {
  const record = searchParamsToRecord(currentParams)
  setUrlSearchParams(record, options)
}

/** 从 URLSearchParams 读取字符串（空则返回 undefined） */
export function getParam(
  params: URLSearchParams,
  key: string,
): string | undefined {
  const v = params.get(key)
  return v === null || v === '' ? undefined : v
}
