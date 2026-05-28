import { DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Space, Typography } from 'antd'
import { useLocale } from '@/contexts/LocaleContext'

const { Text } = Typography

export interface KeyValueRow {
  key?: string
  value?: string
}

interface KeyValueEditorProps {
  name: string
  label: React.ReactNode
  extra?: React.ReactNode
  disabled?: boolean
  keyPlaceholder?: string
  valuePlaceholder?: string
  addLabel?: string
}

export const recordToKeyValueRows = (
  value?: Record<string, string>,
): KeyValueRow[] =>
  Object.entries(value ?? {}).map(([key, itemValue]) => ({
    key,
    value: itemValue,
  }))

export const keyValueRowsToRecord = (
  rows?: KeyValueRow[],
): Record<string, string> | undefined => {
  const entries = (rows ?? []).reduce<Array<[string, string]>>((acc, row) => {
    const key = row.key?.trim()
    const value = row.value?.trim() ?? ''
    if (!key) {
      if (value) {
        throw new Error('invalid key-value row')
      }
      return acc
    }
    acc.push([key, value])
    return acc
  }, [])
  return entries.length ? Object.fromEntries(entries) : undefined
}

export const formatRecordJson = (value?: Record<string, string>): string =>
  value && Object.keys(value).length > 0 ? JSON.stringify(value, null, 2) : '-'

export default function KeyValueEditor({
  name,
  label,
  extra,
  disabled,
  keyPlaceholder,
  valuePlaceholder,
  addLabel,
}: KeyValueEditorProps) {
  const { t } = useLocale()

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
                  className='grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] gap-2'
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
