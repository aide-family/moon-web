import { getDatasourceList } from '@/api/datasource'
import { DatasourceItemType } from '@/api/datasource/types'
import { featchDictListByCrategory } from '@/api/dict'
import { DictType } from '@/api/dict/types'
import {
  Condition,
  ConditionData,
  Status,
  StorageType,
  StorageTypeData,
  SustainType,
  SustainTypeData
} from '@/api/global'
import { getStrategyTemplate, validateAnnotationTemplate } from '@/api/template'
import { AnnotationsEditor } from '@/components/data/child/annotation-editor'
import FetchSelect from '@/components/data/child/fetch-select'
import PromQLInput from '@/components/data/child/prom-ql'
import { MinusCircleOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  InputNumber,
  Modal,
  ModalProps,
  Popover,
  Radio,
  Row,
  Select,
  Space,
  theme,
  Typography
} from 'antd'
import React, { useEffect, useState } from 'react'
import styles from './index.module.scss'
import { MetricEditModalFormData } from './options'
const { useToken } = theme

/** 策略等级类型 */
export interface StrategyLevelTemplateType {
  // 策略持续时间
  duration: number
  // 持续次数
  count: number
  // 持续的类型
  sustainType: SustainType
  // 条件
  condition: Condition
  // 阈值
  threshold: number
  // ID
  id?: number
  // LevelID
  levelId: number
  // 状态
  status: Status
}

export type MetricEditModalData = {
  id?: number
  // 策略名称
  name: string
  // 策略表达式
  expr: string
  // 策略说明信息
  remark: string
  // 标签字典
  labels: Record<string, string>
  // 注解
  annotations: Record<string, string>
  // 策略模板类型
  categoriesIds: number[]
  // 策略组ID
  groupId: number
  // 采样率
  step: number
  // 数据源id
  datasourceIds: number[]
  strategyLevel: StrategyLevelTemplateType[]
  alarmGroupIds: number[]
}

export interface TemplateEditModalProps extends ModalProps {
  templateId?: number
  disabled?: boolean
  submit?: (data: MetricEditModalData) => Promise<void>
}

