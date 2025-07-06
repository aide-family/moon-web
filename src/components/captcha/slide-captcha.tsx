import { ReloadOutlined } from '@ant-design/icons'
import { Button, message, Spin } from 'antd'
import GoCaptcha from 'go-captcha-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCaptcha, type CaptchaConfig } from './hook'

export interface SlideCaptchaProps {
    config?: CaptchaConfig
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
    onClose?: () => void
    visible?: boolean
    title?: string
}

const SlideCaptcha: React.FC<SlideCaptchaProps> = ({
    config = {},
    onSuccess,
    onError,
    onClose,
    visible = false,
    title = '滑动验证码'
}) => {
    const domRef = useRef<any>(null)
    const { captchaData, loading, fetchCaptchaData, buildCaptchaVerifyData, getCaptchaTypeName } = useCaptcha()
    const [isVisible, setIsVisible] = useState(visible)

    // 默认配置
    const defaultConfig: CaptchaConfig = {
        width: 300,
        height: 220,
        thumbWidth: 60,
        thumbHeight: 60,
        verticalPadding: 20,
        horizontalPadding: 20,
        showTheme: true,
        title: title,
        buttonText: '验证',
        iconSize: 20,
        dotSize: 24,
        scope: true,
        ...config
    }

    // 初始化验证码数据
    useEffect(() => {
        if (isVisible && (!captchaData.image || !captchaData.thumb)) {
            fetchCaptchaData()
        }
    }, [isVisible, captchaData.image, captchaData.thumb, fetchCaptchaData])

    // 监听visible变化
    useEffect(() => {
        setIsVisible(visible)
    }, [visible])

    // 刷新验证码
    const handleRefresh = useCallback(() => {
        fetchCaptchaData()
    }, [fetchCaptchaData])

    // 关闭验证码
    const handleClose = useCallback(() => {
        setIsVisible(false)
        onClose?.()
    }, [onClose])

    // 滑动模式确认事件
    const handleSlideConfirm = useCallback(
        async (point: any, reset: () => void) => {
            try {
                // 构建滑动验证码的校验数据
                const verifyData = buildCaptchaVerifyData({
                    sx: point.x || point.sx,
                    sy: point.y || point.sy
                }, captchaData.captchaId)

                message.success('验证成功')
                onSuccess?.(verifyData)
                handleClose()
            } catch (error) {
                message.error('验证出错')
                onError?.('验证出错')
                reset()
            }
        },
        [buildCaptchaVerifyData, captchaData.captchaId, onSuccess, onError, handleClose]
    )

    // 准备滑动数据
    const slideData = {
        image: captchaData.image,
        thumb: captchaData.thumb,
        thumbX: captchaData.thumbX || 0,
        thumbY: captchaData.thumbY || 0,
        thumbWidth: captchaData.thumbWidth || captchaData.thumbSize || 60,
        thumbHeight: captchaData.thumbHeight || captchaData.thumbSize || 60
    }

    if (!isVisible) {
        return null
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='relative bg-white rounded-lg shadow-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold'>
                        {title} - {getCaptchaTypeName(captchaData.captchaType)}
                    </h3>
                    <div className='flex items-center gap-2'>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleRefresh}
                            loading={loading}
                            size='small'
                        >
                            刷新
                        </Button>
                        <Button onClick={handleClose} size='small'>
                            关闭
                        </Button>
                    </div>
                </div>

                <Spin spinning={loading}>
                    <GoCaptcha.Slide
                        config={defaultConfig}
                        data={slideData}
                        events={{
                            close: handleClose,
                            refresh: handleRefresh,
                            confirm: handleSlideConfirm
                        }}
                        ref={domRef}
                    />
                </Spin>
            </div>
        </div>
    )
}

export default SlideCaptcha 