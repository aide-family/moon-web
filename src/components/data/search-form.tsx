import { Col, Form, Row } from 'antd'
import type { FormProps } from 'antd/es/form'
import { FC } from 'react'
import { DataInput } from './child/data-input'
import { DataFromItem } from './form'

export interface SearchFormProps extends FormProps {
  items?: DataFromItem[]
  onClear?: () => void
}

const SearchForm: FC<SearchFormProps> = (props) => {
  const { items = [] } = props

  function renderFormItem(item: DataFromItem) {
    if (!item) {
      return null
    }
    const { name, label, formProps } = item
    return (
      <Form.Item {...formProps} name={name} label={label} key={name + label}>
        <DataInput {...item} />
      </Form.Item>
    )
  }

  function renderFormItems(items: DataFromItem[]) {
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
