import { GlobalContext } from '@/utils/context'
import Editor, { Monaco } from '@monaco-editor/react'
import { theme as antTheme } from 'antd'
import React, { useContext, useRef } from 'react'
import suggestions from './config/suggestions'

export interface EmailTemplateEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  height?: string | number
}

const { useToken } = antTheme

const language = 'html'

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
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
    monaco.editor.defineTheme('emailTheme', {
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
    monaco.editor.setTheme('emailTheme')

    // 注册HTML格式化
    monaco.languages.html.htmlDefaults.setOptions({
      format: {
        wrapLineLength: 120,
        wrapAttributes: 'auto',
        insertSpaces: true,
        indentInnerHtml: true,
        preserveNewLines: true,
        maxPreserveNewLines: 10,
        indentHandlebars: true,
        endWithNewline: true,
        extraLiners: '',
        tabSize: 2,
        unformatted:
          'a,abbr,acronym,address,b,big,blockquote,br,caption,cite,code,col,colgroup,dd,del,dfn,div,dl,dt,em,font,h1,h2,h3,h4,h5,h6,hr,i,img,ins,kbd,label,legend,li,map,ol,p,pre,q,s,samp,small,span,strike,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,tt,u,ul,var',
        contentUnformatted:
          'a,abbr,acronym,address,b,big,blockquote,br,caption,cite,code,col,colgroup,dd,del,dfn,div,dl,dt,em,font,h1,h2,h3,h4,h5,h6,hr,i,img,ins,kbd,label,legend,li,map,ol,p,pre,q,s,samp,small,span,strike,strong,sub,sup,table,tbody,td,tfoot,th,thead,tr,tt,u,ul,var'
      },
      // 自动补全 html后面的部分
      suggest: {
        html: true,
        'html-attribute-value': true
      }
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

  return (
    <div className='group rounded-lg overflow-hidden transition-all duration-200'>
      <div
        className={`border border-gray-700 transition-colors duration-200 rounded-lg overflow-hidden 'hover:border-purple-600 focus-within:border-purple-600`}
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
    </div>
  )
}
