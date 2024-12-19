import { Condition, DatasourceType, Status, StrategyType, SustainType } from '@/api/enum'
import { ConditionData, defaultPaginationReq, SustainTypeData } from '@/api/global'
import { StrategyItem } from '@/api/model-types'
import { baseURL } from '@/api/request'
import {
  createStrategy,
  CreateStrategyRequestFormData,
  parseFormDataToStrategyLabels,
  parseMetricStrategyDetailToFormData,
  updateStrategy
} from '@/api/strategy'
import { AnnotationsEditor } from '@/components/data/child/annotation-editor'
import PromQLInput from '@/components/data/child/prom-ql'
import {
  useAlarmLevelList,
  useAlarmNoticeGroupList,
  useAlarmPageList,
  useDatasourceList,
  useStrategyCategoryList,
  useStrategyGroupList
} from '@/hooks/select'
import { useSubmit } from '@/hooks/submit'
import { GlobalContext } from '@/utils/context'
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
  Row,
  Select,
  Space,
  Tag,
  theme,
  Typography
} from 'antd'
import { useContext, useEffect, useState } from 'react'

export interface MetricEditModalProps extends ModalProps {
  strategyDetail?: StrategyItem
}

export default function MetricEditModal(props: MetricEditModalProps) {
  const { strategyDetail, onOk, ...restProps } = props
  const { token } = theme.useToken()
  const { teamInfo } = useContext(GlobalContext)

  const [form] = Form.useForm<CreateStrategyRequestFormData>()
  const selectDatasource = Form.useWatch('datasourceIds', form)

  const [loading, setLoading] = useState(false)
  const { datasourceList, datasourceListLoading } = useDatasourceList({
    datasourceType: DatasourceType.DatasourceTypeMetric,
    pagination: defaultPaginationReq
  })
  const { strategyGroupList, strategyGroupListLoading } = useStrategyGroupList({
    pagination: defaultPaginationReq
  })
  const { strategyCategoryList, strategyCategoryListLoading } = useStrategyCategoryList({
    pagination: defaultPaginationReq
  })
  const { alarmGroupList, alarmGroupListLoading } = useAlarmNoticeGroupList({
    pagination: defaultPaginationReq
  })
  const { alarmPageList, alarmPageListLoading } = useAlarmPageList({
    pagination: defaultPaginationReq
  })
  const { alarmLevelList, alarmLevelListLoading } = useAlarmLevelList({
    pagination: defaultPaginationReq
  })
  const { submit } = useSubmit(updateStrategy, createStrategy, strategyDetail?.id)

  const [descriptionOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: ''
  })
  const [summaryOkInfo] = useState<{
    info: string
    labels?: string[]
  }>({
    info: ''
  })

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    setLoading(true)
    form
      .validateFields()
      .then((values) => {
        const submitValues = {
          ...values,
          labels: parseFormDataToStrategyLabels(values.labels)
        }
        // return
        if (strategyDetail) {
          return submit({ data: submitValues, id: strategyDetail?.id })
        } else {
          return submit(submitValues)
        }
      })
      .then(() => {
        onOk?.(e)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    if (restProps.open) {
      if (strategyDetail) {
        form.setFieldsValue(parseMetricStrategyDetailToFormData(strategyDetail))
      } else {
        form.resetFields()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strategyDetail, restProps.open])

  const pathPrefix = `${baseURL}/metric/${teamInfo?.id || 0}/${selectDatasource?.at(0) || 0}`

  return (
    <Modal {...restProps} onOk={handleSubmit} confirmLoading={loading}>
      <div className='max-h-[70vh] overflow-y-auto overflow-x-hidden'>
        <Form form={form} layout='vertical' autoComplete='off' disabled={loading}>
          <Form.Item name='strategyType' initialValue={StrategyType.StrategyTypeMetric} className='hidden'>
            <Input className='hidden' />
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
              loading={datasourceListLoading}
              placeholder='请选择数据源'
              options={datasourceList.map((item) => ({
                label: item.name,
                value: item.id,
                disabled: item.status !== Status.StatusEnable
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
                <Select
                  placeholder='请选择策略组'
                  allowClear
                  loading={strategyGroupListLoading}
                  options={strategyGroupList.map((item) => ({
                    label: item.name,
                    value: item.id,
                    disabled: item.status !== Status.StatusEnable
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item label='策略类型' name='categoriesIds' rules={[{ required: true, message: '请选择策略类型' }]}>
            <Select
              placeholder='请选择策略类型'
              allowClear
              loading={strategyCategoryListLoading}
              mode='multiple'
              options={strategyCategoryList.map((item) => ({
                label: (
                  <Tag bordered={false} color={item.extend?.color}>
                    {item.label}
                  </Tag>
                ),
                value: item.value,
                disabled: item.disabled
              }))}
            />
          </Form.Item>

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
            <Select
              placeholder='请选择通知对象'
              allowClear
              mode='multiple'
              loading={alarmGroupListLoading}
              options={alarmGroupList.map((item) => ({
                label: item.name,
                value: item.id,
                disabled: item.status !== Status.StatusEnable
              }))}
            />
          </Form.Item>
          <Form.Item label='查询语句' name='expr' rules={[{ required: true, message: '请检查查询语句' }]}>
            <PromQLInput pathPrefix={pathPrefix} formatExpression disabled={loading} />
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
                        <Row gutter={12} className='w-[200%]'>
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
                            <span className='flex items-center gap-2'>
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
                                className='flex-1'
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
                      <Typography.Text ellipsis copyable className='w-[30vw]'>
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
              <AnnotationsEditor labels={summaryOkInfo.labels} language='summary' disabled={loading} />
            </Form.Item>
            <Form.Item
              name={['annotations', 'description']}
              label={
                <Space size={8}>
                  告警明细
                  <Popover
                    title='告警明细, 告警内容如下所示'
                    content={
                      <Typography.Text ellipsis copyable className='w-[30vw]'>
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
                disabled={loading}
              />
            </Form.Item>
          </Form.Item>

          <Form.Item label={<b>告警等级</b>} required>
            <Form.List name='strategyMetricLevels'>
              {(fields, { add, remove }) => (
                <div className='flex flex-col gap-4'>
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
                            <Select
                              placeholder='请选择告警等级'
                              loading={alarmLevelListLoading}
                              options={alarmLevelList.map((item) => ({
                                label: (
                                  <Tag bordered={false} color={item.extend?.color}>
                                    {item.label}
                                  </Tag>
                                ),
                                value: item.value,
                                disabled: item.disabled
                              }))}
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
                              options={Object.entries(ConditionData)
                                .filter(([key]) => +key !== Condition.ConditionUnknown)
                                .map(([key, value]) => ({
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
                            <InputNumber className='w-full' placeholder='请输入阈值' />
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
                              options={Object.entries(SustainTypeData)
                                .filter(([key]) => +key !== SustainType.SustainTypeUnknown)
                                .map(([key, value]) => ({
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
                            <InputNumber addonAfter='秒' className='w-full' placeholder='请输入持续时间' />
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
                            <InputNumber addonAfter='次' className='w-full' placeholder='请输入持续次数' />
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
                            <Select
                              placeholder='请选择告警页面'
                              loading={alarmPageListLoading}
                              mode='multiple'
                              options={alarmPageList.map((item) => ({
                                label: (
                                  <Tag bordered={false} color={item.extend?.color}>
                                    {item.label}
                                  </Tag>
                                ),
                                value: item.value,
                                disabled: item.disabled
                              }))}
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
                            <Select
                              mode='multiple'
                              allowClear
                              loading={alarmGroupListLoading}
                              placeholder='请选择通知对象'
                              options={alarmGroupList.map((item) => ({
                                label: item.name,
                                value: item.id,
                                disabled: item.status !== Status.StatusEnable
                              }))}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      <Form.Item label={<b>label通知对象</b>}>
                        <Form.List name={[field.name, 'strategyLabels']}>
                          {(fields, { add, remove }) => (
                            <div key={`${fields.length}_1`}>
                              <Row gutter={24} wrap>
                                {fields.map(({ key, name, ...restField }) => (
                                  <Col span={24} key={key}>
                                    <span className='flex items-center gap-2'>
                                      <Row gutter={24} className='w-full'>
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
                                            className='flex-1'
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
                                            className='flex-1'
                                          >
                                            <Select
                                              placeholder='请选择通知对象'
                                              loading={alarmGroupListLoading}
                                              options={alarmGroupList.map((item) => ({
                                                label: item.name,
                                                value: item.id,
                                                disabled: item.status !== Status.StatusEnable
                                              }))}
                                            />
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
  )
}
