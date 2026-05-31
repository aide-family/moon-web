import type { TemplateItem } from '@/api/rabbit/template'
import { MessageType } from '@/api/common/types'

const TEMPLATE_ACTION_RE = /\{\{-?([\s\S]*?)-?\}\}/g
const FIELD_PATH_RE =
  /(?:^|[\s|(])(\.[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)/g
const RANGE_FIELD_RE =
  /\brange\s+(\.[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)*)/g

function isWebhookMessageType(messageType?: MessageType | string): boolean {
  if (!messageType) return false
  const value = String(messageType)
  return value.startsWith('WEBHOOK_')
}

function collectStringsFromValue(value: unknown, strings: string[]): void {
  if (typeof value === 'string') {
    strings.push(value)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item) => collectStringsFromValue(item, strings))
    return
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectStringsFromValue(item, strings))
  }
}

/** 从模板定义 JSON 中收集所有可能包含 Go template 的字符串 */
export function collectTemplateDefinitionStrings(
  messageType: MessageType | string | undefined,
  jsonData: string,
): string[] {
  const raw = jsonData.trim()
  if (!raw) return []

  if (isWebhookMessageType(messageType)) {
    return [raw]
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    const strings: string[] = []
    collectStringsFromValue(parsed, strings)
    return strings
  } catch {
    return [raw]
  }
}

function normalizeFieldPath(pathWithDot: string): string {
  return pathWithDot.startsWith('.') ? pathWithDot.slice(1) : pathWithDot
}

/** 从 Go text/template 字符串中提取根字段路径（如 AlertName、User.Email） */
export function extractGoTemplateFieldPaths(template: string): {
  paths: string[]
  rangePaths: Set<string>
} {
  const paths = new Set<string>()
  const rangePaths = new Set<string>()

  for (const match of template.matchAll(TEMPLATE_ACTION_RE)) {
    const action = match[1] ?? ''

    for (const rangeMatch of action.matchAll(RANGE_FIELD_RE)) {
      const path = normalizeFieldPath(rangeMatch[1] ?? '')
      if (path) rangePaths.add(path)
    }

    for (const fieldMatch of action.matchAll(FIELD_PATH_RE)) {
      const path = normalizeFieldPath(fieldMatch[1] ?? '')
      if (path) paths.add(path)
    }
  }

  return {
    paths: [...paths].sort(),
    rangePaths,
  }
}

function isRangePath(path: string, rangePaths: Set<string>): boolean {
  if (rangePaths.has(path)) return true
  return [...rangePaths].some(
    (rangePath) => path === rangePath || path.startsWith(`${rangePath}.`),
  )
}

function setNestedValue(
  root: Record<string, unknown>,
  parts: string[],
  value: unknown,
  rangePaths: Set<string>,
): void {
  let current: Record<string, unknown> = root

  for (let i = 0; i < parts.length; i++) {
    const key = parts[i]
    const isLast = i === parts.length - 1
    const pathSoFar = parts.slice(0, i + 1).join('.')

    if (isLast) {
      if (key in current) return
      current[key] = isRangePath(pathSoFar, rangePaths) ? [] : value
      return
    }

    const existing = current[key]
    if (
      existing == null ||
      typeof existing !== 'object' ||
      Array.isArray(existing)
    ) {
      current[key] = {}
    }
    current = current[key] as Record<string, unknown>
  }
}

/** 根据 Go template 变量路径生成 JSON 骨架（叶子默认为空字符串，range 字段为 []） */
export function buildJsonSkeletonFromFieldPaths(
  paths: string[],
  rangePaths: Set<string> = new Set(),
): Record<string, unknown> {
  const root: Record<string, unknown> = {}

  for (const path of paths) {
    if (!path) continue
    setNestedValue(root, path.split('.'), '', rangePaths)
  }

  return root
}

/** 解析模板详情，生成发送时使用的模板数据 JSON 字符串 */
export function buildTemplateDataJsonFromDetail(
  template: Pick<TemplateItem, 'messageType' | 'jsonData'>,
): string {
  const strings = collectTemplateDefinitionStrings(
    template.messageType,
    template.jsonData ?? '',
  )

  const allPaths = new Set<string>()
  const allRangePaths = new Set<string>()

  for (const text of strings) {
    const { paths, rangePaths } = extractGoTemplateFieldPaths(text)
    paths.forEach((path) => allPaths.add(path))
    rangePaths.forEach((path) => allRangePaths.add(path))
  }

  const skeleton = buildJsonSkeletonFromFieldPaths(
    [...allPaths].sort(),
    allRangePaths,
  )
  return JSON.stringify(skeleton, null, 2)
}
