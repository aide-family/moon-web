import { type FormItemProps, Form, FormProps, Row, Col } from 'antd'
import React, { FC } from 'react'
import { DataInput, DataInputProps } from './child/data-input'

export type DataFromItem = {
  name: string
  label?: React.ReactNode
  formProps?: FormItemProps
  id?: string
} & DataInputProps

export interface DataFromProps {
  items: (DataFromItem | DataFromItem[])[]
  props?: FormProps
  children?: React.ReactNode
}

export const DataFrom: React.FC<DataFromProps> = (props) => {
  const { items, children } = props
  return (
    <Form {...props.props}>
      <Row gutter={12}>
        <RenderForm items={items} />
      </Row>
      {children}
    </Form>
  )
}

const RenderForm: FC<{ items: (DataFromItem | DataFromItem[])[] }> = (
  props
) => {
  const { items } = props

  if (Array.isArray(items)) {
    return items.map((item) => {
      const span = 24
      if (Array.isArray(item)) {
        return renderFormItems(item, span / item.length)
      }
      return renderFormItem(item, span)
    })
  } else {
    return renderFormItem(items, 24)
  }
}

const renderFormItems = (items: DataFromItem[], span: number = 24) => {
  return items.map((item) => {
    return renderFormItem(item, span)
  })
}

const renderFormItem = (item: DataFromItem, span: number = 24) => {
  const { name, label, id, formProps } = item

  return (
    <Col span={span} key={name} id={id}>
      <Form.Item {...formProps} name={name} label={label} key={name}>
        <DataInput {...item} />
      </Form.Item>
    </Col>
  )
}
