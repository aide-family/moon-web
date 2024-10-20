import { FullscreenOutlined } from '@ant-design/icons'
import { Button, ButtonProps } from 'antd'
import React from 'react'

export interface ButtonFullScreenProps extends ButtonProps {
  bodyId: string
}

export const ButtonFullScreen: React.FC<ButtonFullScreenProps> = (props) => {
  const { bodyId, ...resetProps } = props

  const elem = document.getElementById(bodyId)!
  // 进入全屏模式的函数
  function openFullscreen() {
    if (!elem) return
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
    }
  }

  return <Button {...resetProps} onClick={openFullscreen} icon={<FullscreenOutlined />} />
}
