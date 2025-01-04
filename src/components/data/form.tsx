import { Col, Form, type FormItemProps, type FormProps, Row } from 'antd'
import type { ValidateStatus } from 'antd/es/form/FormItem'
import type React from 'react'
import type { FC } from 'react'
import { DataInput, type DataInputProps } from './child/data-input'

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
  slot?: Record<string, React.ReactNode>
}

export const DataFrom: React.FC<DataFromProps> = (props) => {
  const { items, children, validates } = props
  return (
    <Form {...props.props} autoComplete='off'>
      <Row gutter={12}>
        <RenderForm p={props} items={items} validates={validates} />
      </Row>
      {children}
    </Form>
  )
}

const RenderForm: FC<{
  p: DataFromProps
  items: (DataFromItem | DataFromItem[])[]
  validates?: Record<string, ValidateType>
}> = (props) => {
  const { items, validates, p } = props

  if (Array.isArray(items)) {
    return items.map((item) => {
      const span = 24
      if (Array.isArray(item)) {
        return renderFormItems(p, item, span / item.length, validates)
      }
      return renderFormItem(p, item, span, validates)
    })
  }
  return renderFormItem(p, items, 24, validates)
}

const renderFormItems = (
  p: DataFromProps,
  items: DataFromItem[],
  span = 24,
  validates?: Record<string, ValidateType>
) => {
  return items.map((item) => {
    return renderFormItem(p, item, span, validates)
  })
}

const renderFormItem = (p: DataFromProps, item: DataFromItem, span = 24, validates?: Record<string, ValidateType>) => {
  if (!item) {
    return null
  }

  const { name, label, id, formProps } = item

  return (
    <Col span={span} key={name} id={id}>
      <Form.Item {...formProps} name={name} label={label} key={name} {...validates?.[name]}>
        {p.slot?.[name] || <DataInput {...item} />}
      </Form.Item>
    </Col>
  )
}
