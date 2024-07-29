import React, { forwardRef, memo, useImperativeHandle, useState, useEffect } from 'react'
import { Button, Col, Form, Input, Row, Space, Select } from 'antd'
import type { InputProps, SelectProps, InputNumberProps, TreeSelectProps, DatePickerProps } from 'antd/lib'
import { UpOutlined } from '@ant-design/icons'
import styles from './index.module.scss'

export interface MoonInputProps extends InputProps {
  type: 'input'
}

export interface MoonSelectProps extends SelectProps {
  type: 'select'
}

export interface MoonInputNumberProps extends InputNumberProps {
  type: 'input-number'
}

export interface MoonTreeSelectProps extends TreeSelectProps {
  type: 'tree-select'
}

export interface MoonDatePickerProps extends DatePickerProps {
  type: 'date-picker'
}

export type DataInputProps =
  | MoonInputProps
  | MoonSelectProps
  | MoonInputNumberProps
  | MoonTreeSelectProps
  | MoonDatePickerProps

export type SearchFormItem = {
  name: string
  label: string
  dataProps?: DataInputProps
}

export interface SearchProps {
  formList: SearchFormItem[]
  onSearch: (values: any) => void
  onReset: () => void
  labelCol?: number
}

const SearchBox = forwardRef(function fnRef(props: SearchProps, ref) {
  const { formList, onSearch, labelCol, onReset } = props
  const [isOpen, setIsOpen] = useState(false)
  const [count, setCount] = useState(3)
  const [form] = Form.useForm()

  const reset = () => {
    form.resetFields()
    onReset()
  }

  const onFinish = () => {
    form.validateFields().then(res => {
      onSearch(res)
    })
  }

  useImperativeHandle(ref, () => ({
    // 设置部分表单值
    onSearchSome<T>: (obj: T) => {
      form.setFieldsValue({
        ...obj
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

const formItem = (props: DataInputProps) => {
  const { type, ...rest } = props
  switch (type) {
    case 'input':
      return (
        <Input {...rest} />
      )
    case 'date-picker':
      return (
        <DatePicker {...rest} />
      );
    case 'range-picker':
      return (
        <RangePicker {...rest} />
      );
    case 'select':
      return (
        <Select
          showSearch
          optionFilterProp='label'
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
          {...rest}
        />
      );
    case 'tree-select':
      return (
        <TreeSelect
          showSearch
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
          {...rest}
        />
      );
    case 'radio-group':
      return (
        <Radio.Group {...rest} />
      );
    default:
      return (
        <Input {...rest} />
      )
  }
}

return (
  <div className={styles.search_box}>
    <Form
      form={form}
      onFinish={onFinish}
    >
      <Row gutter={[16, 0]} style={{ position: 'relative' }}>
        {
          formList?.map((item: DataInputProps, index: number) => {
            if (index < count) {
              return (
                <Col key={index} xs={24} sm={12} lg={6} xl={6}>
                  <Form.Item
                    label={item.label}
                    key={item.name}
                    name={item.name}
                    rules={item?.rules}
                  >
                    {formItem(item.dataProps)}
                  </Form.Item>
                </Col>
              )
            }
            return null
          })
        }
        {<Col xs={24} sm={12} lg={6} xl={6} style={{ height: '56px' }}></Col>}
        <Col
          xs={24} sm={12} lg={6} xl={6}
          style={{ textAlign: 'right', height: '56px', position: 'absolute', bottom: 0, right: 0 }}
        >
          <Space>
            <Button type="primary" htmlType="submit">
              搜索
            </Button>
            <Button htmlType="reset" onClick={reset}>
              重置
            </Button>
            {
              formList && formList.length > 3
                ? <Space><Button style={{ padding: 0 }} type='link' onClick={toggle}>
                  {
                    isOpen
                      ? '收起'
                      : '展开'
                  }
                  <UpOutlined rotate={isOpen ? 180 : 0} />
                </Button>
                </Space>
                : null
            }
          </Space>
        </Col>
      </Row>
    </Form>
  </div>
)
}
)

export default memo(SearchBox)
