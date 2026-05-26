import { CopyOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import type { ButtonProps } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'

interface CopyButtonProps extends Omit<ButtonProps, 'children' | 'onClick'> {
  copyValue?: string | number | null
  text?: React.ReactNode
}

export default function CopyButton({
  copyValue,
  text,
  type = 'link',
  size = 'small',
  disabled,
  ...rest
}: CopyButtonProps) {
  const { message } = App.useApp()
  const { t } = useLocale()
  const copyDisabled = disabled || copyValue == null || copyValue === ''

  const handleCopy = async () => {
    if (copyDisabled) return
    if (typeof navigator === 'undefined' || !navigator.clipboard?.writeText) {
      message.error(t('common.copy.failed'))
      return
    }
    try {
      await navigator.clipboard.writeText(String(copyValue))
      message.success(t('common.copy.success'))
    } catch (error) {
      console.error('复制失败:', error)
      message.error(t('common.copy.failed'))
    }
  }

  return (
    <Button
      {...rest}
      type={type}
      size={size}
      icon={<CopyOutlined />}
      disabled={copyDisabled}
      onClick={() => void handleCopy()}
    >
      {text ?? t('common.copy')}
    </Button>
  )
}
