import { UpOutlined } from '@ant-design/icons'
import type { DatePickerProps, InputNumberProps, InputProps, RadioGroupProps, SelectProps, TreeSelectProps } from 'antd'
import { Button, Col, DatePicker, Form, Input, InputNumber, Radio, Row, Select, Space, TreeSelect } from 'antd'
import type { Rule } from 'antd/es/form'
import { type FC, forwardRef, memo, useImperativeHandle, useState } from 'react'
import FetchSelect, { type FetchSelectProps } from './child/fetch-select'

export type DataProps = {
  value?: string | number
  onChange?: (value: Record<string, unknown>) => void
  defaultValue?: string | number
} & (
  | {
      type: 'input'
      itemProps?: InputProps
    }
  | {
      type: 'select'
      itemProps?: SelectProps
    }
  | {
      type: 'input-number'
      itemProps?: InputNumberProps
    }
  | {
      type: 'tree-select'
      itemProps?: TreeSelectProps
    }
  | {
      type: 'radio-group'
      itemProps?: RadioGroupProps
    }
  | {
      type: 'date-picker'
      itemProps?: DatePickerProps
    }
  | {
      type: 'select-fetch'
      itemProps?: FetchSelectProps
    }
)

export type SearchFormItem = {
  name: string
  label: string
  rules?: Rule[]
  dataProps?: DataProps
}
export interface SearchProps {
  formList: SearchFormItem[]
  onSearch: (values: any) => void
  onReset: () => void
  labelCol?: number
  ref: any
}

// eslint-disable-next-line react-refresh/only-export-components
const SearchBox: FC<SearchProps> = forwardRef((props: SearchProps, ref) => {
  const { formList, onSearch, onReset } = props
  const [isOpen, setIsOpen] = useState(false)
  const [count, setCount] = useState(3)
  const [form] = Form.useForm()

  const reset = () => {
    form.resetFields()
    onReset()
  }

  const onFinish = () => {
    form.validateFields().then((res) => {
      onSearch(res)
    })
  }

  useImperativeHandle(ref, () => ({
    // 设置部分表单值
    onSearchSome: (val: Record<string, unknown>) => {
      form.setFieldsValue(val)
    }
  }))

  const toggle = () => {
    if (!isOpen) {
      setCount(formList.length)
    } else {
      setCount(3)
    }
    setIsOpen(!isOpen)
  }

  const formItem = (item: DataProps) => {
    const { type, itemProps } = item
    switch (type) {
      case 'input':
        return <Input {...itemProps} />
      case 'date-picker':
        return <DatePicker {...itemProps} />
      case 'select':
        return <Select {...itemProps} />
      case 'tree-select':
        return <TreeSelect {...itemProps} />
      case 'input-number':
        return <InputNumber {...itemProps} />
      case 'radio-group':
        return <Radio.Group {...itemProps} />
      case 'select-fetch':
        return <FetchSelect {...itemProps} />
    }
  }

  return (
    <div className='p-6'>
      <Form form={form} onFinish={onFinish} autoComplete='off'>
        <Row gutter={[16, 0]} className='relative'>
          {formList?.map((item: SearchFormItem, index: number) => {
            const {
              label,
              name,
              rules,
              dataProps = {
                type: 'input',
                itemProps: {
                  placeholder: `请输入${label}`
                }
              }
            } = item
            if (index < count) {
              return (
                <Col key={name} xs={24} sm={12} lg={6} xl={6}>
                  <Form.Item label={label} key={name} name={name} rules={rules}>
                    {formItem(dataProps)}
                  </Form.Item>
                </Col>
              )
            }
            return null
          })}
          <Col xs={24} sm={12} lg={6} xl={6} style={{ height: '56px' }} />
          <Col
            xs={24}
            sm={12}
            lg={6}
            xl={6}
            className='text-right h-14 absolute bottom-0 right-0 overflow-hidden whitespace-nowrap text-ellipsis'
          >
            <Space>
              <Button type='primary' htmlType='submit'>
                搜索
              </Button>
              <Button htmlType='reset' onClick={reset}>
                重置
              </Button>
              {formList && formList.length > 3 ? (
                <Space>
                  <Button className='p-0' type='link' onClick={toggle}>
                    {isOpen ? '收起' : '展开'}
                    <UpOutlined rotate={isOpen ? 180 : 0} />
                  </Button>
                </Space>
              ) : null}
            </Space>
          </Col>
        </Row>
      </Form>
    </div>
  )
})

// eslint-disable-next-line react-refresh/only-export-components
export default memo(SearchBox)
