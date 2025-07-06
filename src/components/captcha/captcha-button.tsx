import { SafetyOutlined } from '@ant-design/icons'
import { Button, type ButtonProps } from 'antd'
import React, { useState } from 'react'
import type { ClickCaptchaProps } from './click-captcha'
import ClickCaptcha from './click-captcha'
import type { RotateCaptchaProps } from './rotate-captcha'
import RotateCaptcha from './rotate-captcha'
import type { SlideCaptchaProps } from './slide-captcha'
import SlideCaptcha from './slide-captcha'
import type { SmartCaptchaProps } from './smart-captcha'
import SmartCaptcha from './smart-captcha'

export type CaptchaType = 'smart' | 'click' | 'slide' | 'rotate'

export interface CaptchaButtonProps extends Omit<ButtonProps, 'onError'> {
    captchaType?: CaptchaType
    captchaProps?: Omit<SmartCaptchaProps | ClickCaptchaProps | SlideCaptchaProps | RotateCaptchaProps, 'visible' | 'onClose'>
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
    children?: React.ReactNode
}

const CaptchaButton: React.FC<CaptchaButtonProps> = ({
    captchaType = 'smart',
    captchaProps = {},
    onSuccess,
    onError,
    children,
    ...buttonProps
}) => {
    const [visible, setVisible] = useState(false)

    const handleClick = () => {
        setVisible(true)
    }

    const handleClose = () => {
        setVisible(false)
    }

    const handleSuccess = (data: any) => {
        onSuccess?.(data)
    }

    const handleError = (error: string) => {
        onError?.(error)
    }

    // 渲染对应的验证码组件
    const renderCaptchaComponent = () => {
        const commonProps = {
            ...captchaProps,
            visible,
            onClose: handleClose,
            onSuccess: handleSuccess,
            onError: handleError
        }

        switch (captchaType) {
            case 'smart':
                return <SmartCaptcha {...commonProps} />
            case 'click':
                return <ClickCaptcha {...commonProps} />
            case 'slide':
                return <SlideCaptcha {...commonProps} />
            case 'rotate':
                return <RotateCaptcha {...commonProps} />
            default:
                return <SmartCaptcha {...commonProps} />
        }
    }

    return (
        <>
            <Button
                {...buttonProps}
                icon={<SafetyOutlined />}
                onClick={handleClick}
            >
                {children || '验证码'}
            </Button>

            {renderCaptchaComponent()}
        </>
    )
}

export default CaptchaButton 