let summaryTimeout: NodeJS.Timeout | null = null
let descriptionTimeout: NodeJS.Timeout | null = null
export const MetricEditModal: React.FC<TemplateEditModalProps> = (props) => {
  const { onCancel, submit, open, title, templateId, disabled } = props

  const { token } = useToken()

  const [form] = Form.useForm<MetricEditModalFormData>()
  const datasourceType = Form.useWatch<StorageType>('sourceType', form)
  const summary = Form.useWatch(['annotations', 'summary'], form)
  const description = Form.useWatch(['annotations', 'description'], form)
  const [summaryOkInfo, setSummaryOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: ''
  })
  const [descriptionOkInfo, setDescriptionOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: ''
  })

  const [loading, setLoading] = useState(false)
  const [datasourceList, setDatasourceList] = useState<DatasourceItemType[]>([])
  const [templdateDetail, setTemplateDetail] = useState<MetricEditModalFormData>()

  const getTemplateDetail = async () => {
    if (templateId) {
      setLoading(true)
      const res = await getStrategyTemplate(templateId)
      // const { expr, labels, levels, annotations, remark, categories } = res
      // setTemplateDetail({
      //   expr,
      //   labelsItems: Object.entries(labels).map(([key, value]) => ({
      //     key,
      //     value
      //   })),
      //   annotations,
      //   remark,
      //   levelItems: levels.map((item): LevelItemType => {
      //     const { condition, count, duration, levelId, sustainType, threshold, status, id } = item
      //     const levelItem: LevelItemType = {
      //       condition: condition,
      //       count: count,
      //       duration: +duration?.split('s')?.[0] || 0,
      //       levelId: levelId,
      //       sustainType: sustainType,
      //       threshold: threshold,
      //       status: status,
      //       id: id
      //     }
      //     return levelItem
      //   }),
      //   categoriesIds:
      //     categories?.map((item) => {
      //       return item.value
      //     }) || []
      // })
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!datasourceType) return
    getDatasourceList({
      storageType: datasourceType,
      pagination: {
        pageNum: 1,
        pageSize: 999
      }
    }).then((res) => {
      setDatasourceList(res?.list || [])
    })
  }, [datasourceType, open])

  useEffect(() => {
    if (!templateId) {
      setTemplateDetail(undefined)
    }
    getTemplateDetail()
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const checkExpression = (tmpValue: string) => {
    const { labels, expr, datasource, strategyLevel } = form.getFieldsValue()
    if (!tmpValue || !datasource) return
    const level = strategyLevel?.[0]
    return validateAnnotationTemplate({
      annotations: tmpValue,
      expr: expr,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      labels: labels?.reduce((acc: any, { key, value }) => {
        acc[key] = value
        return acc
      }),
      level: 'levelItems?.[0]?.levelId',
      datasource: datasource,
      datasourceId: 0,
      duration: `${level?.duration}s`,
      count: level?.count,
      sustainType: level?.sustainType
    })
  }

  useEffect(() => {
    if (!description) return
    if (descriptionTimeout) {
      clearTimeout(descriptionTimeout)
    }
    descriptionTimeout = setTimeout(() => {
      checkExpression(description)?.then((res) => {
        if (res?.errors) {
          form.setFields([
            {
              name: ['annotations', 'description'],
              errors: [res.errors],
              // value: description,
              touched: true,
              validating: false,
              validated: false
            }
          ])
        } else {
          setDescriptionOkInfo({
            info: res?.annotations || ''
          })
        }
      })
    }, 500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [description])

  useEffect(() => {
    if (!summary) return
    if (summaryTimeout) {
      clearTimeout(summaryTimeout)
    }
    summaryTimeout = setTimeout(() => {
      checkExpression(summary)?.then((res) => {
        if (res?.errors) {
          form.setFields([
            {
              name: ['annotations', 'summary'],
              errors: [res.errors],
              // value: summary,
              touched: true,
              validating: false,
              validated: false
            }
          ])
        } else {
          setSummaryOkInfo({
            info: res?.annotations || ''
          })
        }
      })
    }, 500)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary])

  const handleOnOk = () => {
    form.validateFields().then((formValues) => {
      console.log(formValues)
      const {
        name,
        expr,
        remark,
        annotations,
        alarmGroupIds,
        labels,
        categoriesIds,
        groupId,
        step,
        datasourceIds,
        strategyLevel
      } = formValues
      // 使用 reduce 方法将数组转换为 Map
      const labelsItems = labels.reduce((acc: Record<string, string>, { key, value }) => {
        acc[key] = value
        return acc
      }, {})

      setLoading(true)
      submit?.({
        id: templateId,
        name,
        expr,
        remark,
        labels: labelsItems,
        annotations,
        categoriesIds,
        groupId,
        step,
        datasourceIds,
        strategyLevel,
        alarmGroupIds
      })
        .then(() => {
          form?.resetFields()
        })
        .finally(() => {
          setLoading(false)
        })
    })
  }

  return (
    <>
      <Modal
        className={styles.modal}
        {...props}
        title={title}
        open={open}
        onCancel={handleOnCancel}
        onOk={handleOnOk}
        confirmLoading={loading}
      >
        <div className={styles.edit_content}>
          <Form form={form} layout='vertical' autoComplete='off' disabled={disabled || loading}>
            <Form.Item
              initialValue={StorageType.StorageTypePrometheus}
              label='数据源类型'
              name='sourceType'
              rules={[{ required: true, message: '请选择数据源类型' }]}
            >
              <Radio.Group
                value={1}
                optionType='button'
                options={Object.entries(StorageTypeData)
                  .filter(([key]) => Number(key) !== StorageType.StorageTypeUnknown)
                  .map(([key, value]) => ({
                    label: value,
                    value: Number(key)
                  }))}
              />
            </Form.Item>
            <Form.Item
              label='数据源'
              name='datasourceIds'
              rules={[
                {
                  required: true,
                  message: '请选择数据源'
                }
              ]}
            >
              <Select
                mode='multiple'
                allowClear
                placeholder='请选择数据源'
                options={datasourceList.map((item) => ({
                  label: item.name,
                  value: item.id,
                  disabled: item.status !== Status.ENABLE
                }))}
              />
            </Form.Item>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item label='策略名称' name='name' rules={[{ required: true, message: '请输入策略名称' }]}>
                  <Input placeholder='请输入策略名称' allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label='策略组' name='groupId' rules={[{ required: true, message: '请选择策略组' }]}>
                  <Select allowClear placeholder='请选择策略组'>
                    <Select.Option value={1}>类目一</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item
                  label='策略类型'
                  name='categoriesIds'
                  rules={[{ required: true, message: '请选择策略类型' }]}
                >
                  <FetchSelect
                    selectProps={{
                      placeholder: '请选择策略类型',
                      mode: 'multiple'
                    }}
                    handleFetch={featchDictListByCrategory(DictType.DictTypePromStrategy)}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label='采样率' name='step' rules={[{ required: true, message: '请输入采样率' }]}>
                  <InputNumber style={{ width: '100%' }} placeholder='请输入采样率' step={1} min={1} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label='通知对象'
              name='alarmGroupIds'
              rules={[
                {
                  required: false,
                  message: '请选择通知对象'
                }
              ]}
            >
              <Select mode='multiple' allowClear placeholder='请选择通知对象'>
                <Select.Option value={1}>类目一</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item label='查询语句' name='expr' rules={[{ required: true, message: '请检查查询语句' }]}>
              <PromQLInput pathPrefix={datasourceList.at(0)?.endpoint || ''} formatExpression disabled={disabled} />
            </Form.Item>
            <Form.Item label={<b>标签kv集合</b>} required>
              <Form.List
                name='labels'
                rules={[
                  {
                    message: '请输入至少一个标签',
                    validator(_, value, callback) {
                      if (value.length === 0) {
                        callback('请输入至少一个标签')
                      } else {
                        callback()
                      }
                    }
                  }
                ]}
              >
                {(fields, { add, remove }) => (
                  <div key={`${fields.length}_1`}>
                    <Row gutter={12} wrap>
                      {fields.map(({ key, name, ...restField }) => (
                        <Col span={12} key={key}>
                          <Row gutter={12} style={{ width: '200%' }}>
                            <Col span={4}>
                              <Form.Item
                                {...restField}
                                name={[name, 'key']}
                                label={[name, 'key'].join('.')}
                                rules={[
                                  {
                                    required: true,
                                    message: '标签Key不允许为空'
                                  }
                                ]}
                              >
                                <Input placeholder='key' />
                              </Form.Item>
                            </Col>
                            <Col span={8}>
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 8
                                }}
                              >
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  label={[name, 'value'].join('.')}
                                  rules={[
                                    {
                                      required: true,
                                      message: '标签值不允许为空'
                                    }
                                  ]}
                                  style={{ flex: 1 }}
                                >
                                  <Input placeholder='value' />
                                </Form.Item>
                                <MinusCircleOutlined onClick={() => remove(name)} style={{ color: token.colorError }} />
                              </span>
                            </Col>
                          </Row>
                        </Col>
                      ))}
                    </Row>
                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                      添加新标签
                    </Button>
                  </div>
                )}
              </Form.List>
            </Form.Item>

            <Form.Item tooltip='注解用于告警展示的内容编辑' label={<b>注解</b>} required>
              <Form.Item
                name={['annotations', 'summary']}
                label={
                  <Space size={8}>
                    告警摘要
                    <Popover
                      title='告警摘要, 告警内容如下所示'
                      content={
                        <Typography.Text ellipsis copyable style={{ width: '30vw' }}>
                          {summaryOkInfo.info}
                        </Typography.Text>
                      }
                    >
                      <QuestionCircleOutlined />
                    </Popover>
                  </Space>
                }
                rules={[{ required: true, message: '请输入告警摘要' }]}
              >
                <AnnotationsEditor labels={summaryOkInfo.labels} language='summary' disabled={disabled} />
              </Form.Item>
              <Form.Item
                name={['annotations', 'description']}
                label={
                  <Space size={8}>
                    告警明细
                    <Popover
                      title='告警明细, 告警内容如下所示'
                      content={
                        <Typography.Text ellipsis copyable style={{ width: '30vw' }}>
                          {descriptionOkInfo.info}
                        </Typography.Text>
                      }
                    >
                      <QuestionCircleOutlined />
                    </Popover>
                  </Space>
                }
                rules={[{ required: true, message: '请输入告警明细' }]}
              >
                <AnnotationsEditor
                  height={64 * 2}
                  labels={descriptionOkInfo.labels}
                  language='description'
                  disabled={disabled}
                />
              </Form.Item>
            </Form.Item>

            <Form.Item label={<b>告警等级</b>} required>
              <Form.List name='strategyLevel'>
                {(fields, { add, remove }) => (
                  <div
                    style={{
                      display: 'flex',
                      rowGap: 16,
                      flexDirection: 'column'
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
                                  message: '请选择告警等级'
                                }
                              ]}
                            >
                              <FetchSelect
                                selectProps={{
                                  placeholder: '请选择告警等级'
                                }}
                                handleFetch={featchDictListByCrategory(DictType.DictTypeAlarmLevel)}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label='判断条件'
                              name={[field.name, 'condition']}
                              rules={[
                                {
                                  required: true,
                                  message: '请选择判断条件'
                                }
                              ]}
                            >
                              <Select
                                placeholder='请选择判断条件'
                                options={Object.entries(ConditionData).map(([key, value]) => ({
                                  value: +key,
                                  label: value
                                }))}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label='阈值'
                              name={[field.name, 'threshold']}
                              rules={[
                                {
                                  required: true,
                                  message: '请输入阈值'
                                }
                              ]}
                            >
                              <InputNumber style={{ width: '100%' }} placeholder='请输入阈值' />
                            </Form.Item>
                          </Col>
                          <Col span={12}>
                            <Form.Item
                              label='触发类型'
                              name={[field.name, 'sustainType']}
                              rules={[
                                {
                                  required: true,
                                  message: '请选择触发类型'
                                }
                              ]}
                            >
                              <Select
                                placeholder='请选择触发类型'
                                options={Object.entries(SustainTypeData).map(([key, value]) => ({
                                  value: +key,
                                  label: value
                                }))}
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
                                  message: '请输入持续时间'
                                }
                              ]}
                            >
                              <InputNumber addonAfter='秒' style={{ width: '100%' }} placeholder='请输入持续时间' />
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
                                  message: '请输入持续次数'
                                }
                              ]}
                            >
                              <InputNumber addonAfter='次' style={{ width: '100%' }} placeholder='请输入持续次数' />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Form.Item
                              label='告警页面'
                              name={[field.name, 'alarmPageIds']}
                              rules={[
                                {
                                  required: true,
                                  message: '请选择告警页面'
                                }
                              ]}
                            >
                              <FetchSelect
                                selectProps={{
                                  placeholder: '请选择告警页面',
                                  mode: 'multiple'
                                }}
                                handleFetch={featchDictListByCrategory(DictType.DictTypeAlarmPage)}
                              />
                            </Form.Item>
                          </Col>
                        </Row>
                        <Row>
                          <Col span={24}>
                            <Form.Item
                              label='通知对象'
                              name={[field.name, 'alarmGroupIds']}
                              rules={[
                                {
                                  required: false,
                                  message: '请选择通知对象'
                                }
                              ]}
                            >
                              <Select mode='multiple' allowClear placeholder='请选择通知对象'>
                                <Select.Option value={1}>类目一</Select.Option>
                              </Select>
                            </Form.Item>
                          </Col>
                        </Row>
                        <Form.Item label={<b>label通知对象</b>} required>
                          <Form.List
                            name={[field.name, 'strategyLabels']}
                            rules={[
                              {
                                message: '请输入至少一个标签',
                                validator(_, value, callback) {
                                  if (value.length === 0) {
                                    callback('请输入至少一个标签')
                                  } else {
                                    callback()
                                  }
                                }
                              }
                            ]}
                          >
                            {(fields, { add, remove }) => (
                              <div key={`${fields.length}_1`}>
                                <Row gutter={24} wrap>
                                  {fields.map(({ key, name, ...restField }) => (
                                    <Col span={24} key={key}>
                                      <span
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: 8
                                        }}
                                      >
                                        <Row gutter={24} style={{ width: '100%' }}>
                                          <Col span={10}>
                                            <Form.Item
                                              name={[name, 'name']}
                                              label={[name, 'name'].join('.')}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: '标签Key不允许为空'
                                                }
                                              ]}
                                            >
                                              <Input placeholder='key' />
                                            </Form.Item>
                                          </Col>
                                          <Col span={14}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, 'value']}
                                              label={[name, 'value'].join('.')}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: '标签值不允许为空'
                                                }
                                              ]}
                                              style={{ flex: 1 }}
                                            >
                                              <Input placeholder='value' />
                                            </Form.Item>
                                          </Col>
                                          <Col span={24}>
                                            <Form.Item
                                              {...restField}
                                              name={[name, 'alarmGroupIds']}
                                              label={[name, '通知对象'].join('.')}
                                              rules={[
                                                {
                                                  required: true,
                                                  message: '标签值不允许为空'
                                                }
                                              ]}
                                              style={{ flex: 1 }}
                                            >
                                              <Input placeholder='通知对象' />
                                            </Form.Item>
                                          </Col>
                                        </Row>
                                        <MinusCircleOutlined
                                          onClick={() => remove(name)}
                                          style={{ color: token.colorError }}
                                        />
                                      </span>
                                    </Col>
                                  ))}
                                </Row>
                                <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
                                  添加新 label 通知对象
                                </Button>
                              </div>
                            )}
                          </Form.List>
                        </Form.Item>
                      </Card>
                    ))}
                    <Button type='dashed' onClick={() => add()} block icon={<PlusOutlined />}>
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
