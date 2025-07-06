import React, { useState } from 'react'
import ClickCaptcha from './click-captcha'
import { useCaptcha } from './hook'
import RotateCaptcha from './rotate-captcha'
import SlideCaptcha from './slide-captcha'

export interface SmartCaptchaProps {
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
    onClose?: () => void
    visible?: boolean
    title?: string
}

const SmartCaptcha: React.FC<SmartCaptchaProps> = ({
    onSuccess,
    onError,
    onClose,
    visible = false,
    title = '验证码'
}) => {
    const { captchaData } = useCaptcha()
    const [isVisible, setIsVisible] = useState(visible)

    // 监听visible变化
    React.useEffect(() => {
        setIsVisible(visible)
    }, [visible])

    // 根据验证码类型渲染对应组件
    const renderCaptchaComponent = () => {
        const commonProps = {
            onSuccess,
            onError,
            onClose: () => {
                setIsVisible(false)
                onClose?.()
            },
            visible: isVisible,
            title
        }

        switch (captchaData.captchaType) {
            case 1: // Click
                return <ClickCaptcha {...commonProps} />
            case 2: // Slide
                return <SlideCaptcha {...commonProps} />
            case 3: // Rotate
                return <RotateCaptcha {...commonProps} />
            default:
                // 默认显示点击验证码
                return <ClickCaptcha {...commonProps} />
        }
    }

    return renderCaptchaComponent()
}

export default SmartCaptcha 