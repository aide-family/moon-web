import { TimeEngineRuleType } from '@/api/enum'
import { TimeEngineRuleTypeData } from '@/api/global'
import { TimeEngineRuleItem } from '@/api/model-types'
import { createHook } from '@/api/notify/hook'
import { CreateTimeEngineRuleRequest, getTimeEngineRule, updateTimeEngineRule } from '@/api/notify/rule'
import { Avatar, Col, Form, Input, Modal, Row, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { dayOptions, hourOptions, monthOptions, weekOptions } from './options'

export interface EditRuleModalProps {
  open?: boolean
  ruleId?: number
  onOk?: (rule: CreateTimeEngineRuleRequest) => void
  onCancel?: () => void
}

let timer: NodeJS.Timeout | null = null
export function EditRuleModal(props: EditRuleModalProps) {
  const { open, ruleId, onOk, onCancel } = props

  const [form] = Form.useForm()

  const category = Form.useWatch('category', form)

  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<TimeEngineRuleItem>()

  const handleOnOk = () => {
    form.validateFields().then((values) => {
      setLoading(true)
      if (ruleId) {
        updateTimeEngineRule({ id: ruleId, data: values })
          .then(() => {
            form.resetFields()
            onOk?.(values)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        createHook(values)
          .then(() => {
            form.resetFields()
            onOk?.(values)
          })
          .finally(() => {
            setLoading(false)
          })
      }
    })
  }

  const handleOnCancel = () => {
    onCancel?.()
  }

  const handleGetRuleDetail = () => {
    if (!ruleId) {
      return
    }
    if (timer) {
      clearTimeout(timer)
    }

    timer = setTimeout(() => {
      getTimeEngineRule(ruleId).then((res) => {
        setDetail(res.detail)
      })
    }, 200)
  }

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        name: detail.name,
        category: detail.category,
        rule: detail.rule,
        status: detail.status,
        remark: detail.remark
      })
    } else {
      form.resetFields()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail])

  useEffect(() => {
    if (ruleId && open) {
      handleGetRuleDetail()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleId, open])

  useEffect(() => {
    if (category) {
      form.setFieldsValue({
        rule: []
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  return (
    <>
      <Modal
        title={`${ruleId ? '编辑' : '新增'}时间引擎规则`}
        open={open}
        onOk={handleOnOk}
        onCancel={handleOnCancel}
        loading={loading}
      >
        <Form form={form} layout='vertical' autoComplete='off'>
          <Form.Item label='名称' name='name' rules={[{ required: true, message: '请输入名称' }]}>
            <Input placeholder='请输入名称' />
          </Form.Item>
          <Form.Item label='类型' name='category' rules={[{ required: true, message: '请选择类型' }]}>
            <Select
              placeholder='请选择类型'
              options={Object.entries(TimeEngineRuleTypeData)
                .filter(([key]) => +key !== TimeEngineRuleType.TimeEngineRuleTypeUnknown)
                .map(([key, value]) => {
                  const { icon, label } = value
                  return {
                    value: +key,
                    label: (
                      <Space direction='horizontal'>
                        <Avatar size='small' shape='square' icon={icon} />
                        {label}
                      </Space>
                    )
                  }
                })}
            />
          </Form.Item>
          {category === TimeEngineRuleType.TimeEngineRuleTypeDaysOfMonth && (
            <Form.Item label='规则' rules={[{ required: true, message: '请输入规则' }]}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['rule', 0]}>
                    <Select placeholder='请选择开始日期' options={dayOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['rule', 1]}>
                    <Select placeholder='请选择结束日期' options={dayOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          )}
          {category === TimeEngineRuleType.TimeEngineRuleTypeDaysOfWeek && (
            <Form.Item label='规则' name='rule' rules={[{ required: true, message: '请输入规则' }]}>
              <Select placeholder='请选择规则' options={weekOptions} mode='multiple' />
            </Form.Item>
          )}
          {category === TimeEngineRuleType.TimeEngineRuleTypeMonths && (
            <Form.Item label='规则' name='rule' rules={[{ required: true, message: '请输入规则' }]}>
              <Select placeholder='请选择规则' options={monthOptions} mode='multiple' />
            </Form.Item>
          )}
          {category === TimeEngineRuleType.TimeEngineRuleTypeHourRange && (
            <Form.Item label='规则' name='rule' rules={[{ required: true, message: '请输入规则' }]}>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['rule', 0]}>
                    <Select placeholder='请选择开始时间' options={hourOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['rule', 1]}>
                    <Select placeholder='请选择结束时间' options={hourOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          )}
          <Form.Item label='备注' name='remark'>
            <Input.TextArea placeholder='请输入备注' showCount maxLength={200} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
