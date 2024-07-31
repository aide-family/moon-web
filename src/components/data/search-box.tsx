import { FC, forwardRef, memo, useImperativeHandle, useState } from 'react'
import { Button, Col, Form, Input, Row, Space, Select, DatePicker, Radio, TreeSelect, InputNumber } from 'antd'
import type { InputProps, SelectProps, RadioGroupProps, DatePickerProps, InputNumberProps, TreeSelectProps } from 'antd'
import { UpOutlined } from '@ant-design/icons'
import type { Rule } from 'antd/es/form'
import styles from './index.module.scss'

export type itemProps = {
  value?: string | number
  // eslint-disable-next-line
  onChange?: (value: any) => void
  defaultValue?: string | number
} & (
  | {
      type: 'input'
      props?: InputProps
    }
  | {
      type: 'select'
      props?: SelectProps
    }
  | {
      type: 'input-number'
      props?: InputNumberProps
    }
  | {
      type: 'tree-select'
      props?: TreeSelectProps
    }
  | {
      type: 'date-picker'
      props?: DatePickerProps
    }
  | {
      type: 'radio-group'
      props?: RadioGroupProps
    }
)

export type SearchFormItem = {
  name: string
  label: string
  rules?: Rule[]
  dataProps?: itemProps
}
export interface SearchProps {
  formList: SearchFormItem[]
  // eslint-disable-next-line
  onSearch: (values: any) => void
  onReset: () => void
  labelCol?: number
  ref: any
}

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
    // eslint-disable-next-line
    onSearchSome: (val: any) => {
      form.setFieldsValue({
        ...val
      })
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

  const formItem = (item: itemProps) => {
    const { type, props } = item
    switch (type) {
      case 'input':
        return <Input {...props} />
      case 'date-picker':
        return <DatePicker {...props} />
      case 'select':
        return <Select {...props} />
      case 'tree-select':
        return <TreeSelect {...props} />
      case 'input-number':
        return <InputNumber {...props} />
      case 'radio-group':
        return <Radio.Group {...props} />
    }
  }

  return (
    <div className={styles.search_box}>
      <Form form={form} onFinish={onFinish}>
        <Row gutter={[16, 0]} style={{ position: 'relative' }}>
          {formList?.map((item: SearchFormItem, index: number) => {
            const {
              label,
              name,
              rules,
              dataProps = {
                type: 'input',
                props: {
                  placeholder: `请输入${label}`
                }
              }
            } = item
            if (index < count) {
              return (
                <Col key={index} xs={24} sm={12} lg={6} xl={6}>
                  <Form.Item label={label} key={name} name={name} rules={rules}>
                    {formItem(dataProps)}
                  </Form.Item>
                </Col>
              )
            }
            return null
          })}
          {<Col xs={24} sm={12} lg={6} xl={6} style={{ height: '56px' }}></Col>}
          <Col
            xs={24}
            sm={12}
            lg={6}
            xl={6}
            style={{ textAlign: 'right', height: '56px', position: 'absolute', bottom: 0, right: 0 }}
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
                  <Button style={{ padding: 0 }} type='link' onClick={toggle}>
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

export default memo(SearchBox)
