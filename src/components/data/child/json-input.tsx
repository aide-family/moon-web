import React, { useContext } from 'react'
import { useRef, useState, useEffect } from 'react'

import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { GlobalToken, theme } from 'antd'
import './userWorker'

import './style.css'
import { defaultTheme } from './color'
import { GlobalContext, ThemeType } from '@/utils/context'

export interface JsonInputEditorProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  width?: number | string
  height?: number | string
}

const { useToken } = theme

const JsonInput = 'json'
const JsonInputTheme = 'JsonInputTheme'

const provideCompletionItems = () => {
  return {
    suggestions: [],
  }
}

const model = monaco.editor.createModel('', JsonInput)

const init = (token: GlobalToken, theme?: ThemeType) => {
  monaco.languages.setMonarchTokensProvider(JsonInput, {
    tokenizer: {
      root: [[/\{\{[ ]*\.[ ]*[^}]*[ ]*\}\}/, 'keyword']],
    },
    validate: true,
  })

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    // 语法错误提示
    enableSchemaRequest: true,
    schemas: [],
    allowComments: true,
  })

  // Define a new theme that contains only rules that match this language
  monaco.editor.defineTheme(JsonInputTheme, defaultTheme(token, theme))

  monaco.languages.registerCompletionItemProvider(JsonInput, {
    provideCompletionItems: provideCompletionItems,
  })
}

export const JsonInputEditor: React.FC<JsonInputEditorProps> = (props) => {
  const {
    value = props.defaultValue,
    onChange,
    width = '100%',
    height = '100%',
  } = props

  const { token } = useToken()
  const { theme } = useContext(GlobalContext)

  const [editor, setEditor] =
    useState<monaco.editor.IStandaloneCodeEditor | null>(null)
  const monacoEl = useRef(null)

  useEffect(() => {
    setEditor((editor) => {
      if (editor) {
        return editor
      }

      const curr = monacoEl.current!
      const e = monaco.editor.create(curr, {
        model: model,
        theme: JsonInputTheme,
        language: JsonInput,
        value: value,
        // 展示行号和内容的边框
        lineNumbersMinChars: 4,
        minimap: {
          // enabled: false
          size: 'fit',
        },
        // 错误语法校验
        quickSuggestions: {
          other: true,
          comments: true,
          strings: true,
        },
      })
      e.onDidChangeModelContent(() => {
        onChange?.(e.getValue())
      })
      return e
    })
  }, [editor, monacoEl, onChange])

  useEffect(() => {
    if (editor) {
      editor.setValue(value || '')
    }
  }, [editor, value])

  useEffect(() => {
    init(token, theme)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme])

  return (
    <div
      style={{
        width: width,
        height: height,
        borderColor: token.colorBorder,
      }}
      className='editorInput'
      ref={monacoEl}
    />
  )
}
