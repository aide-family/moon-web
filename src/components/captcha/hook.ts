import { getCaptcha, type CaptchaReply, type CaptchaVerifyData } from '@/api/authorization'
import { useCallback, useState } from 'react'

export interface CaptchaData {
    image: string
    thumb: string
    thumbX?: number
    thumbY?: number
    thumbWidth?: number
    thumbHeight?: number
    angle?: number
    thumbSize?: number
    captchaId: string
    captchaType: 1 | 2 | 3 // 1: Click, 2: Slide, 3: Rotate
}

export interface CaptchaConfig {
    width?: number
    height?: number
    thumbWidth?: number
    thumbHeight?: number
    verticalPadding?: number
    horizontalPadding?: number
    showTheme?: boolean
    title?: string
    buttonText?: string
    iconSize?: number
    dotSize?: number
    scope?: boolean
}

export const useCaptcha = () => {
    const [captchaData, setCaptchaData] = useState<CaptchaData>({
        image: '',
        thumb: '',
        captchaId: '',
        captchaType: 1
    })
    const [loading, setLoading] = useState(false)

    // 获取验证码数据
    const fetchCaptchaData = useCallback(async () => {
        setLoading(true)
        try {
            const data: CaptchaReply = await getCaptcha()

            // 转换API数据为组件所需格式
            const transformedData: CaptchaData = {
                image: data.masterImageBase64,
                thumb: data.thumbImageBase64,
                captchaId: data.captchaId,
                captchaType: data.captchaType,
                thumbSize: data.thumbSize
            }

            // 根据验证码类型设置额外属性
            if (data.captchaType === 2) { // Slide
                transformedData.thumbX = 50
                transformedData.thumbY = 50
                transformedData.thumbWidth = data.thumbSize
                transformedData.thumbHeight = data.thumbSize
            } else if (data.captchaType === 3) { // Rotate
                transformedData.angle = 45
            }

            setCaptchaData(transformedData)
        } catch (error) {
            console.error('Failed to fetch captcha data:', error)
            throw error
        } finally {
            setLoading(false)
        }
    }, [])

    // 构建验证码校验数据，供登录时使用
    const buildCaptchaVerifyData = useCallback((data: any, captchaId: string): CaptchaVerifyData => {
        // 根据验证码类型构建校验数据
        const verifyData: CaptchaVerifyData = {
            captchaId
        }

        if (typeof data === 'object') {
            // 旋转验证码
            if (data.angle !== undefined) {
                verifyData.angle = data.angle
            }
            // 滑动验证码
            if (data.sx !== undefined && data.sy !== undefined) {
                verifyData.sx = data.sx
                verifyData.sy = data.sy
            }
            // 点击验证码
            if (data.dots !== undefined) {
                verifyData.dots = data.dots
            }
        } else if (typeof data === 'number') {
            // 旋转验证码 - 直接传入角度
            verifyData.angle = data
        }

        return verifyData
    }, [])

    // 获取验证码类型名称
    const getCaptchaTypeName = useCallback((type: number): string => {
        const typeMap = {
            1: '点击',
            2: '滑动',
            3: '旋转'
        }
        return typeMap[type as keyof typeof typeMap] || '未知'
    }, [])

    return {
        captchaData,
        loading,
        fetchCaptchaData,
        buildCaptchaVerifyData,
        getCaptchaTypeName
    }
}
