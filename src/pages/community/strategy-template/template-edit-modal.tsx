import { ConditionData, SustainTypeData } from '@/api/global'
import PromQLInput from '@/components/data/child/prom-ql'
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Row,
  Select,
  theme,
} from 'antd'
import React, { useEffect, useState } from 'react'
import { LevelItemType, TemplateEditModalFormData } from './options'
import {
  MutationStrategyLevelTemplateType,
  StrategyLevelIDType,
} from '@/api/template/types'
import { getStrategyTemplate } from '@/api/template'

const { useToken } = theme

export type TemplateEditModalData = {
  id?: number
  // 策略名称
  alert: string
  // 策略表达式
  expr: string
  // 策略说明信息
  remark: string
  // 标签
  labels: Record<string, string>
  // 注解
  annotations: Record<string, string>
  // 策略等级
  level: Record<StrategyLevelIDType, MutationStrategyLevelTemplateType>
  // 策略模板类型
  categoriesIds: number[]
}

export interface TemplateEditModalProps extends ModalProps {
  templateId?: number
  disabled?: boolean
  submit?: (data: TemplateEditModalData) => Promise<void>
}

export const TemplateEditModal: React.FC<TemplateEditModalProps> = (props) => {
  const { onCancel, submit, open, title, templateId, disabled } = props

  const { token } = useToken()

  const [form] = Form.useForm<TemplateEditModalFormData>()
  const datasource = Form.useWatch('datasource', form) || ''
  const [loading, setLoading] = useState(false)

  const [templdateDetail, setTemplateDetail] =
    useState<TemplateEditModalFormData>()

  const getTemplateDetail = async () => {
    if (templateId) {
      setLoading(true)
      const res = await getStrategyTemplate(templateId)
      const { alert, expr, labels, levels, annotations, remark, categories } =
        res
      setTemplateDetail({
        alert,
        expr,
        labelsItems: Object.entries(labels).map(([key, value]) => ({
          key,
          value,
        })),
        annotations,
        remark,
        levelItems: levels.map((item): LevelItemType => {
          const {
            condition,
            count,
            duration,
            levelId,
            sustainType,
            threshold,
            status,
            id,
          } = item
          const levelItem: LevelItemType = {
            condition: condition,
            count: count,
            duration: +duration?.split('s')?.[0] || 0,
            levelId: levelId,
            sustainType: sustainType,
            threshold: threshold,
            status: status,
            id: id,
          }
          return levelItem
        }),
        categoriesIds:
          categories?.map((item) => {
            return item.value
          }) || [],
      })
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!templateId) {
      setTemplateDetail(undefined)
    }
    getTemplateDetail()
  }, [templateId])

  useEffect(() => {
    if (open && form && templdateDetail) {
      form.setFieldsValue(templdateDetail)
      return
    }
    form.resetFields()
  }, [templdateDetail, open, form])

  const handleOnCancel = (e: React.MouseEvent<HTMLButtonElement>) => {
    onCancel?.(e)
    form.resetFields()
    setTemplateDetail(undefined)
  }

  const handleOnOk = () => {
    form.validateFields().then((formValues) => {
      const {
        alert,
        expr,
        remark,
        annotations,
        labelsItems,
        levelItems,
        categoriesIds,
      } = formValues
      // 使用 reduce 方法将数组转换为 Map
      const labels = labelsItems.reduce(
        (acc: Record<string, string>, { key, value }) => {
          acc[key] = value
          return acc
        },
        {}
      )
      const levelMap = levelItems.reduce(
        (
          acc: Record<StrategyLevelIDType, MutationStrategyLevelTemplateType>,
          {
            condition,
            count,
            duration,
            sustainType,
            threshold,
            levelId,
            status,
            id,
          }
        ) => {
          acc[levelId] = {
            condition: condition,
            count: count,
            duration: `${duration}s`,
            sustainType: sustainType,
            threshold: threshold,
            id: id,
            levelId: levelId,
            status: status,
          }
          return acc
        },
        {}
      )
      setLoading(true)
      submit?.({
        id: templateId,
        alert: alert,
        expr: expr,
        remark: remark,
        labels: labels,
        annotations: annotations,
        level: levelMap,
        categoriesIds: categoriesIds,
      }).then(() => {
        setLoading(false)
        form?.resetFields()
      })
    })
  }

  return (
    <>
      <Modal
        className='modal'
        {...props}
        title={title}
        open={open}
        onCancel={handleOnCancel}
        onOk={handleOnOk}
        confirmLoading={loading}
      >
        <div className='edit-content'>
          <Form
            form={form}
            layout='vertical'
            autoComplete='off'
            disabled={disabled || loading}
          >
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label='模板名称'
                  name='alert'
                  rules={[{ required: true, message: '请输入模板名称' }]}
                >
                  <Input placeholder='请输入模板名称' allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label='数据源'
                  name='datasource'
                  initialValue='http://localhost:9090/'
                  rules={[
                    {
                      required: true,
                      message: '请输入模板测试数据源（用于辅助模板编辑）',
                    },
                  ]}
                >
                  <Input placeholder='请输入数据源' allowClear />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              label='模板类型'
              name='categoriesIds'
              rules={[{ required: true, message: '请选择模板类型' }]}
            >
              <Select mode='multiple' allowClear placeholder='请选择模板类型'>
                <Select.Option value={1}>类目一</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label='模板说明' name='remark'>
              <Input.TextArea
                placeholder='请输入模板说明'
                allowClear
                maxLength={200}
                showCount
              />
            </Form.Item>
            <Form.Item
              label='查询语句'
              name='expr'
              rules={[{ required: true, message: '请输入查询语句' }]}
            >
              <PromQLInput pathPrefix={datasource} formatExpression />
            </Form.Item>
            <Form.Item label={<b>标签</b>} required>
              <Form.List
                name='labelsItems'
                rules={[
                  {
                    message: '请输入至少一个标签',
                    validator(_, value, callback) {
                      if (value.length === 0) {
                        callback('请输入至少一个标签')
                      } else {
                        callback()
                      }
                    },
                  },
                ]}
              >
                {(fields, { add, remove }) => (
                  <div key={`${fields.length}_1`}>
                    <Row gutter={12} wrap>
                      {fields.map(({ key, name, ...restField }) => (
                        <>
                          <Col span={4} key={`${key}_1`}>
                            <Form.Item
                              {...restField}
                              name={[name, 'key']}
                              label={[name, 'key'].join('.')}
                              rules={[
                                {
                                  required: true,
                                  message: '标签Key不允许为空',
                                },
                              ]}
                            >
                              <Input placeholder='key' />
                            </Form.Item>
                          </Col>
                          <Col span={8} key={`${key}_2`}>
                            <span
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                              }}
                            >
                              <Form.Item
                                {...restField}
                                name={[name, 'value']}
                                label={[name, 'value'].join('.')}
                                rules={[
                                  {
                                    required: true,
                                    message: '标签值不允许为空',
                                  },
                                ]}
                                style={{ flex: 1 }}
                              >
                                <Input placeholder='value' />
                              </Form.Item>
                              <MinusCircleOutlined
                                onClick={() => remove(name)}
                                style={{ color: token.colorError }}
                              />
                            </span>
                          </Col>
                        </>
                      ))}
                    </Row>
                    <Form.Item>
                      <Button
                        type='dashed'
                        onClick={() => add()}
                        block
                        icon={<PlusOutlined />}
                      >
                        添加新标签
                      </Button>
                    </Form.Item>
                  </div>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item label={<b>注解</b>} required>
              <Form.Item
                name={['annotations', 'summary']}
                label='告警摘要'
                rules={[{ required: true, message: '请输入告警摘要' }]}
              >
                <Input.TextArea placeholder='请输入告警摘要' allowClear />
                {/* <AnnotationEditor /> */}
              </Form.Item>
              <Form.Item
                name={['annotations', 'description']}
                label='告警明细'
                rules={[{ required: true, message: '请输入告警明细' }]}
              >
                <Input.TextArea placeholder='请输入告警明细' allowClear />
              </Form.Item>
            </Form.Item>

            <Form.Item label={<b>告警等级</b>} required>
              <Form.List name='levelItems'>
                {(fields, { add, remove }) => (
                  <div
                    style={{
                      display: 'flex',
                      rowGap: 16,
                      flexDirection: 'column',
                    }}
                  >
                    {fields.map((field) => (
                      <Card
                        size='small'
                        title={`策略等级明细 ${field.name + 1}`}
                        key={field.key}
                        extra={
                          <MinusCircleOutlined
                            style={{ color: token.colorError }}
                            onClick={() => {
                              remove(field.name)
                            }}
                          />
                        }
                      >
                        <Row gutter={12}>
                          <Col span={12}>
                            <Form.Item
                              label='告警等级'
                              name={[field.name, 'levelId']}
                              rules={[
                                {
                                  required: true,
                                  message: '请选择告警等级',
                                },
                              ]}
                            >
                              <Select placeholder='请选择策略等级'>
                                <Select.Option value={1}>
                                  一级告警
                                </Select.Option>
                                <Select.Option value={2}>
                                  二级告警
                                </Select.Option>
                                <Select.Option value={3}>
                                  三级告警
                                </Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label='判断条件'
                              name={[field.name, 'condition']}
                              rules={[
                                {
                                  required: true,
                                  message: '请选择判断条件',
                                },
                              ]}
                            >
                              <Select
                                placeholder='请选择判断条件'
                                options={Object.entries(ConditionData).map(
                                  ([key, value]) => ({
                                    value: +key,
                                    label: value,
                                  })
                                )}
                              ></Select>
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label='阈值'
                              name={[field.name, 'threshold']}
                              rules={[
                                {
                                  required: true,
                                  message: '请输入阈值',
                                },
                              ]}
                            >
                              <InputNumber
                                style={{ width: '100%' }}
                                placeholder='请输入阈值'
                              />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label='触发类型'
                              name={[field.name, 'sustainType']}
                              rules={[
                                {
                                  required: true,
                                  message: '请选择触发类型',
                                },
                              ]}
                            >
                              <Select
                                placeholder='请选择触发类型'
                                options={Object.entries(SustainTypeData).map(
                                  ([key, value]) => ({
                                    value: +key,
                                    label: value,
                                  })
                                )}
                              ></Select>
                            </Form.Item>
                          </Col>

                          <Col span={6}>
                            <Form.Item
                              label='持续时间'
                              name={[field.name, 'duration']}
                              initialValue={10}
                              rules={[
                                {
                                  required: true,
                                  message: '请输入持续时间',
                                },
                              ]}
                            >
                              <InputNumber
                                addonAfter='秒'
                                style={{ width: '100%' }}
                                placeholder='请输入持续时间'
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label='持续次数'
                              name={[field.name, 'count']}
                              initialValue={1}
                              rules={[
                                {
                                  required: true,
                                  message: '请输入持续次数',
                                },
                              ]}
                            >
                              <InputNumber
                                addonAfter='次'
                                style={{ width: '100%' }}
                                placeholder='请输入持续次数'
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                      </Card>
                    ))}

                    <Button
                      type='dashed'
                      onClick={() => add()}
                      block
                      icon={<PlusOutlined />}
                    >
                      添加策略等级
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form.Item>
          </Form>
        </div>
      </Modal>
    </>
  )
}
