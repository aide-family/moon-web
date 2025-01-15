import { Editor, type Monaco } from '@monaco-editor/react'
import { Form, Input, theme } from 'antd'
import type { editor as editorNameSpace } from 'monaco-editor'
import type { languages, Position } from 'monaco-editor/esm/vs/editor/editor.api'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'
import {
  functionList,
  functionRegExpList,
  keywordList,
  keywordRegExpList,
  labelsFieldList,
  strategyFieldList,
  structList
} from './config/suggestions'
import './style.css'

const { useToken } = theme

export interface AnnotationsEditorProps {
  onChange?: (value?: string) => void
  value?: string
  language?: string
  height?: number | string
  disabled?: boolean
  labels?: string[]
}

export const AnnotationsEditor: React.FC<AnnotationsEditorProps> = (props) => {
  const { onChange, value, language = 'gotemplate', height = 32 * 3, disabled, labels = labelsFieldList } = props
  // const { theme } = useContext(GlobalContext)
  const { token } = useToken()

  const [code, setCode] = useState('')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any>(null)

  const handleEditorDidMount = (editor: editorNameSpace.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco

    monaco.editor.defineTheme('annotationTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'struct', foreground: '#E708C2' },
        { token: 'field', foreground: '#FF8216' },
        { token: 'function', foreground: token.colorPrimary },
        { token: 'keyword', foreground: token.colorSuccess },
        { token: 'variable', foreground: token.colorError }
      ],
      colors: {
        'editor.foreground': token.colorWarning,
        'editor.background': token.colorBgContainer,
        'editorCursor.foreground': token.colorErrorActive,
        'editor.lineHighlightBackground': token.colorBgContainer,
        'scrollbarSlider.background': token.colorPrimary,
        'scrollbarSlider.hoverBackground': token.colorPrimary,
        'scrollbarSlider.activeBackground': token.colorPrimary
      }
    })
    // 使用主题
    monaco.editor.setTheme('annotationTheme')
    monaco.languages.register({ id: language })

    monaco.languages.setMonarchTokensProvider(language, {
      // 设置语法规则
      // 通过rules关键字来设置自定义颜色名词： struct, keyword 、、、
      tokenizer: {
        root: [
          [new RegExp(`(${structList.join('|')})`), 'struct'],
          [new RegExp(`(${keywordRegExpList.join('|')})`), 'keyword'],
          [new RegExp(`(${labels.join('|')})`), 'field'],
          [new RegExp(`(${strategyFieldList.join('|')})`), 'field'],
          [new RegExp(`(${functionRegExpList.join('|')})`), 'function'],
          [/\s+\$[a-zA-Z0-9_]+(?=\s)/g, 'variable']
        ]
      }
    })

    // monaco.editor.setTheme('annotationTheme')
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (
        model: editorNameSpace.ITextModel,
        position: Position
      ): languages.ProviderResult<languages.CompletionList> => {
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        }
        const textUntilPosition = model.getValueInRange(range)

        // 去除textUntilPosition的换行前的keyword
        const word = model.getWordUntilPosition(position)

        const newRang = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        }
        // console.log('newtextUntilPosition', newtextUntilPosition)
        // console.log('textUntilPosition', textUntilPosition)
        // console.log('word', word)
        // 判断word前是空格还是.
        const startColumn = word.startColumn - 2
        const firstCh = textUntilPosition[startColumn]
        // console.log('firstCh', firstCh)
        // 获取textUntilPosition startColumn前的字符串
        const preText = textUntilPosition.substring(0, startColumn)
        switch (firstCh) {
          case '.':
            // console.log('preText', preText)
            if (preText.endsWith('labels')) {
              return {
                suggestions: labels.map((item) => ({
                  label: item,
                  kind: monacoRef?.current.languages.CompletionItemKind.Field,
                  insertText: item,
                  range: newRang
                }))
              }
            }
            if (preText.endsWith('strategy')) {
              return {
                suggestions: strategyFieldList.map((item) => ({
                  label: item,
                  kind: monacoRef?.current.languages.CompletionItemKind.Field,
                  insertText: item,
                  range: newRang
                }))
              }
            }
            return {
              suggestions: structList.map((item) => ({
                label: item,
                kind: monacoRef?.current.languages.CompletionItemKind.Struct,
                insertText: item,
                range: newRang
              }))
            }
          case ' ':
            return {
              suggestions: [
                ...functionList.map((item) => ({
                  label: item,
                  kind: monacoRef?.current.languages.CompletionItemKind.Function,
                  insertText: item,
                  range: newRang
                })),
                ...keywordList.map((item) => ({
                  label: item,
                  kind: monacoRef?.current.languages.CompletionItemKind.Keyword,
                  insertText: item,
                  range: newRang
                }))
              ]
            }
        }

        return {
          suggestions: []
        }
      }
    })

    editor.onDidChangeModelContent(() => {
      const position = editor.getPosition()
      const model = editor.getModel()
      if (!model) return
      if (!position) return
      const text = model?.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: Math.max(1, position.column - 8),
        endLineNumber: position.lineNumber,
        endColumn: position.column
      })
      // console.log('text', text)
      if (text.endsWith('{{')) {
        editor.executeEdits('', [
          {
            range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: '  }}',
            forceMoveMarkers: true
          }
        ])

        editor.setPosition({
          lineNumber: position.lineNumber,
          column: position.column + 1
        })
      }
    })
  }

  const { status } = Form.Item.useStatus()

  useEffect(() => {
    setCode(value as string)
  }, [value])

  return (
    <>
      {disabled ? (
        <Input.TextArea value={value} disabled minLength={1} />
      ) : (
        <Editor
          className={`editorInput input-border ${status}`}
          height={height}
          language={language}
          line={11}
          value={code}
          onChange={onChange}
          onMount={handleEditorDidMount}
          // 设置style
          options={{
            minimap: {
              enabled: true,
              showSlider: 'mouseover'
            },
            'semanticHighlighting.enabled': true,
            scrollbar: {
              horizontalScrollbarSize: 12,
              verticalScrollbarSize: 4
            },
            overviewRulerBorder: false,
            fontSize: 14,
            fontFamily: 'Monaco, Consolas, "Courier New", monospace'
          }}
        />
      )}
    </>
  )
}
