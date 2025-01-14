import { GlobalContext } from '@/utils/context'
import Editor, { Monaco } from '@monaco-editor/react'
import React, { useContext, useRef } from 'react'
import { feishuJsonSchema } from './config/feishu'

export interface FeishuTemplateEditorProps {
  value?: string
  onChange?: (value: string) => void
}

export const FeishuTemplateEditor: React.FC<FeishuTemplateEditorProps> = ({ value, onChange }) => {
  const { theme } = useContext(GlobalContext)
  const editorRef = useRef(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor

    // 注册JSON Schema
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://myserver/feishu-schema.json',
          fileMatch: ['*'],
          schema: feishuJsonSchema
        }
      ],
      enableSchemaRequest: false
    })

    // 注册环境变量自动完成
    monaco.languages.registerCompletionItemProvider('json', {
      triggerCharacters: ['$', '{'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        // 获取当前行的完整内容
        const lineContent = model.getLineContent(position.lineNumber)

        // 检查光标是否在字符串内
        const isInString = (() => {
          let inString = false
          let quoteChar = ''
          for (let i = 0; i < position.column - 1; i++) {
            const char = lineContent[i]
            if ((char === '"' || char === "'") && (i === 0 || lineContent[i - 1] !== '\\')) {
              if (!inString) {
                inString = true
                quoteChar = char
              } else if (char === quoteChar) {
                inString = false
              }
            }
          }
          return inString
        })()

        // 获取当前位置之前的文本
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })

        // 只在字符串内提供环境变量提示
        if (!isInString) {
          return { suggestions: [] }
        }

        if (textUntilPosition.endsWith('$')) {
          return {
            suggestions: [
              {
                label: '${...}',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '${$1}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
                detail: '环境变量',
                documentation: '插入环境变量占位符'
              }
            ]
          }
        }

        // 检查是否在 ${ 后面
        const envVarMatch = textUntilPosition.match(/\${([^}]*)$/)
        if (envVarMatch) {
          const envVars = [
            'WEBHOOK_URL',
            'API_KEY',
            'BOT_NAME',
            'ENVIRONMENT',
            'APP_ID',
            'APP_SECRET',
            'MESSAGE_TEMPLATE',
            'USER_ID',
            'CHANNEL_ID',
            'GROUP_ID'
          ]

          const typed = envVarMatch[1]
          const filteredVars = envVars.filter((v) => v.toLowerCase().includes(typed.toLowerCase()))

          return {
            suggestions: filteredVars.map((envVar) => ({
              label: envVar,
              kind: monaco.languages.CompletionItemKind.Variable,
              insertText: envVar + '}',
              range: {
                startLineNumber: position.lineNumber,
                endLineNumber: position.lineNumber,
                startColumn: position.column - typed.length,
                endColumn: position.column
              },
              detail: '环境变量',
              documentation: `插入 ${envVar} 环境变量`
            }))
          }
        }

        return { suggestions: [] }
      }
    })
  }

  return (
    <Editor
      height='30vh'
      defaultLanguage='json'
      value={value}
      onChange={(value) => onChange?.(value || '')}
      onMount={handleEditorDidMount}
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        lineNumbersMinChars: 4,
        roundedSelection: false,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        theme: theme === 'dark' ? 'vs-dark' : 'light',
        snippetSuggestions: 'top',
        suggestOnTriggerCharacters: true,
        wordBasedSuggestions: 'off'
      }}
    />
  )
}
