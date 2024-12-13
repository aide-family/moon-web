import { type FormItemProps, Col, Form, FormProps, Row } from 'antd'
import { ValidateStatus } from 'antd/es/form/FormItem'
import React, { FC } from 'react'
import { DataInput, DataInputProps } from './child/data-input'

export type DataFromItem =
  | ({
      name: string
      label?: React.ReactNode
      formProps?: FormItemProps
      id?: string
    } & DataInputProps)
  | null

export interface ValidateType {
  validateStatus?: ValidateStatus
  help?: React.ReactNode | string
}

export interface DataFromProps {
  items: (DataFromItem | DataFromItem[])[]
  props?: FormProps
  children?: React.ReactNode
  validates?: Record<string, ValidateType>
}

export const DataFrom: React.FC<DataFromProps> = (props) => {
  const { items, children, validates } = props
  return (
    <Form {...props.props} autoComplete='off'>
      <Row gutter={12}>
        <RenderForm items={items} validates={validates} />
      </Row>
      {children}
    </Form>
  )
}

const RenderForm: FC<{
  items: (DataFromItem | DataFromItem[])[]
  validates?: Record<string, ValidateType>
}> = (props) => {
  const { items, validates } = props

  if (Array.isArray(items)) {
    return items.map((item) => {
      const span = 24
      if (Array.isArray(item)) {
        return renderFormItems(item, span / item.length, validates)
      }
      return renderFormItem(item, span, validates)
    })
  } else {
    return renderFormItem(items, 24, validates)
  }
}

const renderFormItems = (items: DataFromItem[], span: number = 24, validates?: Record<string, ValidateType>) => {
  return items.map((item) => {
    return renderFormItem(item, span, validates)
  })
}

const renderFormItem = (item: DataFromItem, span: number = 24, validates?: Record<string, ValidateType>) => {
  if (!item) {
    return null
  }

  const { name, label, id, formProps } = item

  return (
    <Col span={span} key={name} id={id}>
      <Form.Item {...formProps} name={name} label={label} key={name} {...validates?.[name]}>
        <DataInput {...item} />
      </Form.Item>
    </Col>
  )
}
