export const keywordList: string[] = ['if', 'else', 'else if', 'end', 'range', 'with']

export const keywordRegExpList: string[] = [
  '{{',
  '}}',
  '\\|',
  '\\(',
  '\\)',
  '\\s+if(?=\\s)',
  '\\s+else(?=\\s)',
  '\\s+else\\s+if(?=\\s)',
  '\\s+end(?=\\s)',
  '\\s+range(?=\\s)',
  '\\s+with(?=\\s)'
]
export const structList: string[] = ['labels', 'value', 'eventAt', 'strategy', 'status', 'annotations', 'level']
export const labelsFieldList: string[] = ['instance', 'endpoint', 'app', '__name__', 'env']
export const strategyFieldList: string[] = [
  'alert',
  'level',
  'expr',
  'duration',
  'count',
  'sustainType',
  'condition',
  'threshold',
  'categories'
]
export const functionList = [
  'now',
  'hasPrefix',
  'hasSuffix',
  'contains',
  'trimSpace',
  'trimPrefix',
  'trimSuffix',
  'toUpper',
  'toLower',
  'replace',
  'split',
  'print',
  'printf',
  'println',
  'not',
  'and',
  'or',
  'eq',
  'ne',
  'lt',
  'le',
  'gt',
  'ge',
  'len'
]

export const functionRegExpList: string[] = [
  '\\s+now(?=\\s)',
  '\\s+hasPrefix(?=\\s)',
  '\\s+hasSuffix(?=\\s)',
  '\\s+contains(?=\\s)',
  '\\s+trimSpace(?=\\s)',
  '\\s+trimPrefix(?=\\s)',
  '\\s+trimSuffix(?=\\s)',
  '\\s+toUpper(?=\\s)',
  '\\s+toLower(?=\\s)',
  '\\s+replace(?=\\s)',
  '\\s+split(?=\\s)',
  '\\s+print(?=\\s)',
  '\\s+printf(?=\\s)',
  '\\s+println(?=\\s)',
  '\\s+not(?=\\s)',
  '\\s+and(?=\\s)',
  '\\s+or(?=\\s)',
  '\\s+eq(?=\\s)',
  '\\s+ne(?=\\s)',
  '\\s+lt(?=\\s)',
  '\\s+le(?=\\s)',
  '\\s+gt(?=\\s)',
  '\\s+ge(?=\\s)',
  '\\s+len(?=\\s)'
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function suggestions(monaco: any, range: any) {
  return [
    {
      label: '{{ .labels }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .labels.${1} }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'labels, 内部为查询数据对应的各种标签， 例如app, env, owner, instance...',
      documentation: 'labels, 内部为查询数据对应的各种标签， 例如app, env, owner, instance...'
    },
    {
      label: '{{ .annotations }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .annotations.${1} }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'annotations, 内部包含summary, description...',
      documentation: 'annotations, 内部包含summary, description...'
    },
    {
      label: '{{ .annotations.summary }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .annotations.summary }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'annotations.summary, 为告警摘要',
      documentation: 'annotations.summary, 为告警摘要'
    },
    {
      label: '{{ .annotations.description }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .annotations.description }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'annotations.description, 为告警描述',
      documentation: 'annotations.description, 为告警描述'
    },
    {
      label: '{{ .strategy }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .strategy.${1} }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'strategy, 为系统策略明细字段， 包含name, expr...',
      documentation: 'strategy, 为系统策略明细字段'
    },
    {
      label: '{{ .strategy.name }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .strategy.name }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'strategy.name, 为系统策略名称',
      documentation: 'strategy.name, 为系统策略名称'
    },
    {
      label: '{{ .strategy.expr }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .strategy.expr }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'strategy.expr, 为系统策略表达式',
      documentation: 'strategy.expr, 为系统策略表达式'
    },
    {
      label: '{{ .value }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .value }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'value, 为告警触发值',
      documentation: 'value, 为告警触发值'
    },
    {
      label: '{{ .status }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .status }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'status, 为告警状态, 包含resolved, firing, pending',
      documentation: 'status, 为告警状态, 包含resolved, firing, pending'
    },
    {
      label: '{{ .startsAt }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .startsAt }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'startsAt, 为告警开始时间',
      documentation: 'startsAt, 为告警开始时间'
    },
    {
      label: '{{ .endsAt }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .endsAt }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'endsAt, 为告警结束时间',
      documentation: 'endsAt, 为告警结束时间'
    },
    {
      label: '{{ .generatorURL }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .generatorURL }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'generatorURL, 为告警生成URL',
      documentation: 'generatorURL, 为告警生成URL'
    },
    {
      label: '{{ .fingerprint }}',
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: '{ .fingerprint }} ${2}',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      detail: 'fingerprint, 为告警指纹',
      documentation: 'fingerprint, 为告警指纹'
    }
  ]
}
