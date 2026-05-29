import type { HistoryAlertExportTaskEvent } from '@/api/marksman/alert'

export interface SubscribeSSEOptions {
  onEvent: (event: HistoryAlertExportTaskEvent) => void
  onError?: (error: unknown) => void
}

function getAuthHeaders(): Record<string, string> {
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token') || ''
  const namespace = localStorage.getItem('namespace') || ''
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
  }
  if (token) headers.Authorization = `Bearer ${token}`
  if (namespace) headers['X-Namespace'] = namespace
  return headers
}

function parseSSEBlock(block: string): { event: string; data: string } | null {
  const lines = block.split('\n')
  let event = 'message'
  const dataLines: string[] = []
  for (const line of lines) {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim()
    } else if (line.startsWith('data:')) {
      dataLines.push(line.slice(5).trim())
    }
  }
  if (dataLines.length === 0) return null
  return { event, data: dataLines.join('\n') }
}

const SSE_RECONNECT_DELAY_MS = 3000

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/** Subscribe export-task SSE with fetch (supports Authorization header). */
export function subscribeHistoryAlertExportEvents(
  options: SubscribeSSEOptions,
): () => void {
  const controller = new AbortController()
  let closed = false

  const run = async () => {
    while (!closed) {
      try {
        const response = await fetch(
          '/v1/alert/history-alerts/export-tasks/events',
          {
            headers: getAuthHeaders(),
            signal: controller.signal,
          },
        )
        if (!response.ok || !response.body) {
          throw new Error(`SSE connect failed: ${response.status}`)
        }
        const reader = response.body.getReader()
        const decoder = new TextDecoder()
        let buffer = ''
        while (!closed) {
          const { done, value } = await reader.read()
          if (done) break
          buffer += decoder.decode(value, { stream: true })
          const parts = buffer.split('\n\n')
          buffer = parts.pop() ?? ''
          for (const part of parts) {
            const parsed = parseSSEBlock(part.trim())
            if (
              !parsed ||
              parsed.event === 'ping' ||
              parsed.event === 'connected'
            ) {
              continue
            }
            if (parsed.event === 'export-task') {
              try {
                options.onEvent(
                  JSON.parse(parsed.data) as HistoryAlertExportTaskEvent,
                )
              } catch (error) {
                options.onError?.(error)
              }
            }
          }
        }
      } catch (error) {
        if (closed || isAbortError(error)) return
        options.onError?.(error)
      }
      if (closed) return
      await new Promise((resolve) =>
        setTimeout(resolve, SSE_RECONNECT_DELAY_MS),
      )
    }
  }

  void run()

  return () => {
    closed = true
    controller.abort()
  }
}
