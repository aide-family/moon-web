/* eslint-disable @typescript-eslint/no-explicit-any */
import React, {
  MutableRefObject,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  EditorView,
  highlightSpecialChars,
  keymap,
  placeholder as placeholderPlugin,
  ViewUpdate,
} from '@codemirror/view'
import { Compartment, EditorState, Prec } from '@codemirror/state'
import {
  bracketMatching,
  indentOnInput,
  syntaxHighlighting,
} from '@codemirror/language'
import {
  defaultKeymap,
  history,
  historyKeymap,
  insertNewlineAndIndent,
} from '@codemirror/commands'

import { highlightSelectionMatches } from '@codemirror/search'
import { lintKeymap } from '@codemirror/lint'
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  completionKeymap,
} from '@codemirror/autocomplete'
import { PromQLExtension } from '@prometheus-io/codemirror-promql'
import { newCompleteStrategy } from '@prometheus-io/codemirror-promql/dist/esm/complete'
import {
  baseTheme,
  darkPromqlHighlighter,
  darkTheme,
  lightTheme,
  promqlHighlighter,
} from './prom/CMTheme'
import { HistoryCompleteStrategy } from './prom/HistoryCompleteStrategy'
import { Button, InputProps, theme } from 'antd'

import { ThunderboltOutlined } from '@ant-design/icons'

import type { ValidateStatus } from 'antd/es/form/FormItem'

import styles from './prom/index.module.scss'
import { GlobalContext } from '@/utils/context'

export type PromValidate = {
  help?: string
  validateStatus?: ValidateStatus
}

export interface PromQLInputProps extends InputProps {
  pathPrefix: string
  formatExpression?: boolean
  ref?: MutableRefObject<any>
  buttonRef?: MutableRefObject<any>
  showBorder?: boolean
}

const promqlExtension = new PromQLExtension()
const dynamicConfigCompartment = new Compartment()
const { useToken } = theme

const buildPathPrefix = (s?: string) => {
  if (!s) {
    return ''
  }
  // 去除末尾/
  const promPathPrefix = s?.replace(/\/$/, '')
  return promPathPrefix
}

export const formatExpressionFunc = (pathPrefix: string, doc?: string) => {
  const prefix = buildPathPrefix(pathPrefix)
  if (!doc || !prefix || prefix === '') {
    return Promise.reject('empty expression')
  }
  return fetch(
    `${prefix}/api/v1/query?${new URLSearchParams({
      query: doc || '',
    })}`,
    {
      cache: 'no-store',
      credentials: 'same-origin',
    }
  )
    .then((resp) => {
      if (!resp.ok && resp.status !== 400) {
        return Promise.reject(`format HTTP request failed: ${resp.statusText}`)
      }

      return resp.json()
    })
    .then(
      (json: {
        data: string
        status: 'success' | 'error'
        error: string
        errorType: string
      }) => {
        if (json.status !== 'success') {
          return Promise.reject(json.error || 'invalid response JSON')
        }
        return json
      }
    )
    .catch((err) => {
      return Promise.reject(err.toString())
    })
}

const PromQLInput: React.FC<PromQLInputProps> = (props) => {
  const { token } = useToken()
  const {
    pathPrefix,
    onChange,
    formatExpression,
    placeholder = '请输入查询语句',
    value,
    defaultValue,
    ref,
    buttonRef,
    disabled,
    showBorder = true,
  } = props

  const prefix = buildPathPrefix(pathPrefix)

  const { theme } = useContext(GlobalContext)
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const [doc, setDoc] = useState<any>(value || defaultValue)
  const onExpressionChange = (expression: string) => {
    setDoc(expression)
  }

  useEffect(() => {
    promqlExtension.activateCompletion(true).activateLinter(true)
    promqlExtension.setComplete({
      completeStrategy: new HistoryCompleteStrategy(
        newCompleteStrategy({
          remote: {
            url: prefix,
          },
        }),
        []
      ),
    })

    let highlighter = syntaxHighlighting(
      theme === 'dark' ? darkPromqlHighlighter : promqlHighlighter
    )
    if (theme === 'dark') {
      highlighter = syntaxHighlighting(darkPromqlHighlighter)
    }

    const dynamicConfig = [
      highlighter,
      promqlExtension.asExtension(),
      theme === 'dark' ? darkTheme : lightTheme,
    ]
    const startState = EditorState.create({
      doc: (value || defaultValue) as string,
      extensions: [
        baseTheme,
        highlightSpecialChars(),
        history(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        EditorView.lineWrapping,
        keymap.of([
          ...closeBracketsKeymap,
          ...defaultKeymap,
          ...historyKeymap,
          ...completionKeymap,
          ...lintKeymap,
        ]),
        placeholderPlugin(placeholder),
        dynamicConfigCompartment.of(dynamicConfig),
        keymap.of([
          {
            key: 'Escape',
            run: (v: EditorView): boolean => {
              v.contentDOM.blur()
              return false
            },
          },
        ]),
        Prec.highest(
          keymap.of([
            {
              key: 'Shift-Enter',
              run: (): boolean => {
                return true
              },
            },
            {
              key: 'Enter',
              run: insertNewlineAndIndent,
            },
          ])
        ),
        EditorView.updateListener.of((update: ViewUpdate): void => {
          if (update.docChanged) {
            onExpressionChange(update.state.doc.toString())
          }
        }),
      ],
    })
    const view = viewRef.current
    if (view === null) {
      if (!containerRef.current) {
        throw new Error('expected CodeMirror container element to exist')
      }

      const view = new EditorView({
        state: startState,
        parent: containerRef.current,
      })

      viewRef.current = view
    } else {
      view.dispatch(
        view.state.update({
          effects: dynamicConfigCompartment.reconfigure(dynamicConfig),
          scrollIntoView: true,
          changes: {
            from: 0,
            to: view.state.doc.length,
            insert: doc,
          },
        })
      )

      const view2 = new EditorView({
        state: startState,
        // parent: containerRef.current as any,
      })

      viewRef.current = view2
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disabled, containerRef, pathPrefix, placeholder, prefix, theme, doc])

  useEffect(() => {
    onChange?.(doc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc])

  useEffect(() => {
    if (!defaultValue && !value) {
      return
    }
    setDoc(defaultValue || value)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return (
    <div ref={ref}>
      <div className={styles.promInputContent}>
        <div
          className={
            'cm-expression-input ' + (showBorder ? styles.promInput : '')
          }
          style={{
            borderColor: showBorder
              ? status === 'error'
                ? 'red'
                : token.colorBorder
              : '',
            background: showBorder
              ? disabled
                ? token.colorBgContainerDisabled
                : token.colorBgContainer
              : '',
            color: token.colorTextBase,
          }}
          ref={containerRef}
        />

        {formatExpression && (
          <Button
            ref={buttonRef}
            // onClick={handleOpenModal}
            type='primary'
            size='large'
            style={{
              borderRadius: '0 6px 6px 0',
            }}
            disabled={!doc || !prefix}
            icon={<ThunderboltOutlined />}
          />
        )}
      </div>
    </div>
  )
}

export default PromQLInput
