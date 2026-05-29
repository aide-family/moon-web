import {
  prometheusLabelValues,
  prometheusLabels,
  prometheusMetricNames,
} from '@/api/marksman/metricQuery/index'
import type { PrometheusApiResponse } from '@/api/marksman/metricQuery/types'
import { promLanguageDefinition } from 'monaco-promql'
import type { Monaco } from '@monaco-editor/react'

let promqlLanguageReady = false

function parseStringList(response: PrometheusApiResponse): string[] {
  if (response.status !== 'success' || !Array.isArray(response.data)) {
    return []
  }
  return response.data.filter((item): item is string => typeof item === 'string')
}

/** 注册 PromQL 语法高亮与关键字补全（monaco-promql） */
export function setupPromqlLanguage(monaco: Monaco): void {
  if (promqlLanguageReady) return

  const languageId = promLanguageDefinition.id
  monaco.languages.register(promLanguageDefinition)
  monaco.languages.onLanguage(languageId, () => {
    void promLanguageDefinition.loader().then((mod) => {
      monaco.languages.setMonarchTokensProvider(languageId, mod.language)
      monaco.languages.setLanguageConfiguration(
        languageId,
        mod.languageConfiguration,
      )
      monaco.languages.registerCompletionItemProvider(
        languageId,
        mod.completionItemProvider,
      )
    })
  })

  promqlLanguageReady = true
}

type CompletionCache = {
  metrics: string[] | null
  labels: string[] | null
  labelValues: Map<string, string[]>
}

/**
 * 注册基于数据源的指标名 / 标签名 / 标签值补全
 * 返回 disposable，组件卸载时调用 dispose
 */
export function registerPromqlDataCompletion(
  monaco: Monaco,
  uid: string,
): { dispose: () => void } {
  const cache: CompletionCache = {
    metrics: null,
    labels: null,
    labelValues: new Map(),
  }

  const disposable = monaco.languages.registerCompletionItemProvider('promql', {
    triggerCharacters: ['{', '"', ',', '='],
    provideCompletionItems: async (
      model: Monaco['editor']['ITextModel'],
      position: Monaco['Position'],
    ) => {
      const lineContent = model.getLineContent(position.lineNumber)
      const textBeforeCursor = lineContent.slice(0, position.column - 1)

      const labelValueMatch = textBeforeCursor.match(
        /([a-zA-Z_]\w*)\s*(=~?|!~?)\s*"([^"]*)$/,
      )
      if (labelValueMatch) {
        const [, labelName, , prefix] = labelValueMatch
        if (!cache.labelValues.has(labelName)) {
          const res = await prometheusLabelValues(uid, labelName)
          cache.labelValues.set(labelName, parseStringList(res))
        }
        const values = cache.labelValues.get(labelName) ?? []
        return {
          suggestions: values
            .filter((v) => v.startsWith(prefix))
            .slice(0, 100)
            .map((value) => ({
              label: value,
              kind: monaco.languages.CompletionItemKind.Value,
              insertText: value,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column - prefix.length,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            })),
        }
      }

      const inLabelMatcher = /\{[^}]*$/.test(textBeforeCursor)
      if (inLabelMatcher) {
        if (!cache.labels) {
          const res = await prometheusLabels(uid)
          cache.labels = parseStringList(res).filter((l) => l !== '__name__')
        }
        const labelPrefix =
          textBeforeCursor.match(/[,{]\s*([a-zA-Z_]\w*)$/)?.[1] ?? ''
        return {
          suggestions: (cache.labels ?? [])
            .filter((label) => label.startsWith(labelPrefix))
            .slice(0, 100)
            .map((label) => ({
              label,
              kind: monaco.languages.CompletionItemKind.Field,
              insertText: label,
              range: {
                startLineNumber: position.lineNumber,
                startColumn: position.column - labelPrefix.length,
                endLineNumber: position.lineNumber,
                endColumn: position.column,
              },
            })),
        }
      }

      if (!cache.metrics) {
        const res = await prometheusMetricNames(uid)
        cache.metrics = parseStringList(res)
      }

      const metricPrefix =
        textBeforeCursor.match(/(?:^|[\s+\-*/%<>!&|,({])([a-zA-Z_:]\w*)$/)?.[1] ??
        ''

      return {
        suggestions: (cache.metrics ?? [])
          .filter((metric) => metric.startsWith(metricPrefix))
          .slice(0, 100)
          .map((metric) => ({
            label: metric,
            kind: monaco.languages.CompletionItemKind.Function,
            insertText: metric,
            detail: 'metric',
            range: {
              startLineNumber: position.lineNumber,
              startColumn: position.column - metricPrefix.length,
              endLineNumber: position.lineNumber,
              endColumn: position.column,
            },
          })),
      }
    },
  })

  return { dispose: () => disposable.dispose() }
}
