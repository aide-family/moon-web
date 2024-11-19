import { GlobalContext } from '@/utils/context'
import { theme } from 'antd'
import React, { useContext, useEffect, useRef } from 'react'
import './style.css'
import './userWorker'

export interface ButtonInputProps {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  onSearch?: (value: string) => void
  width?: number | string
  height?: number | string
  enterButton?: string
  placeholder?: string
  suffix?: React.ReactNode
}

const { useToken } = theme

export const ButtonInput: React.FC<ButtonInputProps> = (props) => {
  const { value = props.defaultValue, onChange, onSearch, width = '100%', height = '100%' } = props

  const { token } = useToken()
  const { theme } = useContext(GlobalContext)

  const monacoEl = useRef(null)

  useEffect(() => {}, [onChange, onSearch, value, token, theme])
  return (
    <div
      style={{
        width: width,
        height: height,
        borderColor: token.colorBorder
      }}
      className='buttonInput'
      ref={monacoEl}
    />
  )
}
