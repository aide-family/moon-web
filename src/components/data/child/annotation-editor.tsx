import { Editor, Monaco } from '@monaco-editor/react'
import React, { useEffect, useRef, useState } from 'react'
import { editor as editorNameSpace } from 'monaco-editor'
import { Position } from 'monaco-editor/esm/vs/editor/editor.api'
import type { languages } from 'monaco-editor/esm/vs/editor/editor.api'
import { Form, Input } from 'antd'
import './style.css'

export interface AnnotationsEditorProps {
  onChange?: (value?: string) => void
  value?: string
  language: string
  height?: number | string
  disabled?: boolean
}

const structList = ['labels', 'value', 'alert', 'level', 'timestamp']
const defaultFieldList = ['instance', 'endpoint', 'app']
const functionList = [
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
]

export const AnnotationsEditor: React.FC<AnnotationsEditorProps> = (props) => {
  const {
    onChange,
    value,
    language = 'gotemplate',
    height = 32 * 3,
    disabled,
  } = props

  const [code, setCode] = useState('')
  const [fieldList] = useState<string[]>(defaultFieldList)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const editorRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monacoRef = useRef<any>(null)

  const handleEditorDidMount = (
    editor: editorNameSpace.IStandaloneCodeEditor,
    monaco: Monaco
  ) => {
    editorRef.current = editor
    monacoRef.current = monaco

    monaco.editor.defineTheme('myTheme', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'struct', foreground: '#E708C2' },
        { token: 'field', foreground: '#FF8216' },
        { token: 'function', foreground: '#1677FF' },
      ],
      colors: {
        'editor.foreground': '#000000',
      },
    })
    // 使用主题
    monaco.editor.setTheme('myTheme')
    monaco.languages.register({ id: language })

    monaco.languages.setMonarchTokensProvider(language, {
      tokenizer: {
        root: [
          [new RegExp(`(${structList.join('|')})`), 'struct'],
          [/{{/, 'keyword'],
          [/}}/, 'keyword'],
          [new RegExp(`(${fieldList.join('|')})`), 'field'],
          [new RegExp(`(${functionList.join('|')})`), 'function'],
        ],
      },
    })

    // monaco.editor.setTheme('myTheme')
    monaco.languages.registerCompletionItemProvider(language, {
      provideCompletionItems: (
        model: editorNameSpace.ITextModel,
        position: Position
      ): languages.ProviderResult<languages.CompletionList> => {
        const range = {
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column,
        }
        const textUntilPosition = model.getValueInRange(range)

        // 去除textUntilPosition的换行前的keyword
        const word = model.getWordUntilPosition(position)

        const newRang = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
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
                suggestions: fieldList.map((item) => ({
                  label: item,
                  kind: monacoRef?.current.languages.CompletionItemKind.Field,
                  insertText: item,
                  range: newRang,
                })),
              }
            }
            return {
              suggestions: structList.map((item) => ({
                label: item,
                kind: monacoRef?.current.languages.CompletionItemKind.Struct,
                insertText: item,
                range: newRang,
              })),
            }
          case ' ':
            return {
              suggestions: [
                ...functionList.map((item) => ({
                  label: item,
                  kind: monacoRef?.current.languages.CompletionItemKind
                    .Function,
                  insertText: item,
                  range: newRang,
                })),
              ],
            }
        }

        return {
          suggestions: [],
        }
      },
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
        endColumn: position.column,
      })
      console.log('text', text)
      if (text.endsWith('{{')) {
        editor.executeEdits('', [
          {
            range: new monaco.Range(
              position.lineNumber,
              position.column,
              position.lineNumber,
              position.column
            ),
            text: '  }}',
            forceMoveMarkers: true,
          },
        ])

        editor.setPosition({
          lineNumber: position.lineNumber,
          column: position.column + 1,
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
          className={`editorInput ${status}`}
          height={height}
          language={language}
          line={11}
          value={code}
          onChange={(value) => {
            onChange?.(value)
          }}
          onMount={handleEditorDidMount}
          // 设置style
          options={{
            minimap: {
              enabled: false,
            },
            overviewRulerBorder: false,
            fontSize: 14,
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
          }}
        />
      )}
    </>
  )
}
