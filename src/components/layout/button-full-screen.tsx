import { GlobalContext } from '@/utils/context'
import { FullscreenOutlined } from '@ant-design/icons'
import { Button, type ButtonProps } from 'antd'
import type React from 'react'
import { useContext } from 'react'

export interface ButtonFullScreenProps extends ButtonProps {
  bodyId: string
}

export const ButtonFullScreen: React.FC<ButtonFullScreenProps> = (props) => {
  const { bodyId, ...resetProps } = props
  const { isFullscreen, setIsFullscreen } = useContext(GlobalContext)

  const elem = document.getElementById(bodyId)

  // 进入全屏模式的函数
  function openFullscreen() {
    if (!elem) return
    if (elem.requestFullscreen) {
      elem.requestFullscreen()
      setIsFullscreen?.(true)
    }
  }

  // 退出全屏模式的函数
  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      setIsFullscreen?.(false)
    }
  }

  return (
    <Button
      {...resetProps}
      onClick={() => (isFullscreen ? exitFullscreen() : openFullscreen())}
      icon={<FullscreenOutlined />}
    />
  )
}
