import type { CSSProperties } from 'react'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Space, Typography } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'
import type { KeyValueRow } from '@/components/keyValueUtils'

const { Text } = Typography

interface KeyValueEditorProps {
  name: string
  label: React.ReactNode
  extra?: React.ReactNode
  disabled?: boolean
  keyPlaceholder?: string
  valuePlaceholder?: string
  addLabel?: string
  /** key 与 value 列宽比例，默认 1:1 */
  columnRatio?: readonly [number, number]
}

export default function KeyValueEditor({
  name,
  label,
  extra,
  disabled,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
  columnRatio,
}: KeyValueEditorProps) {
  const { t } = useLocale()
  const [keyRatio, valueRatio] = columnRatio ?? [1, 1]
  const rowGridStyle: CSSProperties = {
    gridTemplateColumns: `minmax(0, ${keyRatio}fr) minmax(0, ${valueRatio}fr) auto`,
  }

  return (
    <Form.Item label={label} extra={extra}>
      <Form.List
        name={name}
        rules={[
          {
            validator: async (_, rows?: KeyValueRow[]) => {
              const trimmedKeys = (rows ?? [])
                .map((row) => row?.key?.trim())
                .filter((item): item is string => Boolean(item))
              if (new Set(trimmedKeys).size !== trimmedKeys.length) {
                throw new Error(t('common.kv.keyDuplicate'))
              }
              const invalidRow = (rows ?? []).some((row) => {
                const currentKey = row?.key?.trim()
                const currentValue = row?.value?.trim()
                return !currentKey && Boolean(currentValue)
              })
              if (invalidRow) {
                throw new Error(t('common.kv.keyRequired'))
              }
            },
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <div className='flex flex-col gap-2'>
            {fields.length > 0 ? (
              fields.map((field) => (
                <div
                  key={field.key}
                  className='grid gap-2'
                  style={rowGridStyle}
                >
                  <Form.Item name={[field.name, 'key']} className='mb-0'>
                    <Input
                      placeholder={
                        keyPlaceholder ?? t('common.kv.keyPlaceholder')
                      }
                      disabled={disabled}
                    />
                  </Form.Item>
                  <Form.Item name={[field.name, 'value']} className='mb-0'>
                    <Input
                      placeholder={
                        valuePlaceholder ?? t('common.kv.valuePlaceholder')
                      }
                      disabled={disabled}
                    />
                  </Form.Item>
                  <Button
                    icon={<DeleteOutlined />}
                    danger
                    disabled={disabled}
                    onClick={() => remove(field.name)}
                  />
                </div>
              ))
            ) : (
              <Text type='secondary'>{t('common.kv.empty')}</Text>
            )}
            <Space orientation='vertical' size={4} className='w-full'>
              <Button
                type='dashed'
                icon={<PlusOutlined />}
                disabled={disabled}
                onClick={() => add({})}
              >
                {addLabel ?? t('common.kv.add')}
              </Button>
              <Form.ErrorList errors={errors} />
            </Space>
          </div>
        )}
      </Form.List>
    </Form.Item>
  )
}
