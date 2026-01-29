import { useRef, useEffect, useCallback } from 'react'

const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
const LEN = 4

function randomChar() {
  return CHARS[Math.floor(Math.random() * CHARS.length)]
}

function generateCode() {
  return Array.from({ length: LEN }, randomChar).join('')
}

export interface GraphicCaptchaProps {
  value?: string
  onChange?: (code: string) => void
  onRefresh?: (code: string) => void
  width?: number
  height?: number
  className?: string
}

export default function GraphicCaptcha({
  onChange,
  onRefresh,
  width = 120,
  height = 40,
  className = '',
}: GraphicCaptchaProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const codeRef = useRef<string>(generateCode())

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const code = generateCode()
    codeRef.current = code
    onRefresh?.(code)
    onChange?.('')

    canvas.width = width
    canvas.height = height

    // 背景
    ctx.fillStyle = '#f5f5f5'
    ctx.fillRect(0, 0, width, height)

    // 干扰线
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 100},${Math.random() * 100},${Math.random() * 100},0.5)`
      ctx.beginPath()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.lineTo(Math.random() * width, Math.random() * height)
      ctx.stroke()
    }

    // 干扰点
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.6)`
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, Math.PI * 2)
      ctx.fill()
    }

    // 文字
    const step = width / (LEN + 1)
    for (let i = 0; i < LEN; i++) {
      ctx.save()
      ctx.font = `${18 + Math.random() * 4}px Arial`
      ctx.fillStyle = `rgb(${Math.random() * 80},${Math.random() * 80},${Math.random() * 80})`
      ctx.translate(step * (i + 0.6), height / 2 + (Math.random() * 8 - 4))
      ctx.rotate((Math.random() - 0.5) * 0.4)
      ctx.fillText(code[i], 0, 4)
      ctx.restore()
    }
  }, [width, height, onChange, onRefresh])

  useEffect(() => {
    draw()
  }, [draw])

  const handleClick = () => {
    draw()
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <canvas
        ref={canvasRef}
        className="cursor-pointer rounded border border-gray-200 select-none"
        style={{ width, height }}
        onClick={handleClick}
        title="点击刷新"
      />
    </div>
  )
}
