import React, { forwardRef, memo, useImperativeHandle, useState, useEffect } from 'react'
import { SearchFormItem } from '@/api/global'
import { Button, Col, Form, Input, Row, Space, Select } from 'antd'
import { SearchOutlined, ReloadOutlined, UpOutlined } from '@ant-design/icons'
import styles from "./index.module.scss"

export interface SearchProps {
  formList: SearchFormItem[],
  onSearch: (values: any) => void,
}

const SearchBox = forwardRef(function fnRef(props: SearchProps, ref) {
  const { formList, onSearch, labelCol } = props
  const [isOpen, setIsOpen] = useState(false)
  const [count, setCount] = useState(3)
  const [form] = Form.useForm()
  const reset = () => {
    form.resetFields()
    onSearch({})
  }
  const onFinish = () => {
    form.validateFields().then(res => {
      onSearch(res)
    })
  }
  useImperativeHandle(ref, () => {
    return {
      reset
    }
  })
  const toggle = () => {
    if (!isOpen) {
      setCount(formList.length)
    } else {
      setCount(3)
    }
    setIsOpen(!isOpen)
  }

  const formItem = (obj: SearchFormItem) => {
    const {
      type,
      style,
    } = obj;
    switch (type) {
      case 1:
        return (
          <Input
            {...obj}
          />
        );
      case 2:
        return (
          <DatePicker
            {...obj}
          />
        );
      case 3:
        return (
          <RangePicker
            {...obj}
          />
        );
      case 4:
        return (
          <Select
            showSearch
            optionFilterProp="label"
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            {...obj}
          />
        );
      case 5:
        return (
          <TreeSelect
            showSearch
            getPopupContainer={(triggerNode) => triggerNode.parentNode}
            {...obj}
          />
        );
      case 6:
        return (
          <Radio.Group
            {...obj}
          ></Radio.Group>
        );
      default:
        return (
          <Input
            {...obj}
          />
        );
    }
  };

  return (
    <div className={styles.search_box}>
      <Form
        form={form}
        onFinish={onFinish}
        labelCol={{ span: labelCol }}
      >
        <Row gutter={[16, 0]} style={{ position: 'relative' }}>
          {
            formList && formList.map((item: any, index: number) => {
              if (index < count) {
                return (
                  <Col key={index} xs={24} sm={12} lg={6} xl={6}>
                    <Form.Item
                      initialValue={item.initialValue}
                      label={item.label}
                      key={item.name}
                      name={item.name}
                      rules={item.rules}
                      shouldUpdate={item.shouldUpdate}
                    >
                      {formItem(item)}
                    </Form.Item>
                  </Col>
                )
              }
              return null
            })
          }
          {<Col xs={24} sm={12} lg={6} xl={6} style={{ height: '56px' }}></Col>
          }
          <Col
            xs={24} sm={12} lg={6} xl={6}
            style={{ textAlign: 'right', height: '56px', position: 'absolute', bottom: 0, right: 0 }}
          >
            <Space>
              <Button type="primary" htmlType="submit">
                {'搜索'}
              </Button>
              <Button htmlType="reset" onClick={reset}>
                {'重置'}
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
