import { CopyOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import type { ButtonProps } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import { copyTextToClipboard } from '@/utils/clipboard'

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
    const ok = await copyTextToClipboard(String(copyValue))
    if (ok) {
      message.success(t('common.copy.success'))
    } else {
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
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => void handleCopy()}
    >
      {text ?? t('common.copy')}
    </Button>
  )
}
