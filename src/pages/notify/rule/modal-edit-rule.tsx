import { Status, TimeEngineRuleType } from '@/api/enum'
import { TimeEngineRuleTypeData } from '@/api/global'
import { TimeEngineRuleItem } from '@/api/model-types'
import {
  createTimeEngineRule,
  CreateTimeEngineRuleRequest,
  getTimeEngineRule,
  updateTimeEngineRule
} from '@/api/notify/rule'
import { ErrorResponse } from '@/api/request'
import { handleFormError } from '@/utils'
import { useRequest } from 'ahooks'
import { Avatar, Col, Form, Input, Modal, Row, Select, Space } from 'antd'
import { useEffect, useState } from 'react'
import { dayOptions, hourOptions, monthOptions, weekOptions } from './options'

export interface EditRuleModalProps {
  open?: boolean
  ruleId?: number
  onOk?: (rule: CreateTimeEngineRuleRequest) => void
  onCancel?: () => void
}

export function EditRuleModal(props: EditRuleModalProps) {
  const { open, ruleId, onOk, onCancel } = props

  const [form] = Form.useForm<CreateTimeEngineRuleRequest>()

  const category = Form.useWatch('category', form)

  const [loading, setLoading] = useState(false)
  const [detail, setDetail] = useState<TimeEngineRuleItem>()

  const init = () => {
    setDetail(undefined)
    form.resetFields()
  }

  const handleOnOk = () => {
    form.validateFields().then((values) => {
      setLoading(true)
      if (ruleId) {
        updateTimeEngineRule({ id: ruleId, data: values })
          .then(() => {
            init()
            onOk?.(values)
          })
          .catch((err: ErrorResponse) => {
            handleFormError(form, err)
          })
          .finally(() => {
            setLoading(false)
          })
      } else {
        createTimeEngineRule({ ...values, status: Status.StatusEnable })
          .then(() => {
            init()
            onOk?.(values)
          })
          .catch((err: ErrorResponse) => {
            handleFormError(form, err)
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

  const { run: handleGetRuleDetail } = useRequest((id: number) => getTimeEngineRule(id), {
    manual: true, // 手动触发请求
    onSuccess: (res) => {
      setDetail(res.detail)
    }
  })

  useEffect(() => {
    if (detail) {
      form.setFieldsValue({
        name: detail.name,
        category: detail.category,
        rules: detail.rules,
        remark: detail.remark
      })
    } else {
      form.resetFields()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail])

  useEffect(() => {
    init()
    if (ruleId && open) {
      handleGetRuleDetail(ruleId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ruleId, open, handleGetRuleDetail])

  useEffect(() => {
    if (category) {
      form.setFieldsValue({ rules: [] })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category])

  return (
    <>
      <Modal
        title={`${ruleId ? '编辑' : '新增'}规则单元`}
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
            <Form.Item
              label='规则'
              tooltip='日期类型是时间引擎的一种执行单元，他表示在一个月中的某几天范围内，例如表示一个月的上旬，那么表示在1-10号之间，中旬表示在11-20号之间，下旬表示在21-30号之间'
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['rules', 0]}>
                    <Select placeholder='请选择开始日期' options={dayOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['rules', 1]}>
                    <Select placeholder='请选择结束日期' options={dayOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          )}
          {category === TimeEngineRuleType.TimeEngineRuleTypeDaysOfWeek && (
            <Form.Item
              label='规则'
              name='rules'
              rules={[{ required: true, message: '请选择星期' }]}
              tooltip='星期类型是时间引擎的一种执行单元，他表示在一个星期中的某几天，例如工作日，那么表示周一到周五，选择周末，那么表示周六和周日'
            >
              <Select placeholder='请选择星期' options={weekOptions} mode='multiple' />
            </Form.Item>
          )}
          {category === TimeEngineRuleType.TimeEngineRuleTypeMonths && (
            <Form.Item
              label='规则'
              name='rules'
              tooltip='月份类型是时间引擎的一种执行单元，他表示在一年中的某几个月，例如表示一年中的上半年，那么表示1-6月，下半年表示7-12月'
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['rules', 0]} rules={[{ required: true, message: '请选择开始月份' }]}>
                    <Select placeholder='请选择开始月份' options={monthOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['rules', 1]} rules={[{ required: true, message: '请选择结束月份' }]}>
                    <Select placeholder='请选择结束月份' options={monthOptions} />
                  </Form.Item>
                </Col>
              </Row>
            </Form.Item>
          )}
          {category === TimeEngineRuleType.TimeEngineRuleTypeHourRange && (
            <Form.Item
              label='规则'
              name='rules'
              rules={[{ required: true, message: '请选择开始和结束时间' }]}
              tooltip='时间范围类型是时间引擎的一种执行单元，他表示在一天中的某几个小时范围内，例如表示一天的上午，那么表示6-12点之间，下午表示12-18点之间，晚上表示18-0点之间，凌晨表示0-6点之间'
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name={['rules', 0]} rules={[{ required: true, message: '请选择开始时间' }]}>
                    <Select placeholder='请选择开始时间' options={hourOptions} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name={['rules', 1]} rules={[{ required: true, message: '请选择结束时间' }]}>
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
