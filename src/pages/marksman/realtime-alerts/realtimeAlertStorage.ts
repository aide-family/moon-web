import type { AlertPageItem } from '@/api/marksman/alert'

const STORAGE_KEY_PREFIX = 'marksman:realtime-alert:active-alert-page'

export function getActiveAlertPageStorageKey(namespaceUid: string): string {
  const ns = namespaceUid.trim()
  return ns ? `${STORAGE_KEY_PREFIX}:${ns}` : STORAGE_KEY_PREFIX
}

export function readStoredActiveAlertPageUid(
  namespaceUid: string,
): string | undefined {
  if (typeof window === 'undefined') return undefined
  const stored = localStorage.getItem(getActiveAlertPageStorageKey(namespaceUid))
  const trimmed = stored?.trim()
  return trimmed ? trimmed : undefined
}

export function writeStoredActiveAlertPageUid(
  namespaceUid: string,
  alertPageUid: string,
): void {
  if (typeof window === 'undefined') return
  const uid = alertPageUid.trim()
  if (!uid) return
  localStorage.setItem(getActiveAlertPageStorageKey(namespaceUid), uid)
}

/** 按 sortOrder 降序（数值越大优先级越高），同序按名称 */
export function compareAlertPagePriority(
  a: AlertPageItem,
  b: AlertPageItem,
): number {
  const ao = Number.isFinite(Number(a.sortOrder))
    ? Number(a.sortOrder)
    : Number.NEGATIVE_INFINITY
  const bo = Number.isFinite(Number(b.sortOrder))
    ? Number(b.sortOrder)
    : Number.NEGATIVE_INFINITY
  if (ao !== bo) return bo - ao
  return (a.name ?? '').localeCompare(b.name ?? '', undefined, {
    numeric: true,
  })
}

export function pickHighestPriorityAlertPageUid(
  pages: AlertPageItem[],
): string | undefined {
  const sorted = [...pages].filter((p) => Boolean(p.uid))
  sorted.sort(compareAlertPagePriority)
  return sorted[0]?.uid
}

export function resolveActiveAlertPageUid(
  pages: AlertPageItem[],
  options?: {
    preferredUid?: string
    storedUid?: string
  },
): string | undefined {
  if (pages.length === 0) return undefined
  const valid = new Set(
    pages.map((p) => p.uid).filter((uid): uid is string => Boolean(uid)),
  )
  const preferred = options?.preferredUid?.trim()
  if (preferred && valid.has(preferred)) return preferred
  const stored = options?.storedUid?.trim()
  if (stored && valid.has(stored)) return stored
  return pickHighestPriorityAlertPageUid(pages)
}
