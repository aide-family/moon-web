import { ReloadOutlined } from '@ant-design/icons'
import { Button, message, Spin } from 'antd'
import GoCaptcha from 'go-captcha-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useCaptcha, type CaptchaConfig } from './hook'

export interface MoonCaptchaProps {
    type?: 'click' | 'slide' | 'rotate' | 'drag'
    config?: CaptchaConfig
    onSuccess?: (data: any) => void
    onError?: (error: string) => void
    onClose?: () => void
    visible?: boolean
    title?: string
}

const MoonCaptcha: React.FC<MoonCaptchaProps> = ({
    type = 'click',
    config = {},
    onSuccess,
    onError,
    onClose,
    visible = false,
    title = '验证码'
}) => {
    const domRef = useRef<any>(null)
    const { captchaData, loading, fetchCaptchaData, verifyCaptcha } = useCaptcha()
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
            fetchCaptchaData(type)
        }
    }, [isVisible, type, captchaData.image, captchaData.thumb, fetchCaptchaData])

    // 监听visible变化
    useEffect(() => {
        setIsVisible(visible)
    }, [visible])

    // 刷新验证码
    const handleRefresh = useCallback(() => {
        fetchCaptchaData(type)
    }, [fetchCaptchaData, type])

    // 关闭验证码
    const handleClose = useCallback(() => {
        setIsVisible(false)
        onClose?.()
    }, [onClose])

    // 点击模式确认事件
    const handleClickConfirm = useCallback(
        async (dots: any[], reset: () => void) => {
            try {
                const isValid = await verifyCaptcha(dots, 'click')
                if (isValid) {
                    message.success('验证成功')
                    onSuccess?.(dots)
                    handleClose()
                } else {
                    message.error('验证失败，请重试')
                    reset()
                }
            } catch (error) {
                message.error('验证出错')
                onError?.('验证出错')
            }
        },
        [verifyCaptcha, onSuccess, onError, handleClose]
    )

    // 滑动模式确认事件
    const handleSlideConfirm = useCallback(
        async (point: any, reset: () => void) => {
            try {
                const isValid = await verifyCaptcha(point, 'slide')
                if (isValid) {
                    message.success('验证成功')
                    onSuccess?.(point)
                    handleClose()
                } else {
                    message.error('验证失败，请重试')
                    reset()
                }
            } catch (error) {
                message.error('验证出错')
                onError?.('验证出错')
            }
        },
        [verifyCaptcha, onSuccess, onError, handleClose]
    )

    // 拖拽模式确认事件
    const handleDragConfirm = useCallback(
        async (point: any, reset: () => void) => {
            try {
                const isValid = await verifyCaptcha(point, 'drag')
                if (isValid) {
                    message.success('验证成功')
                    onSuccess?.(point)
                    handleClose()
                } else {
                    message.error('验证失败，请重试')
                    reset()
                }
            } catch (error) {
                message.error('验证出错')
                onError?.('验证出错')
            }
        },
        [verifyCaptcha, onSuccess, onError, handleClose]
    )

    // 旋转模式确认事件
    const handleRotateConfirm = useCallback(
        async (angle: number, reset: () => void) => {
            try {
                const isValid = await verifyCaptcha({ angle }, 'rotate')
                if (isValid) {
                    message.success('验证成功')
                    onSuccess?.({ angle })
                    handleClose()
                } else {
                    message.error('验证失败，请重试')
                    reset()
                }
            } catch (error) {
                message.error('验证出错')
                onError?.('验证出错')
            }
        },
        [verifyCaptcha, onSuccess, onError, handleClose]
    )

    // 渲染点击模式
    const renderClickMode = () => (
        <GoCaptcha.Click
            config={defaultConfig}
            data={captchaData}
            events={{
                close: handleClose,
                refresh: handleRefresh,
                confirm: handleClickConfirm
            }}
            ref={domRef}
        />
    )

    // 渲染滑动模式
    const renderSlideMode = () => {
        const slideData = {
            image: captchaData.image,
            thumb: captchaData.thumb,
            thumbX: captchaData.thumbX || 0,
            thumbY: captchaData.thumbY || 0,
            thumbWidth: captchaData.thumbWidth || 60,
            thumbHeight: captchaData.thumbHeight || 60
        }

        return (
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
        )
    }

    // 渲染拖拽模式
    const renderDragMode = () => {
        const dragData = {
            image: captchaData.image,
            thumb: captchaData.thumb,
            thumbX: captchaData.thumbX || 0,
            thumbY: captchaData.thumbY || 0,
            thumbWidth: captchaData.thumbWidth || 60,
            thumbHeight: captchaData.thumbHeight || 60
        }

        return (
            <GoCaptcha.SlideRegion
                config={defaultConfig}
                data={dragData}
                events={{
                    close: handleClose,
                    refresh: handleRefresh,
                    confirm: handleDragConfirm
                }}
                ref={domRef}
            />
        )
    }

    // 渲染旋转模式
    const renderRotateMode = () => {
        const rotateData = {
            image: captchaData.image,
            thumb: captchaData.thumb,
            angle: captchaData.angle || 0,
            thumbSize: captchaData.thumbSize || 60
        }

        return (
            <GoCaptcha.Rotate
                config={defaultConfig}
                data={rotateData}
                events={{
                    close: handleClose,
                    refresh: handleRefresh,
                    confirm: handleRotateConfirm
                }}
                ref={domRef}
            />
        )
    }

    // 渲染验证码组件
    const renderCaptcha = () => {
        switch (type) {
            case 'click':
                return renderClickMode()
            case 'slide':
                return renderSlideMode()
            case 'drag':
                return renderDragMode()
            case 'rotate':
                return renderRotateMode()
            default:
                return renderClickMode()
        }
    }

    if (!isVisible) {
        return null
    }

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
            <div className='relative bg-white rounded-lg shadow-lg p-4'>
                <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold'>{title}</h3>
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
                    {renderCaptcha()}
                </Spin>
            </div>
        </div>
    )
}

export default MoonCaptcha



