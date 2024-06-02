import { FC } from 'react'

import type { FormProps } from 'antd/es/form'
import { Form, Col, Row } from 'antd'
import { DataInput } from './child/data-input'
import { DataFromItem } from './form'

export type SearchFormProps = {
  items?: DataFromItem[]
  props?: FormProps
  onClear?: () => void
}

const SearchForm: FC<SearchFormProps> = (props) => {
  const { items = [] } = props

  const renderFormItem = (item: DataFromItem) => {
    const { name, label, formProps } = item
    return (
      <Form.Item {...formProps} name={name} label={label} key={name + label}>
        <DataInput {...item} />
      </Form.Item>
    )
  }

  const renderFormItems = (items: DataFromItem[]) => {
    return items.map((item, index) => {
      return (
        <Col key={index} xs={24} sm={24} md={12} lg={12} xl={8} xxl={6}>
          {renderFormItem(item)}
        </Col>
      )
    })
  }

  return (
    <>
      <Form {...props} layout='vertical'>
        <Row gutter={16}>{renderFormItems(items)}</Row>
      </Form>
    </>
  )
}

export default SearchForm
