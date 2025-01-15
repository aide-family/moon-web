import { GlobalContext } from '@/utils/context'
import { validateJson } from '@/utils/json'
import Editor, { Monaco } from '@monaco-editor/react'
import { theme as antTheme } from 'antd'
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { dingTalkJsonSchema } from './config/ding-talk'
import suggestions from './config/suggestions'

export interface DingTemplateEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  height?: string | number
}

const { useToken } = antTheme

const language = 'json'

export const DingTemplateEditor: React.FC<DingTemplateEditorProps> = ({
  value,
  defaultValue,
  onChange,
  height = '40vh'
}) => {
  const { theme } = useContext(GlobalContext)
  const { token } = useToken()
  const editorRef = useRef(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleEditorDidMount = (editor: any, monaco: Monaco) => {
    editorRef.current = editor

    // 自定义编辑器主题
    monaco.editor.defineTheme('dingTalkTheme', {
      base: theme === 'dark' ? 'vs-dark' : 'vs',
      inherit: true,
      rules: [],
      colors: {
        'editor.background': token.colorBgContainer,
        'scrollbarSlider.background': token.colorPrimary,
        'scrollbarSlider.hoverBackground': token.colorPrimary,
        'scrollbarSlider.activeBackground': token.colorPrimary
      }
    })

    // 设置主题
    monaco.editor.setTheme('dingTalkTheme')

    // 注册JSON Schema
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://myserver/dingTalk-schema.json',
          fileMatch: ['*'],
          schema: dingTalkJsonSchema
        }
      ],
      enableSchemaRequest: false
    })

    // 注册环境变量自动完成
    monaco.languages.registerCompletionItemProvider(language, {
      triggerCharacters: ['.', '{', '$'],
      provideCompletionItems: (model, position) => {
        const word = model.getWordUntilPosition(position)
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }

        const lineContent = model.getLineContent(position.lineNumber)

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

        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        })

        if (!isInString) {
          return { suggestions: [] }
        }

        // 检查是否在 {{ 后面
        if (textUntilPosition.endsWith('{{')) {
          return {
            suggestions: [
              {
                label: '{{ .... }}',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: ' .${1:value} }}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                range: range,
                detail: '环境变量 (.value)',
                documentation: '插入环境变量占位符，使用 .value 格式'
              }
            ]
          }
        }

        return {
          suggestions: suggestions(monaco, range)
        }
      }
    })
  }

  const [validate, setValidate] = useState({ isValid: true, error: '' })

  const handleValidate = useCallback(() => {
    if (!value) {
      setValidate({ isValid: true, error: '' })
      return
    }
    const { isValid, error } = validateJson(value || '')
    setValidate({ isValid, error: error || '' })
  }, [value])

  useEffect(() => {
    handleValidate()
  }, [handleValidate])

  return (
    <div className='group rounded-lg overflow-hidden transition-all duration-200'>
      <div
        className={`border border-gray-700 transition-colors duration-200 rounded-lg overflow-hidden ${
          !validate.isValid ? 'border-red-500' : 'hover:border-purple-600 focus-within:border-purple-600'
        }`}
      >
        <Editor
          height={height}
          defaultLanguage={language}
          value={value}
          defaultValue={defaultValue}
          onChange={(value) => onChange?.(value || '')}
          onMount={handleEditorDidMount}
          options={{
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: true },
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 4,
              horizontalScrollbarSize: 4
            },
            padding: { top: 16, bottom: 16 },
            snippetSuggestions: 'top',
            suggestOnTriggerCharacters: true,
            wordBasedSuggestions: 'off',
            renderLineHighlight: 'all',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on'
          }}
        />
      </div>
      <div className='flex justify-start'>
        {!validate.isValid && <div className='text-red-500'>{validate.error}</div>}
      </div>
    </div>
  )
}
